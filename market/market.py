import sys
sys.path.insert(0, './libs/ml')

import json
import pickle

import traceback
from math import sqrt
from random import sample

import numpy as np
import pandas as pd
from bson.objectid import ObjectId
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from torch.utils.data import DataLoader

from conn import market_col, modelset_col, stock_col
from libs.ml import launcher
from schema import CorpEventInfo, GameInfo
from stock_generator import stock_generator

app = FastAPI()


def add_buy_trend(price: int, volume: int):
    return round(sqrt(volume) * stock_base(price))


def add_sell_trend(price: int, volume: int):
    return -1 * round(sqrt(volume) * stock_base(price))


def stock_base(price):
    """
	return base price of KOSPI market
	"""
    if price < 1000:
        base = 1
    elif price < 5000:
        base = 5
    elif price < 10000:
        base = 10
    elif price < 50000:
        base = 50
    elif price < 100000:
        base = 100
    elif price < 500000:
        base = 500
    else:
        base = 1000
    return base


def stock_round(price):
    """
	return rounded price of KOSPI market
	"""
    base = stock_base(price)
    return base * round(price / base)


def get_current_price(buying_volume: list[int], selling_volume: list[int], stock_info: list[str],
                      result_df: 'pd.DataFrame', target_stocks: int = 5, target_days: int = 3) -> dict:
    """
	NOTICE: order of stock_info is ASC
	`result_df`의 데이터를 바탕으로 샘플링을 진행한 후, (2*days, 2*stock) 형태의 dictionary를 반환하는 function
	"""
    res = {k: {} for k in stock_info}
    target_df = result_df
    for i in range(1, target_stocks + 1):
        price_list = []
        for j in range(target_days):
            upper = target_df[stock_info[i - 1] + '_close_upper'][j] + add_sell_trend(
                target_df[stock_info[i - 1] + '_close_upper'][j], selling_volume[i - 1])
            lower = target_df[stock_info[i - 1] + '_close_lower'][j] + add_buy_trend(
                target_df[stock_info[i - 1] + '_close_lower'][j], buying_volume[i - 1])
            target_range = abs(upper - lower)
            z_score = np.random.normal()
            final_price = stock_round(0.25 * target_range * z_score + (upper + lower) // 2)
            price_list.append(final_price)
        if price_list[0] < price_list[-1]:
            res[stock_info[i - 1]]['info'] = 1
        else:
            res[stock_info[i - 1]]['info'] = 0
        res[stock_info[i - 1]]['price'] = price_list
    return res


def shift_current_price(increment: dict, price: dict) -> 'pd.DataFrame':
    """
	Args:
		increment: 증감량 Dict
		price: shift를 진행한 price DataFrame {ticker_name: [ticker: List[int]]
	Returns: 직접 변동을 적용한 최종 가격을 반환
	increment와 list 사이에 순서가 맞아야하는 점에 집중
	"""
    for ticker, delta in increment.items():
        price[ticker]['price'] = list(map(lambda x: x + delta, price[ticker]['price']))

    return price


@app.post("/model")
def init_model(game_info: GameInfo):
    """
	이미 학습된 모델을 1:1 매칭한 후, 초기 데이터를 반환하는 API (constructor)
	"""
    try:
        # 1. 이미 있는 모델과 gameId를 매칭
        target_modelset = sample(list(modelset_col.find()), 1)[0]
        if len(target_modelset) == 0:  # game이 존재하지 않는 경우?
            raise Exception
        model_id = target_modelset['modelId']
        model_data = target_modelset['stockList']
        model_data_df = pd.DataFrame({corp['corpId'] + '_close': corp["totalChart"] for corp in model_data})

        # 2. ML Model의 정보를 바탕으로 새로운 document 생성, DB collection에 추가
        pred_data, pred_band = launcher.predict(model_id, [corp['corpId'] + '_close' for corp in model_data], model_data_df)
        model_data_df = pd.concat([model_data_df, pred_data]).applymap(stock_round)
        model_data = [{"corpId": label.replace("_close", ""), "totalChart": data[-10:]}
                      for label, data in list(model_data_df.to_dict('list').items())]
        # 3. 새로운 document 생성, DB collection에 추가
        new_game = {
            "gameId": ObjectId(game_info.gameId),
            "modelSetId": target_modelset['_id'],
            "data": model_data,
        }

        market_col.insert(new_game)
        # 4. 반환을 위한 dict res 생성, `gameId`와 `data` attribute 추가 후 반환
        res = {'gameId': game_info.gameId, 'data': model_data}
        return JSONResponse(res)
    except Exception as e:
        return JSONResponse({'gameId': game_info.gameId, "status": "Error : {}".format(traceback.format_exc())})


@app.put("/model")
def update_model(game_info_with_event: CorpEventInfo):
    """
	game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
	"""
    try:
        # 1. DB에서 해당하는 게임 정보를 가지고 온다
        current_game = market_col.find_one({"gameId": ObjectId(game_info_with_event.gameId)})
        if not current_game:
            raise Exception
        data = current_game['data'] # 10개로 되어있음
        model_id = current_game['modelSetId']

        # 2. pkl을 이용해 TIMEBANDCore를 Load한 후, Core.predict를 진행
        current_model = modelset_col.find_one({"_id": ObjectId(model_id)})
        if not current_model:  # game이 존재하지 않는 경우?
            raise Exception
        data_df = pd.DataFrame({corp['corpId'] + '_close': corp["totalChart"] for corp in data})
        pred_data, pred_band = launcher.predict(current_model['modelId'], [corp['corpId'] + '_close' for corp in data], data_df)

        # 3. 찾은 pred_band를 기반으로 get_current_price 진행(예측)
        stock_info, increment, buy_quantity, sell_quantity = [], {}, [], []
        for ticker, corp_market_info in sorted(game_info_with_event.corps.items(), key=lambda x: int(x[0])):
            stock_info.append(ticker)
            increment[ticker] = corp_market_info.increment
            buy_quantity.append(corp_market_info.buyQuantity)
            sell_quantity.append(corp_market_info.sellQuantity)

        res_df = pred_band.reset_index(drop=True)
        pick_result = get_current_price(buy_quantity, sell_quantity, stock_info, res_df)  # TODO: dummy_df
        final_result = shift_current_price(increment=increment, price=pick_result)

        for i, corpId in enumerate(stock_info):
            for j in range(1, 4):
                stock_col.insert_one({
                    "game": ObjectId(game_info_with_event.gameId),
                    "week": game_info_with_event.nextTime.week,
                    "day": game_info_with_event.nextTime.day,
                    "tick": j,
                    "corpId": corpId,
                    "price": final_result[corpId]['price'][j - 1]
                })
        # 4. market 속의 Document를 갱신
        market_col.update_one(
            {"gameId": ObjectId(game_info_with_event.gameId)},
            {"$set": {
                "data": [{"corpId": stock["corpId"], "totalChart": stock["totalChart"][3:] + final_result[stock["corpId"]]['price']} for stock in data]
            }},
            upsert=False
        )
        print([{"corpId": stock["corpId"], "totalChart": stock["totalChart"][3:] + final_result[stock["corpId"]]['price']} for stock in data])
        # 5. 예측된 결과를 반환
        res = {
            "gameId": game_info_with_event.gameId,
            "corps": final_result
        }
        return JSONResponse(res)
    except Exception as e:
        return JSONResponse(
            {'gameId': game_info_with_event.gameId, "status": "Error : {}".format(traceback.format_exc())},
            status_code=500)


@app.delete("/model")
def delete_model(game_info: GameInfo):
    """
	게임이 끝나고 model과의 관계를 삭제하는 API
	"""
    try:
        res = market_col.delete_one({"gameId": ObjectId(game_info.gameId)})
        return JSONResponse({'gameId': game_info.gameId, 'status': res.deleted_count})
    except Exception as e:
        return JSONResponse({'gameId': game_info.gameId, "status": "Error : {}".format(e)}, status_code=500)


@app.get("/modelset")
def generate_modelset():
    try:
        # 1. Data 뽑기
        model_id = "".join(sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6))
        data, stock_list = stock_generator()
        close_data = data.filter(regex='(_close)$', axis=1)
        file_path = f"./data/origin/{model_id}.csv"
        close_data.to_csv(file_path)

        # 2. Timeband 객체 생성 후 Train
        launcher.main(model_id, list(map(lambda x: x + '_close', stock_list)))
        new_modelset = {
            "modelId": model_id,
            "stockList": [{
                "corpId": ticker,
                "totalChart": close_data[ticker + '_close'].tolist()[-20:],
            } for ticker in stock_list]
        }
        modelset_col.insert_one(new_modelset)
        return JSONResponse({"status": "OK"})
    except Exception as e:
        return JSONResponse({"status": "Error : {}".format(traceback.format_exc())})
