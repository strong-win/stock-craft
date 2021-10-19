import os
import torch
import numpy as np
import pandas as pd
from utils.logger import Logger
from utils.preprocess import onehot_encoding


logger = Logger(__file__)


class Dataset:
    def __init__(self, dataset):
        self.forecast = dataset["forecast"]
        self.encoded = dataset["encoded"]
        self.decoded = dataset["decoded"]

        self.length = len(self.encoded)

    def __len__(self):
        return self.length

    def __getitem__(self, idx):
        data = {
            "forecast": torch.tensor(self.forecast[idx], dtype=torch.float32),
            "encoded": torch.tensor(self.encoded[idx], dtype=torch.float32),
            "decoded": torch.tensor(self.decoded[idx], dtype=torch.float32),
        }

        return data


class TIMEBANDDataset:
    """
    TIMEBAND Dataset

    """

    def __init__(self, config: dict, device: torch.device) -> None:
        """
        TIMEBAND Dataset

        Args:
            config: Dataset configuration dict
            device: Torch device (cpu / cuda:0)
        """
        # Set Config
        self.set_config(config)

        # Set device
        self.device = device

        # Load Data
        self.data = self.init_dataset()

        # Information
        logger.info(
            f"\n  Dataset: \n"
            f"  - File path : {self.csv_path} \n"
            f"  - Time Idx  : {self.time_index} \n"
            f"  - Length    : {self.data_length} \n"
            f"  - Shape(E/D): {self.encode_shape} / {self.decode_shape} \n"
            f"  - Targets   : {self.targets} ({self.decode_dim} cols) \n"
        )

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
        self.time_index = config["time_index"]
        self.time_format = config["time_format"]

        self.onehot_month = config["time_encoding"]["month"]
        self.onehot_weekday = config["time_encoding"]["weekday"]

        self.drops = config["drops"]
        self.targets = config["targets"]

        self.stride = config["stride"]
        self.batch_size = config["batch_size"]
        self.observed_len = config["observed_len"]
        self.forecast_len = config["forecast_len"]

        self.split_rate = config["split_rate"]
        self.min_valid_scale = config["min_valid_scale"]
        self.window_sliding = config["window_sliding"]

        # Preprocess
        self.scaler = config["scaler"]
        self.impute = config["impute"]
        self.cutoff_min = config["cutoff"]["min"]
        self.cutoff_max = config["cutoff"]["max"]

    def init_dataset(self) -> pd.DataFrame:
        # Read csv data
        self.csv_path = f"{self.data_path}.csv"
        data = pd.read_csv(self.csv_path)
        data.drop(self.drops, axis=1, inplace=True)

        # Time indexing
        data[self.time_index] = self.parse_datetime(data[self.time_index])
        data.set_index(self.time_index, inplace=True)
        data.sort_index(ascending=True, inplace=True)
        data.index = pd.to_datetime(data.index)
        self.times = data.index.strftime(self.time_format).tolist()

        # Time Encoding
        times = data.index.to_series()
        data = self.onehot(data, times.dt.month_name()) if self.onehot_month else data
        data = self.onehot(data, times.dt.day_name()) if self.onehot_weekday else data

        # First observed
        observed = data[self.targets][: self.observed_len].copy()
        self.observed = torch.from_numpy(observed.to_numpy())

        self.data_length = data.shape[0]
        self.encode_dim = len(data.columns)
        self.decode_dim = len(self.targets)

        # Datashape
        self.encode_shape = (self.batch_size, self.observed_len, self.encode_dim)
        self.decode_shape = (self.batch_size, self.forecast_len, self.decode_dim)
        self.dims = {"encode": self.encode_dim, "decode": self.decode_dim}
        
        return data

    def load_dataset(self, k_step):
        train_set, valid_set = self.process(k_step)

        self.trainset = Dataset(train_set)
        self.validset = Dataset(valid_set)

        # Feature info
        self.train_size = self.trainset.encoded.shape[0]
        self.valid_size = self.validset.encoded.shape[0]
        self.data_length = self.train_size + self.valid_size
        logger.info(f"  - Train size : {self.train_size}, Valid size {self.valid_size}")
        return self.trainset, self.validset

    def process(self, k_step=0):
        data = self.data.copy(deep=True)

        data_len = self.data_length - self.window_sliding + k_step
        data = data[:data_len] if k_step <= self.window_sliding else data
        decode_real = data[self.targets].copy(deep=True)

        # Preprocess
        if self.impute:
            data = self.impute_zero_value(data)

        self.minmax_scaler(data)
        data = self.normalize(data)

        # Encoded Split, Decoded Set split
        encode_data = data.copy()
        decode_data = data[self.targets].copy()

        # Windowing data
        stop = data_len - self.observed_len - self.forecast_len
        _, forecast = self.windowing(decode_real, stop)
        encoded, _ = self.windowing(encode_data, stop)
        _, decoded = self.windowing(decode_data, stop)

        def get_dataset(idx_s: int = 0, idx_e: int = data_len) -> dict:
            dataset = {
                "forecast": forecast[idx_s:idx_e],
                "encoded": encoded[idx_s:idx_e],
                "decoded": decoded[idx_s:idx_e],
            }
            return dataset

        # Dataset
        valid_minlen = int((self.min_valid_scale) * self.forecast_len)
        valid_idx = min(int(data_len * self.split_rate), data_len - valid_minlen)
        split_idx = valid_idx - self.forecast_len - self.observed_len

        train_set = get_dataset(idx_e=split_idx)
        valid_set = get_dataset(idx_s=split_idx)

        logger.info(f"Data len: {data_len}, Columns : {data.columns}")
        return train_set, valid_set

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

        self.encode_min = data.min(0) * (1 - 10 * min_p)
        self.encode_max = data.max(0) * (1 + 10 * max_p)

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

        return data

    def get_random(self):
        rand_scope = self.trainset.length - self.forecast_len
        idx = np.random.randint(rand_scope)

        data = self.trainset[idx : idx + self.forecast_len]

        encoded = data["encoded"].to(self.device)
        decoded = data["decoded"].to(self.device)

        return encoded, decoded

    def onehot(self, data: pd.DataFrame, category: pd.Series):
        """
        Onehot Encoding
        """
        encoded = onehot_encoding(category)
        encoded.index = data.index

        return pd.concat([data, encoded], axis=1)

    def parse_datetime(self, time_index: pd.Series):
        time_index = time_index.astype(str)
        time_index = pd.to_datetime(time_index)
        return time_index
