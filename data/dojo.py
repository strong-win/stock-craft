from pykrx import stock
from forex_python.converter import CurrencyRates
from easy_exchange_rates import API as ExchangeAPI
from data_constant import START_DATE, END_DATE
from datetime import datetime, timedelta
import pandas as pd
import os
import glob

# print(stock.get_market_ticker_name('005930'))
# df = stock.get_market_ohlcv_by_date("20150720", "20150725", "005930")
# print(df.head(3))
# pdf = stock.get_index_portfolio_deposit_file("1028")
# print(len(pdf), pdf)

# TO-DO : 데이터 합치는 코드
# dir_list = [i for i in sorted(os.listdir("./stock_data_0922"))]
# for stock_name in dir_list:
#     print(stock_name)
#     df = pd.concat(
#         map(pd.read_csv, glob.glob("stock_data_0922/{}/*.csv".format(stock_name)))
#     )
#     df["날짜"] = df["날짜"].apply(pd.to_datetime)
#     df = (
#         df[df["날짜"] > "2000-01-01"]
#         .sort_values(by="날짜")
#         .reset_index()
#         .drop("index", axis=1)
#     )
#     df_length = len(df)
#     df.to_csv("full_data_0929/{}.csv".format(stock_name))
#     # break

#

"""
procedure that returns kospi200 indicies
"""
# TO-DO : add exchange_rate between 2000-01-04 and 2021-09-17
# df = stock.get_index_ohlcv_by_date("20000101", "20210917", "1001")
# df.to_csv('./stock_data_0922/kospi.csv')


"""
procedure that returns USD-KRW Exchange Rate indicies
"""
# TO-DO : get USD-KRW Exchange Rate by our START_DATE and END_DATE
c = CurrencyRates()
df = pd.DataFrame(pd.date_range(start='1/1/2000 10:00:00', end='9/17/2021 11:00:00', freq='D'), columns=['DateTime'])

def get_rate(x):
    try:
        op = c.get_rate('CAD', 'USD', x)
    except Exception as re:
        print(re)
        op=None
    return op

df['Rate'] = df['DateTime'].apply(get_rate)
print(df)