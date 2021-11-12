from fastapi import FastAPI # Serving
from conn import client
# from TIMEBAND.core import TIMEBANDCore # ML과 통신
import pymongo # NoSQL 연동
import json
import numpy as np # 정규분포 이용
import pandas as pd # DataFrame 관리
## TO-BE Delete
from dummy import dummy_df
from pprint import pprint

MODEL_PATH = "..."  # Model `.pt` 파일이 있는 경로

app = FastAPI()

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
	return base * round(price/base)

def get_current_price(stock_info: list[str], result_df: 'pd.DataFrame', target_stocks: int = 5, target_days: int = 3) -> dict:
	"""
	NOTICE: order of stock_info is ASC
	`result_df`의 데이터를 바탕으로 샘플링을 진행한 후, (2*days, 2*stock) 형태의 dataframe을 반환하는 function
	"""
	# TODO: 숫자 인덱스 ticker로 변경하기
	res = {k:{} for k in sorted(stock_info)}

	target_df = result_df
	for i in range(1, target_stocks + 1):
		price_list = []
		for j in range(target_days):
			# TODO: 매수/메도세 반영 in upper, lower
			upper = target_df['close'+str(i)+'_upper'][j]
			lower = target_df['close'+str(i)+'_lower'][j]
			target_range = upper - lower
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
def init_model():
	"""
	이미 학습된 모델을 1:1 매칭한 후, 초기 데이터를 반환하는 API (생성자)
	"""
	pass
	# config = CONFIG_PATH
	# Core = TIMEBANDCore()
	# model = torch.load('path')
	# predict_data, predict_band = Core.predicts(data, model)

@app.put("/model")
def update_model():
	"""
	game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
	"""
	pass

@app.delete("/model")
def delete_model():
	"""
	게임이 끝나고 model과의 관계를 삭제하는 API
	"""
	pass