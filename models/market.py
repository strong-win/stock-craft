from fastapi import FastAPI  # Serving
from TIMEBAND.core import TIMEBANDCore  # ML과 통신
import math  # 정규분포 관리용
import pymongo  # NoSQL 연동
import pandas as pd  # DataFrame 관리

MODEL_PATH = "..."  # Model `.pt` 파일이 있는 경로

app = FastAPI()


def get_current_price(result_df: "pd.DataFrame") -> "pd.DataFrame":
    """
    `result_df`의 데이터를 바탕으로 샘플링을 진행한 후, (2n, 2m) 형태의 dataframe을 반환하는 function
    """
    pass


@app.get("/model/init")
def init_model():
    """
    모델을 새로 생성한 후, 초기 데이터를 반환하는 API
    """
    pass


@app.put("/model/update")
def update_model():
    """
    game_id가 주어졌을 때, 해당 id를 바탕으로 새로운 데이터를 주는 API
    """
    pass
