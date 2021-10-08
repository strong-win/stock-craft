import os

# import numpy as np
import pandas as pd
from pykrx import stock
from random import sample, randint
from data_constant import KOSPI_200, TICKER_NAME, DATA_PATH

# TO-DO: 예외처리하기!


def get_data_by_len(quantity: int = 5, duration: int = 30) -> "numpy.ndarray":
    target_tickers = sample(KOSPI_200, quantity)
    res = []
    for ticker in target_tickers:
        df = pd.read_csv(os.path.join(DATA_PATH, TICKER_NAME[ticker]))
        max_val = len(df) - duration + 1
        target_idx = randint(0, max_val - 1)
        res.append(df[target_idx : target_idx + 1, :])

    return res
