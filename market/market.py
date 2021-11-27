from fastapi import FastAPI # Serving
from fastapi.responses import JSONResponse
from conn import market_col, modelset_col
from schema import GameInfo, CorpEventInfo
from math import sqrt
# from TIMEBAND.core import TIMEBANDCore # ML과 통신
import json
import numpy as np  # 정규분포 이용
import pandas as pd  # DataFrame 관리
from stock_generator import stock_generator as sg
from random import sample
import pickle

## TO-BE Delete

MODEL_PATH = "./TEMP.pkl"  # Model `.pkl` 파일이 있는 경로

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
			upper = target_df['close'+str(i)+'_upper'][j] + add_sell_trend(target_df['close'+str(i)+'_upper'][j], selling_volume[i-1])
			lower = target_df['close'+str(i)+'_lower'][j] + add_buy_trend(target_df['close'+str(i)+'_lower'][j], buying_volume[i-1])
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

def shift_current_price(increment: list[int], price: 'pd.DataFrame') -> 'pd.DataFrame':



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

		model_d_path, model_g_path = target_modelset['modelDPath'], target_modelset['modelGPath']
		with open('./config.sample.json') as json_file:
			config = json.load(json_file)
		
		# 2. ML Model의 정보를 바탕으로 새로운 document 생성, DB collection에 추가
		# TODO: change mock data into real data base on ML model
		corp_info = []
		corp_list = target_modelset['stockList']

		for corp in corp_list:
			corp_info.append({
				"corpId": "{0:>06d}".format(corp),
				"totalChart": ['10000', '10500', '10000', '10500', '11000', '11500', '12000', '12500', '12000', '11500']
			})	

		# TODO:
		# 3. 새로운 document 생성, DB collection에 추가
		new_game = {
			"gameId": game_info.gameId,
			"modelInfo": (model_d_path, model_g_path),
			"modelConfig": config,
			"companies": corp_info
		}
		market_col.insert_one(new_game)

		# 4. 반환을 위한 dict res 생성, `gameId`와 `data` attribute 추가 후 반환
		res = {'gameId': new_game['gameId'], 'data': corp_info}
		return JSONResponse(res) # list of dictionary
	except Exception as e:
		return JSONResponse({'gameId': game_info.gameId, "data": "Error : {}".format(e)})

@app.put("/model")
def update_model(game_info_with_event: CorpEventInfo):
	"""
	game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
	"""
	try:
		# 1. DB에서 해당하는 게임 정보를 가지고 온다
		game = list(market_col.find({"gameId": game_info_with_event.gameId}))
		if len(game) == 0: # game이 존재하지 않는 경우?
			raise Exception

		# TODO: data, model DB로부터 불러오기
		data = None
		model = None

		# 2. pkl을 이용해 TIMEBANDCore를 Load한 후, Core.predict를 진행
		# TODO: Model 예시 pkl 오면 연동하기
		with open(MODEL_PATH, 'wb') as model_file:
			Core = pickle.load(model_file)
		pred_line, pred_band = Core.predict(data, model)

		# 3. 찾은 predict_data를 기반으로 get_current_price 진행(예측)
		# TODO: implement Pipelining of Shifting Prices
		get_current_price()
		shift_current_price()
		
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
		market_col.delete_one({"gameId": game_info.gameId})
		return JSONResponse({'gameId':game_info.gameId, 'status': "OK"})
	except Exception as e:
		return JSONResponse({'gameId':game_info.gameId, "status": "Error : {}".format(e)})

@app.get("/modelset")
def generate_modelset():
	try:
		# 1. Data 뽑기
		data, ticker_list = sg.get_data_by_datetime_in_one_row()

		# 2. config 호출
		with open('./config.sample.json') as json_file:
			config = json.load(json_file)

		# 3. Timeband 객체 생성 후 Train
		# Core = TIMEBANDCore(config)
		# modelG_path, modelD_path = Core.train(data) # TODO: check arguments for Core.train()
		# 4. data, band를 바탕으로 timeband.predict
		# predict_data, predict_band = Core.predicts(data, model)
		# QUESTION: model(.pt) 저장은 Core.predicts 과정에서 일어나는것인지?
		# QUESTION: 찾아보니 이는 학습 과정에서 이루어지는 것 같은데, 내쪽에서 하긴 어렵지않나? 임의의 이름으로 model 만들어줘야할듯??

		# 5. db.insert(modelG path, modelD path, data, band)
		# TODO: change mock data into model-related data
		ms_id = 'XB1F3E'
		model_g_path = "./example_model_g_path.pt"
		model_d_path = "./example_model_d_path.pt"
		dataPath = "./example_dataPath.csv"
		bandPath = "./example_bandPath.csv"
		new_modelset = {
			"modelSetId": ms_id, # int
			# "modelGPath": model_g_path, # str
			# "modelDPath": model_d_path, # str
			# "stockList": ["{0:>06d}".format(i) for i in ticker_list], # list
			# "dataPath": dataPath, # pandas.df
			# "bandPath": bandPath, # pandas.df
		# }
		# modelset_col.insert_one(new_modelset)
		return JSONResponse({"status": "OK"})
	except Exception as e:
		return JSONResponse({"status": "Error : {}".format(e)})
# 처음 데이터 학습 시에는 randmm_generator를 바탕으로 10개 정도 생성 후
# 이후에 데이터는 DB에서 뽑아서 날려서 관리하자.
# close로만 진행하는 것으로??