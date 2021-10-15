import os
import torch
import typing
import numpy as np
import pandas as pd
from datetime import datetime
from dateutil.parser import parse
from torch.functional import split
from torch.utils.data import DataLoader
from utils.logger import Logger
from utils.preprocess import onehot_encoding


logger = Logger(__file__)


class Dataset:
    def __init__(self, dataset):
        self.observed = dataset["observed"]
        self.forecast = dataset["forecast"]

        self.encoded = dataset["encoded"]
        self.decoded = dataset["decoded"]

        self.length = len(self.encoded)

    def __len__(self):
        return self.length

    def __getitem__(self, idx):
        data = {
            "observed": torch.tensor(self.observed[idx], dtype=torch.float32),
            "forecast": torch.tensor(self.forecast[idx], dtype=torch.float32),
            "encoded": torch.tensor(self.encoded[idx], dtype=torch.float32),
            "decoded": torch.tensor(self.decoded[idx], dtype=torch.float32),
        }

        return data


class TIMEBANDDataset:
    """
    TIMEBAND Dataset

    """

    def __init__(self, config: dict, device: torch.device, mode: str = "Train") -> None:
        """
        TIMEBAND Dataset

        Args:
            config: Dataset configuration dict
            device: Torch device (cpu / cuda:0)
        """
        logger.info("  Dataset: ")

        # Set Config
        self.mode = mode
        self.set_config(config)

        # Set device
        self.device = device

        # Load Data
        self.data = self.load_data()

    def set_config(self, config: dict) -> None:
        """
        Configure settings related to the data set.

        params:
            config: Dataset configuration dict
                `config['dataset']`
        """

        # Data file configuration
        self.directory = config["directory"]  # dirctory path
        self.data_name = config["data_name"]  # csv format file
        self.data_path = os.path.join(self.directory, self.data_name)

        # Columns
        self.index_col = config["index_col"]
        self.index_format = config["index_format"]

        self.year = config["year"]
        self.month = config["month"]
        self.weekday = config["weekday"]

        self.drops = config["drops"]
        self.targets = config["targets"]

        self.stride = config["stride"]
        self.observed_len = config["observed_len"]
        self.forecast_len = config["forecast_len"]

        self.split_rate = config["split_rate"]
        self.window_scale = min(config["window_scale"], 2)
        self.window_sliding = config["window_sliding"]

        # Preprocess
        self.scaler = config["scaler"]
        self.cutoff_min = config["cutoff"]["min"]
        self.cutoff_max = config["cutoff"]["max"]

    def load_data(self) -> pd.DataFrame:
        # Read csv data
        csv_path = f"{self.data_path}.csv"
        data = pd.read_csv(csv_path)
        data[self.index_col] = self.parse_datetime(data[self.index_col])
        data.drop(self.drops, axis=1, inplace=True)
        data.set_index(self.index_col, inplace=True)
        data.sort_index(ascending=True, inplace=True)
        data.index = pd.to_datetime(data.index)

        origin_data = data.copy()
        self.origin_df = origin_data
        self.origin_cols = origin_data.columns
        self.origin_data = torch.from_numpy(origin_data.to_numpy())

        target_data = data[self.targets].copy()
        self.target_df = origin_data
        self.target_cols = target_data.columns
        self.target_data = torch.from_numpy(target_data.to_numpy())

        self.minmax_scaler(data)

        self.data_length = data.shape[0]
        self.origin_dims = data.shape[1]
        self.encode_dims = data.shape[1]
        self.decode_dims = len(self.targets)

        # Keep Time information
        self.timestamp = data.index.to_series()
        self.month_cat = self.onehot(data, self.month, self.timestamp.dt.month_name())
        self.weekday_cat = self.onehot(data, self.weekday, self.timestamp.dt.day_name())
        self.timestamp = data.index.strftime(self.index_format).tolist()

        logger.info(f"  - File   : {csv_path}")
        logger.info(f"  - Index  : {self.index_col}")
        logger.info(f"  - Length : {self.data_length}")
        logger.info(f"  - Target : {self.targets} ({self.decode_dims} cols)")

        return data

    def load_dataset(self, k_step):
        train_set, valid_set, preds_set = self.process(k_step)

        self.trainset = Dataset(train_set)
        self.validset = Dataset(valid_set)
        self.predsset = Dataset(preds_set)

        # Feature info
        self.encode_dims = self.trainset.encoded.shape[2]
        self.decode_dims = self.trainset.decoded.shape[2]
        self.dims = {"encoded": self.encode_dims, "decoded": self.decode_dims}

        return self.trainset, self.validset, self.predsset

    def process(self, k_step=0):
        data = self.data.copy()

        train_minlen = int(self.window_scale * self.observed_len)
        valid_minlen = int(self.window_scale * self.forecast_len)

        # Timeseries K Sliding window
        if k_step <= self.window_sliding:
            data = data[: self.data_length - self.window_sliding + k_step]

        # Keep Real Data
        data_length = len(data)
        encode_real = data.copy()
        decode_real = data[self.targets].copy()

        # Preprocess
        data = self.impute_zero_value(data)
        data = self.normalize(data)

        # Timestamp information append
        month = self.month_cat[:data_length]
        weekday = self.weekday_cat[:data_length]
        data = pd.concat([data, month], axis=1)
        data = pd.concat([data, weekday], axis=1)

        # Encoded Split, Decoded Set split
        encode_data = data.copy()
        decode_data = data[self.targets].copy()

        # Windowing data
        stop = data_length - self.observed_len - self.forecast_len
        observed, _ = self.windowing(encode_real, stop)
        _, forecast = self.windowing(decode_real, stop)
        encoded, _ = self.windowing(encode_data, stop)
        _, decoded = self.windowing(decode_data, stop)

        def get_dataset(idx_s: int = 0, idx_e: int = data_length) -> dict:
            dataset = {
                "observed": observed[idx_s:idx_e],
                "forecast": forecast[idx_s:idx_e],
                "encoded": encoded[idx_s:idx_e],
                "decoded": decoded[idx_s:idx_e],
            }
            return dataset

        # Dataset
        split_idx = min(int(data_length * self.split_rate), data_length - valid_minlen)

        train_set = get_dataset(idx_s=0, idx_e=split_idx - self.forecast_len)
        valid_set = get_dataset(idx_s=split_idx, idx_e=-1)
        preds_set = get_dataset(idx_s=-2 * self.forecast_len)

        logger.info(f"Data len: {data_length}")
        return train_set, valid_set, preds_set

    def get_time_arange(self, times):
        first_day = times.values[0] + np.timedelta64(1, "D")
        last_day = times.values[-1] + np.timedelta64(1 + self.forecast_len, "D")
        time_arange = np.arange(first_day, last_day, dtype="datetime64[D]")
        return time_arange

    def windowing(self, x: pd.DataFrame, stop: int) -> tuple((np.array, np.array)):
        observed = []
        forecast = []
        for i in range(0, stop, self.stride):
            j = i + self.observed_len

            observed.append(x[i : i + self.observed_len])
            forecast.append(x[j : j + self.forecast_len])

        observed = np.array(observed)
        forecast = np.array(forecast)

        return observed, forecast

    def minmax_scaler(self, data):
        # Data Local
        self.origin_max = data.max(0)
        self.origin_min = data.min()

        min_p = self.cutoff_min
        max_p = self.cutoff_max
        logger.info(f"Cutting : Min {min_p*100} % , Max {max_p*100} %")

        for col in data.columns:
            uniques = sorted(data[col].unique())
            pivot_min = uniques[max(0, int(len(uniques) * min_p))]
            pivot_max = uniques[min(-1, -int(len(uniques) * max_p))]

            data[col][data[col] < pivot_min] = pivot_min
            data[col][data[col] > pivot_max] = pivot_max

        self.encode_min = data.min()
        self.encode_max = data.max(0) * 1.05

        self.decode_min = torch.tensor(self.encode_min[self.targets])
        self.decode_max = torch.tensor(self.encode_max[self.targets])

        df_minmax = pd.DataFrame(
            {
                f"MIN": self.origin_min,
                f"min": self.encode_min,
                f"max": self.encode_max,
                f"MAX": self.origin_max,
            },
            index=self.targets,
        )
        logger.info(f"-----  Min Max information  -----\n{df_minmax.T}")

    def normalize(self, data):
        """Normalize input in [-1,1] range, saving statics for denormalization"""
        # 2 * (x - x.min) / (x.max - x.min) - 1

        data = data - self.encode_min
        data = data / (self.encode_max - self.encode_min)
        data = 2 * data - 1

        return data

    def denormalize(self, data):
        """Revert [-1,1] normalization"""
        if not hasattr(self, "decode_max") or not hasattr(self, "decode_min"):
            raise Exception("Try to denormalize, but the input was not normalized")

        delta = self.decode_max - self.decode_min
        for batch in range(data.shape[0]):
            batch_denorm = data[batch]
            batch_denorm = 0.5 * (batch_denorm + 1)
            batch_denorm = batch_denorm * delta
            batch_denorm = batch_denorm + self.decode_min
            data[batch] = batch_denorm

        return data

    def impute_zero_value(self, data):
        for col in data:
            if data[col].dtype == "object":
                continue

            try:
                for row in range(len(data[col])):
                    if data[col][row] <= 0:
                        yesterday = data[col][max(0, row - 1)]
                        last_week = data[col][max(0, row - 7)]
                        last_year = data[col][max(0, row - 365)]
                        candidates = [yesterday, last_week, last_year]
                        try:
                            while 0 in candidates:
                                candidates.remove(0)
                        except ValueError:
                            pass

                        if len(candidates) == 0:
                            mean_value = 0
                        else:
                            mean_value = np.mean(candidates)
                        data[col][row] = mean_value
            except:
                input()

        return data

    def get_random(self):
        rand_scope = self.trainset.length - self.forecast_len
        idx = np.random.randint(rand_scope)

        data = self.trainset[idx : idx + self.forecast_len]

        encoded = data["encoded"].to(self.device)
        decoded = data["decoded"].to(self.device)

        return encoded, decoded

    def onehot(self, data: pd.DataFrame, target: str, category: pd.Series):
        """
        Onehot Encoding
        """

        self.encode_dims += len(category)

        if target in data.columns:
            data.drop(target, inplace=True, axis=1)
            self.encode_dims -= 1

        encoded = onehot_encoding(category)
        encoded.index = data.index

        return encoded

    def parse_datetime(self, data):
        data = data.astype(str)
        data = pd.to_datetime(data)
        return data

    def __len__(self):
        return self.length

    def __getitem__(self, idx):
        return self.train_dataset[idx]
