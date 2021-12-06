import pandas as pd

dummy_df = pd.DataFrame({
	"108670_close_upper": [12000, 12000, 12000, 12000, 12000],
	"108670_close_lower": [8000, 8000, 8000, 8000, 8000],
	"035250_close_upper": [12000, 12000, 12000, 12000, 12000],
	"035250_close_lower": [8000, 8000, 8000, 8000, 8000],
	"000810_close_upper": [12000, 12000, 12000, 12000, 12000],
	"000810_close_lower": [8000, 8000, 8000, 8000, 8000],
	"019170_close_upper": [12000, 12000, 12000, 12000, 12000],
	"019170_close_lower": [8000, 8000, 8000, 8000, 8000],
	"000270_close_upper": [12000, 12000, 12000, 12000, 12000],
	"000270_close_lower": [8000, 8000, 8000, 8000, 8000],
})

import pickle

def execute():
	# sample_input = pd.read_csv("sample_input.csv")
	with open("models/sample.pkl", "rb") as sample_model:
		Core = pickle.load(sample_model)

	pred_line, pred_band = Core.predicts()
	pred_line = pred_line[-3:]
	pred_band = pred_band[-3:]
	print(pred_line, pred_band)
	res = get_current_price([10], [10], ['aaaaaa'], pred_band, 1, 3)
	print(res)
	# line, band = Core.predict(subdata=) # online batch용 method, param은 예측하고자 하는 길이의 3갭
	# print(pred_line.head(5))
	# print(pred_band.head(5))

if __name__ == '__main__':
	execute()