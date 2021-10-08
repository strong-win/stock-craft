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
	return np.array(res)

def get_data_by_datetime(quantity: int = 5, train_days: int = 365, init_days: int = 14) -> 'numpy.ndarray':
	"""
	A function that returns ndarray with `quantity` stocks with `train_days` + `init_days`
	"""
	res = []
	# 1. 날짜 랜덤 추출 (train_duration, init_duration 반영)
	target_day = get_random_date(train_days, init_days)

	# 2. import csv and convert into DataFrame, 이에 해당하는 날짜 이전에 상장된 기업 정보를 찾기 (using KOSPI200_info.csv)
	df = pd.read_csv("./kospi200_info.csv")
	target_companies = df[df['ListingDate'] >= target_day].sample(n = 3) # TO-DO: set same data time
	
	for company in target_companies:
		company_name = company['Name']
		company_dataframe = pandas.read_csv(os.path.join(DATA_PATH, company_name + '.csv'))
		company_dataframe = company_dataframe[company_dataframe['df']]
		# 3. 찾았다면, 해당 정보를 numpy 배열에 append
		res.append(company_data)
	
	# CHECK: 현재는 trains_days와 init_day를 한번에 보내는 상황인데, 이를 분리하는게 편한지?
	return numpy.array(res)
