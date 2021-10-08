import os
import numpy as np
import pandas as pd
from pykrx import stock
from datetime import date, timedelta
from random import sample, randint
from data_constant import KOSPI_200, TICKER_NAME, DATA_PATH, START_DATE, END_DATE
	
def get_random_date(train_days: int, init_days: int):
	"""
	return random date between START_DATE and END_DATE
	these two constants are defined at `data.constant.py`, change if needed.
	"""
	start_date = date(*map(int, START_DATE.split('-')))
	end_date = date(*map(int, END_DATE.split('-')))
	date_length = (end_date - start_date).days - train_days - init_days
	target = randint(0, date_length)
	return start_date + timedelta(days=target)

def get_data_by_len(quantity: int = 5, duration: int = 365) -> 'numpy.ndarray':
	"""
	WARNING! THIS IS LEGACY CODE, since the protocol has been changed.
	USE `get_data_by_datetime` instead

	A function that returns ndarray with `quantity` stocks with `duration` days
	"""
	target_tickers = sample(KOSPI_200, quantity)
	res = []
	for ticker in target_tickers:
		df = pd.read_csv(os.path.join(DATA_PATH, TICKER_NAME[ticker])+'.csv')
		max_val = len(df) - duration + 1
		target_idx = randint(0, max_val-1)
		res.append(df[target_idx:target_idx+1, :])
	return res

def get_data_by_datetime(quantity: int = 5, train_days: int = 365, init_days: int = 14) -> 'numpy.ndarray':
	"""
	A function that returns ndarray with `quantity` stocks with `train_days` + `init_days`
	"""
	# res = []
	# # 1. 날짜 랜덤 추출 (train_duration, init_duration 반영)
	# target_day = get_random_date(train_days, init_days)

	# # 2-1. import csv and convert into DataFrame

	# # 2. 이에 해당하는 날짜 이전에 상장된 기업 정보를 찾기 (using KOSPI200_info.csv)
	# df = pd.read_csv(DATA_PATH)
	# target_companies = df[df['ListingDate'] >= target_day]
	# # target_stocks = 

	# # 3. 찾았다면, 해당 정보를 numpy 배열에 append
	# # res.append()

	# # 4. quantity 개수만큼 찾았다면, 반환!
	# return res

print(get_random_date(365, 14))
