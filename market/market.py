from fastapi import FastAPI
from fastapi.responses import JSONResponse
from conn import market_col, modelset_col, stock_col
from schema import GameInfo, CorpEventInfo
from math import sqrt
import json
import numpy as np
import pandas as pd
from stock_generator import stock_generator
from random import sample
import pickle

# TODO: Remove temp files
from core import generate_dummy_df
import traceback

MODEL_PATH = "./model/TEMP.pkl"  # Model `.pkl` 파일이 있는 경로

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

def get_current_price(buying_volume: list[int], selling_volume: list[int], stock_info: list[str], result_df: 'pd.DataFrame', target_stocks: int = 5, target_days: int = 3) -> dict:
	"""
	NOTICE: order of stock_info is ASC
	`result_df`의 데이터를 바탕으로 샘플링을 진행한 후, (2*days, 2*stock) 형태의 dictionary를 반환하는 function
	"""
	res = {k:{} for k in sorted(stock_info)}
	target_df = result_df
	for i in range(1, target_stocks + 1):
		price_list = []
		for j in range(target_days):
			print(target_df)
			upper = target_df[stock_info[i-1] + '_close_upper'][j] + add_sell_trend(target_df[stock_info[i-1] + '_close_upper'][j], selling_volume[i-1])
			lower = target_df[stock_info[i-1] + '_close_lower'][j] + add_buy_trend(target_df[stock_info[i-1] + '_close_lower'][j], buying_volume[i-1])
			target_range = abs(upper - lower)
			z_score = np.random.normal()
			final_price = stock_round(0.25 * target_range  * z_score + (upper + lower) // 2)
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
		increment: 증감량 List
		price: shift를 진행한 price DataFrame {ticker_name: [ticker: List[int]]
	Returns: 직접 변동을 적용한 최종 가격을 반환
	increment와 list 사이에 순서가 맞아야하는 점에 집중
	"""
	for ticker, delta in increment.items():
		price[ticker] = list(map(lambda x: x + increment[ticker], price))

	return price

@app.post("/model")
def init_model(game_info: GameInfo):
	"""
	이미 학습된 모델을 1:1 매칭한 후, 초기 데이터를 반환하는 API (constructor)
	"""
	try:
		# 1. 이미 있는 모델과 gameId를 매칭
		target_modelset = sample(list(modelset_col.find()), 1)[0]
		if len(target_modelset) == 0: # game이 존재하지 않는 경우?
			raise Exception

		modelset_data = target_modelset['stockList']
		# with open('./config.sample.json') as json_file:
		# 	config = json.load(json_file)

		# 2. ML Model의 정보를 바탕으로 새로운 document 생성, DB collection에 추가
		# TODO: change mock data into real data base on ML model

		new_data = [{"corpId": stock['corpId'], "totalChart": stock['totalChart'][-10:]} for stock in modelset_data]
		# 3. 새로운 document 생성, DB collection에 추가
		new_game = {
			"gameId": game_info.gameId,
			"modelSetId": target_modelset['_id'],
			"data": new_data
		}
		market_col.insert_one(new_game)

		# 4. 반환을 위한 dict res 생성, `gameId`와 `data` attribute 추가 후 반환
		res = {'corps': new_data}
		return JSONResponse(res)
	except Exception as e:
		return JSONResponse({'gameId': game_info.gameId, "data": "Error : {}".format(e)},  status_code=500)

@app.put("/model")
def update_model(game_info_with_event: CorpEventInfo):
	"""
	game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
	"""
	try:
		# 1. DB에서 해당하는 게임 정보를 가지고 온다
		current_game = market_col.find_one({"gameId": game_info_with_event.gameId})
		# if len(current_game) is None: # game이 존재하지 않는 경우?
		# 	raise Exception
		# data = current_game['companies']
		# model = current_game['modelInfo']

		# 2. pkl을 이용해 TIMEBANDCore를 Load한 후, Core.predict를 진행
		# with open(MODEL_PATH, 'wb') as model_file:
		# 	Core = pickle.load(model_file)
		# pred_line, pred_band = Core.predict(data, model)

		# 3. 찾은 pred_band를 기반으로 get_current_price 진행(예측)
		stock_info, increment, buy_quantity, sell_quantity = [], [], [], []
		for ticker, corp_market_info in sorted(game_info_with_event.corps.items(), key=lambda x: int(x[0])):
			stock_info.append(ticker)
			increment.append(corp_market_info.increment)
			buy_quantity.append(corp_market_info.buyQuantity)
			sell_quantity.append(corp_market_info.sellQuantity)

		res_df = generate_dummy_df(stock_info)
		pick_result = get_current_price(buy_quantity, sell_quantity, stock_info, res_df) # TODO: dummy_df
		final_result = shift_current_price(increment={}, price=pick_result)

		print(final_result)

		# TODO: (gameId, week, day, tick, corpId, price) 형태로 저장
		for i, corpId in enumerate(stock_info): # TODO: ticker output 개수만큼 조절 필요
			for j in range(1, 4):
				stock_col.insert_one({
					"gameId": game_info_with_event.gameId,
					"week": game_info_with_event.nextTime.week,
					"day": game_info_with_event.nextTime.day + 1,
					"tick": j,
					"corpId": corpId,
					"price": final_result[corpId]['price'][j-1]
				})
		# 4. 예측된 결과를 반환
		res = {
			"gameId": game_info_with_event.gameId,
			"corps": final_result
		}
		return JSONResponse(res)
	except Exception as e:
		return JSONResponse({'gameId': game_info_with_event.gameId, "status": "Error : {}".format(traceback.format_exc())}, status_code=500)

@app.delete("/model")
def delete_model(game_info: GameInfo):
	"""
	게임이 끝나고 model과의 관계를 삭제하는 API
	"""
	try:
		market_col.delete_one({"gameId": game_info.gameId})
		return JSONResponse({'gameId':game_info.gameId, 'status': "OK"})
	except Exception as e:
		return JSONResponse({'gameId':game_info.gameId, "status": "Error : {}".format(e)}, status_code=500)

@app.get("/modelset")
def generate_modelset():
	try:
		# 1. Data 뽑기
		data, stock_list = stock_generator()

		# TODO: change mock data into model-related data
		# 2. Timeband 객체 생성 후 Train - WIP
		# with open(MODEL_PATH) as core:
		# 	Core = pickle.load(core)
		# predict_data, predict_band = Core.predicts(data)

		# TODO: change data into predict-data
		close_data = data.filter(regex='(_close)$', axis=1)

		for cd in close_data:
			close_data[cd].tolist()

		# 인덱스 기준으로 정렬하려면?
		# df.reindex(sorted(df.columns), axis=1)

		print(close_data)
		new_modelset = {
			"stockList": [{
				"corpId": ticker,
				"totalChart": close_data[ticker + '_close'].tolist(),
				# "band": [], # TODO: add close_data['ticker + '_close_upper' & '_close_lower'
			} for ticker in stock_list]
		}
		print(new_modelset)
		modelset_col.insert_one(new_modelset)
		return JSONResponse({"status": "OK"})
	except Exception as e:
		return JSONResponse({"status": "Error : {}".format(e)})
