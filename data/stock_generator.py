import os
import numpy as np
import pandas as pd
from pykrx import stock
from datetime import date, timedelta
from random import sample, randint
from data_constant import KOSPI_200, TICKER_NAME, DATA_PATH, START_DATE, END_DATE

def get_random_date(train_days: int, init_days: int) -> 'pd.Timestamp':
	"""
	return random date between START_DATE and END_DATE
	these two constants are defined at `data.constant.py`, change if needed.
	"""
	start_date = date(*map(int, START_DATE.split('-')))
	end_date = date(*map(int, END_DATE.split('-')))
	date_length = (end_date - start_date).days - train_days - init_days
	target = randint(0, date_length)
	return pd.Timestamp(start_date + timedelta(days=target))

def get_data_by_len(quantity: int = 5, duration: int = 365) -> 'numpy.ndarray':
	"""
	WARNING! THIS IS LEGACY CODE, since the protocol has been changed.₩
	USE `get_data_by_datetime` instead

	A function that returns ndarray with `quantity` stocks with `duration` days
	"""
	target_tickers = sample(KOSPI_200, quantity)
	res = []
	for ticker in target_tickers:
		df = pd.read_csv(os.path.join(DATA_PATH, TICKER_NAME[ticker])+'.csv', index_col=False)
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
	df = pd.read_csv("./kospi200_info.csv", index_col=False)
	target_companies = df[df['ListingDate'] >= target_day].sample(n = 3) # TO-DO: set same data time
	
	for company in target_companies:
		company_name = company['Name']
		company_dataframe = pandas.read_csv(os.path.join(DATA_PATH, company_name + '.csv'), index_col=False)
		company_dataframe = company_dataframe[company_dataframe['날짜'] > target_day][:train_days + init_days]
		# 3. 찾았다면, 해당 정보를 numpy 배열에 append
		res.append(company_data)

	# CHECK: 현재는 trains_days와 init_day를 한번에 보내는 상황인데, 이를 분리하는게 편한지?
	return numpy.array(res)

def get_data_by_datetime_in_one_row(quantity: int = 5, train_days: int = 365, init_days: int = 14) -> 'numpy.ndarray':
	"""
	A function that returns ndarray with `quantity` stocks with `train_days` + `init_days` with exchange_rate and kospi_200
	"""
	# 0. initialize list to store individual df for merge
	res = []
	
	# 1. 날짜 랜덤 추출 (train_duration, init_duration 반영)
	target_day = get_random_date(train_days, init_days)

	# 2. import csv and convert into DataFrame, 이에 해당하는 날짜 이전에 상장된 기업 정보를 찾기 (using KOSPI200_info.csv)
	df = pd.read_csv("./kospi200_info.csv", index_col=False)
	df.ListingDate = pd.to_datetime(df.ListingDate)
	target_companies = df[df['ListingDate'] <= target_day].sample(n = 5) # TO-DO: set same data time

	for idx, company in target_companies.iterrows():
		company_name = company['Name']
		company_dataframe = pd.read_csv(os.path.join(DATA_PATH, company_name + '.csv'), index_col=False)
		company_dataframe['날짜'] = pd.to_datetime(company_dataframe['날짜'])
		company_dataframe = company_dataframe.drop(['Unnamed: 0'], axis=1).set_index('날짜')
		company_dataframe = company_dataframe[company_dataframe.index > target_day][:train_days + init_days]
		# 3. 찾았다면, 해당 정보를 numpy 배열에 append
		res.append(company_dataframe)

	# 4. KOSPI INDEX 정보 추가 - '종가'를 기준으로 함
	kospi = pd.read_csv(os.path.join(DATA_PATH, 'kospi.csv'))
	kospi['날짜'] = pd.to_datetime(kospi['날짜'])
	kospi = kospi.set_index('날짜')
	kospi = kospi[kospi.index > target_day][:train_days + init_days]['종가']
	res.append(kospi)

	# 5. Dollar Exchange Rate 정보 추가 - '종가'를 기준으로 함
	# TO-DO

	# 6. Merge Dataframe, reset labelname, and return final DataFrame
	result = pd.concat(res, axis=1)
	df_label = []
	for i in range(1, quantity+1):
		df_label += ['open'+str(i), 'high'+str(i), 'low'+str(i), 'close'+str(i), 'volume'+str(i)]
	df_label += ['kospi']
	result.columns = df_label
	return result
print(get_data_by_datetime_in_one_row().head(5))