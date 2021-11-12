from fastapi import FastAPI # Serving
from fastapi.responses import JSONResponse
from conn import client
from schema import GameInfo, CorpInfo, CorpResInfo
from math import log2
# from TIMEBAND.core import TIMEBANDCore # ML과 통신
import pymongo  # NoSQL 연동
import json
import numpy as np  # 정규분포 이용
import pandas as pd  # DataFrame 관리

## TO-BE Delete
from dummy import dummy_df
from pprint import pprint

MODEL_PATH = "..."  # Model `.pt` 파일이 있는 경로

app = FastAPI()

def add_buy_trend(price: int, volume: int):
	return round(log2(volume) * stock_round(price))

def add_sell_trend(price: int, volume: int):
	return -1 * round(log2(volume) * stock_round(price))
	
def stock_round(price):
    """
    return rounded price of KOSPI market
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
    return base * round(price / base)


def get_current_price(stock_info: list[str], result_df: 'pd.DataFrame', target_stocks: int = 5, target_days: int = 3, buying_volume: int, selling_volume: int) -> dict:
	"""
	NOTICE: order of stock_info is ASC
	`result_df`의 데이터를 바탕으로 샘플링을 진행한 후, (2*days, 2*stock) 형태의 dataframe을 반환하는 function
	"""
	res = {k:{} for k in sorted(stock_info)}

	target_df = result_df
	for i in range(1, target_stocks + 1):
		price_list = []
		for j in range(target_days):
			upper = target_df['close'+str(i)+'_upper'][j] + add_sell_trend(target_df['close'+str(i)+'_upper'][j], selling_volume)
			lower = target_df['close'+str(i)+'_lower'][j] + add_buy_trend(target_df['close'+str(i)+'_lower'][j], buying_volume)
			target_range = abs(upper - lower)
			z_score = np.random.normal()			
			final_price = stock_round(0.25 * target_range  * z_score + (upper + lower) // 2)
			price_list.append(final_price)
		if (price_list[0] < price_list[-1]):
			res[stock_info[i - 1]]['info'] = 1
		else:
			res[stock_info[i - 1]]['info'] = 0
		res[stock_info[i - 1]]['price'] = price_list
	return res

@app.post("/model")
def init_model(game_info: GameInfo):
	"""
	이미 학습된 모델을 1:1 매칭한 후, 초기 데이터를 반환하는 API (constructor)
	"""
	try:
	# 1. 이미 있는 모델과 gameId를 매칭

	# 2. 매칭된 정보를 dict타입으로 요약

	# 3. 생성된 정보를 MongoDB에 document로 생성

	# 4 .처음 생성된 주가를 가져와서 `totalChart`에 넣은 후 최종 데이터를 반환

		return JSONResponse({"status": "OK"})
	except Exception as e:
		return JSONResponse({'gameId': game_info_with_event.gameId, "status": "Error : {}".format(e)})


@app.put("/model")
def update_model(game_info_with_event: CorpEventInfo):
	"""
	game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
	"""
	try:
	# 1. gameId에 해당하는 모델을 찾고, 이를 CONFIG_PATH로 지정

	# 2. TIMEBANDCore를 선언하고, torch.load를 한 후, Core.predict를 진행
	"""
	이전 회의에서 나왔던 Protocol psuedo-code:
	MODEL_PATH = mongoDB.find(gameId)
	config = local.find(gameId)
	Core = TIMEBANDCore(config)
	model = torch.load(MODEL_PATH)
	predict_data, predict_band = Core.predicts(data, model)
	"""
	# 3. 찾은 predict_data를 기반으로 get_current_price 진행(예측)

	# 4. 예측된 결과를 반환

		return JSONResponse({"status": "OK"})
	except Exception as e:
		return JSONResponse({'gameId': game_info_with_event.gameId, "status": "Error : {}".format(e)})

@app.delete("/model")
def delete_model(game_info: GameInfo):
	"""
	게임이 끝나고 model과의 관계를 삭제하는 API
	"""
	try:
	# 1. gameId에 해당하는 모델을 찾기

	# 2. MongoDB에서 해당하는 value에 해당하는 document 제거

	# 3. 추가적으로 이번 게임에서 활용된 경로, config 등의 의존성 제거

	# 4. 성공 시그널: {gameId: str, status: 'OK'} 을 return

		return JSONResponse({'gameId':game_info.gameId, 'status': "OK"})
	except Exception as e:
		return JSONResponse({'gameId':game_info.gameId, "status": "Error : {}".format(e)})
