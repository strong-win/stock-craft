# Data Part

Server, ML Part에 사용되는 데이터를 서빙하는 부분입니다.

written by. beeetea

---

## 0. Prerequisite

### 용어 정리

- `ticker` : 주식을 대표하는 identifier (삼성전자 : 005930 [KRX],애플 : AAPL [NASDAQ]) 
- `index`: 주식의 Group (KOSPI 200 등)

### 사용 시작하기
```python
pip install -r requirements.txt
```

## 1. Usage

`stock_generator` 모듈의 `get_data_by_datetime_in_one_row` 함수를 import해서 사용하시면 됩니다.  
(다른 함수들은 deprecated 상태입니다.)

```python
get_data_by_datetime_in_one_row(quantity: int = 5, train_days: int = 365, init_days: int = 14) -> "pandas.DataFrame"
```

- parameters:
	- `quantity` : 추출할 주식의 개수
	- `train_days` : 학습 시 사용할 주가일만큼의 데이터 일자
	- `init_days` : 처음 사용자에게 보여줄 라이브 일자
- returns:
	- 주식 `quantity`개의 `train_days` + `init_days`일치 분량의 주가데이터 + KOSPI INDEX + USD->KRW Exchange Rate를 반환 (`pandas_DataFrame`)


Created on : 21/09/23  
Updated on : 21/10/27