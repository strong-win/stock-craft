import os
import pandas as pd
from datetime import date, timedelta
from random import sample, randint
from data_constant import KOSPI_200, TICKER_NAME, DATA_PATH, START_DATE, END_DATE


def get_random_date(train_days: int, init_days: int) -> "pd.Timestamp":
    """
    return random date between START_DATE and END_DATE
    these two constants are defined at `data_constant.py`, change if needed.
    """
    start_date = date(*map(int, START_DATE.split("-")))
    end_date = date(*map(int, END_DATE.split("-")))
    date_length = (end_date - start_date).days - train_days - init_days
    target = randint(0, date_length)
    return pd.Timestamp(start_date + timedelta(days=target))


def get_data_by_datetime_in_one_row(
    quantity: int = 5, train_days: int = 365, init_days: int = 14
) -> "pd.DataFrame":
    """
    A function that returns DataFrame with `quantity` stocks with `train_days` + `init_days` with exchange_rate and kospi_index
    """
    # 0. initialize list to store individual df for merge
    ticker_list = []
    res = []

    # 1. 날짜 랜덤 추출 (train_duration, init_duration 반영)
    target_day = get_random_date(train_days, init_days)

    # 2. import csv and convert into DataFrame, 이에 해당하는 날짜 이전에 상장된 기업 정보를 찾기 (using KOSPI200_info.csv)
    df = pd.read_csv(os.path.join(DATA_PATH, "kospi200_info.csv"), index_col=False)
    df.ListingDate = pd.to_datetime(df.ListingDate)
    target_companies = df[df["ListingDate"] <= target_day].sample(n=5)

    for idx, company in target_companies.iterrows():
        company_name = company["Name"]
        company_dataframe = pd.read_csv(
            os.path.join(DATA_PATH, company_name + ".csv"), index_col=False
        )
        company_dataframe["날짜"] = pd.to_datetime(company_dataframe["날짜"])
        company_dataframe = company_dataframe.drop(["Unnamed: 0"], axis=1)
        company_dataframe = company_dataframe[company_dataframe["날짜"] > target_day][
            : train_days + init_days
        ]
        # 3. 찾았다면, 해당 정보를 배열에 append
        ticker_list.append(company["Symbol"])
        res.append(company_dataframe.reset_index(drop=True))

    # 4. KOSPI INDEX 정보 추가 - '종가'를 기준으로 함
    kospi = pd.read_csv(os.path.join(DATA_PATH, "kospi.csv"))
    kospi["날짜"] = pd.to_datetime(kospi["날짜"])
    kospi = kospi[kospi["날짜"] > target_day][: train_days + init_days]["종가"]
    res.append(kospi.reset_index(drop=True))

    # 5. Dollar Exchange Rate 정보 추가
    exchange_rate = pd.read_csv(os.path.join(DATA_PATH, "exchange_rate.csv"))
    exchange_rate["DateTime"] = pd.to_datetime(exchange_rate["DateTime"]).dt.date
    exchange_rate = exchange_rate.drop(["Unnamed: 0"], axis=1)
    exchange_rate = exchange_rate[~exchange_rate["Rate"].isna()]
    exchange_rate = exchange_rate[exchange_rate["DateTime"] > target_day.date()][
        : train_days + init_days
    ]["Rate"].reset_index(drop=True)
    res.append(exchange_rate)

    # 6. Merge Dataframe, reset labelname, and return final DataFrame
    result = pd.concat(res, axis=1)
    df_label = []
    for i in range(0, quantity):
        df_label += [
            "date",
            str(ticker_list[i]) + "_open",
            str(ticker_list[i]) + "_high",
            str(ticker_list[i]) + "_low",
            str(ticker_list[i]) + "_close",
            str(ticker_list[i]) + "_volume",
        ]
    df_label += ["kospi", "exchange_rate"]
    result.columns = df_label
    result = result.loc[:, ~result.columns.duplicated()]
    result.set_index("date", inplace=True)
    return result
