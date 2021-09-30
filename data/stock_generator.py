import numpy as np
from pykrx import stock
from random import sample, radnint

def get_data_by_len(quantity: int = 5, duration: int = 30) -> 'numpy.ndarray':
	target_tickers = sample(KOSPI_200, quantity)

	for ticker in target_tickers:
		# 가능한 범위를 구하고
		
		# 그 중에서 하나 샘플추출

		# 나온 결과를 기존의 Data에 Concat

	# for loop이 종료된 후에 완성된 3darray() 를 반환
