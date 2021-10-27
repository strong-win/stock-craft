import os
import torch
import numpy as np
import pandas as pd
from tabulate import tabulate
from .utils.dataset import Dataset
from .utils.time import time_cycle

logger = None


class TIMEBANDDataset:
    """
    TIMEBAND Dataset

    """

    def __init__(self, config: dict) -> None:
        """
        TIMEBAND Dataset

        Args:
            config: Dataset configuration dict
            device: Torch device (cpu / cuda:0)
        """
        global logger
        logger = config["logger"]

        # Set Config
        self.set_config(config)

        # Load Data
        self.data = self.init_dataset()

        # Information
        logger.info(
            f"\n  Dataset: \n"
            f"  - Config    : {config} \n"
            f"  - File path : {self.csv_path} \n"
            f"  - Time Idx  : {self.time_index} \n"
            f"  - Length    : {self.data_length} \n"
            f"  - Shape(E/D): {self.encode_shape} / {self.decode_shape} \n"
            f"  - Targets   : {self.targets} ({self.decode_dim} cols) \n"
            f"  - Cut Scale : Min {self.cutoff['min']}, Max {self.cutoff['max']}"
            f"  - Input Col : {self.data.columns}",
            level=0,
        )

    def set_config(self, config: dict) -> None:
        """
        Configure settings related to the data set.

        params:
            config: Dataset configuration dict
                `config['core'] & config['dataset']`
        """

        # Data file configuration
        logger.info("Timeband Dataset Setting")
        self.__dict__ = {**config, **self.__dict__}
        self.data_path = os.path.join(self.directory, self.data_name)
        self.missing_path = os.path.join(self.path, "missing_label.csv")
        self.anomaly_path = os.path.join(self.path, "anomaly_label.csv")

    def init_dataset(self) -> pd.DataFrame:
        # Read csv data
        self.csv_path = os.path.join(self.directory, f"{self.data_name}.csv")
        self.origin = data = pd.read_csv(self.csv_path, parse_dates=[self.time_index])
        data.drop(self.drops, axis=1, inplace=True)

        # Time indexing
        times = data[self.time_index].dt
        data.set_index(self.time_index, inplace=True)
        data.sort_index(ascending=True, inplace=True)
        self.times = data.index.strftime(self.time_format).tolist()

        # Fill time gap
        target_origin = data[self.targets]
        data = data.interpolate(method="time")

        # Observed / Forecast
        observed = data[self.targets][: self.observed_len + self.forecast_len]
        forecast = data[self.targets][self.observed_len :]
        self.observed = torch.from_numpy(observed.to_numpy())
        self.forecast = torch.from_numpy(forecast.to_numpy())

        # Missing Value
        data = self.impute_zero_value(data) if self.zero_impute else data
        if os.path.exists(self.missing_path):
            self.missing_df = pd.read_csv(self.missing_path)
            self.missing_df.drop(self.time_index, axis=1, inplace=True)
            self.missing = self.missing_df.to_numpy()
        else:
            self.missing = target_origin.isna().astype(int).to_numpy()
            self.missing[target_origin == 0] = 1 if self.zero_is_missing else 0
            self.missing_df = pd.DataFrame(
                self.missing, columns=self.targets, index=data.index
            )
            self.missing_df.to_csv(self.missing_path)
        self.missing = self.missing[self.observed_len :]

        # Anomalies
        self.anomaly = np.zeros(data[self.targets].shape)
        self.anomaly[:] = np.nan
        self.anomaly_df = pd.DataFrame(
            self.anomaly, columns=self.targets, index=data.index
        )
        self.anomaly_df.to_csv(self.anomaly_path)

        # Data Processing
        data = self.minmax_scaler(data)
        data = self.normalize(data)

        # Time Encoding
        if self.time_info["month"]:
            # data = self.onehot(data, times.month_name())
            data = time_cycle(data, times.month, 12, "months")

        if self.time_info["weekday"]:
            # data = self.onehot(data, times.day_name())
            data = time_cycle(data, times.weekday, 7, "weekday")

        if self.time_info["days"]:
            data = time_cycle(data, times.day, 31, "days", cycle=False)

        if self.time_info["hours"]:
            data = time_cycle(data, times.hour, 24, "hours")

        if self.time_info["minutes"]:
            data = time_cycle(data, times.minute, 60, "minutes")

        # Data shape
        self.data_length = data.shape[0]
        self.encode_dim = len(data.columns)
        self.decode_dim = len(self.targets)
        self.dims = {
            "encode": self.encode_dim,
            "decode": self.decode_dim,
        }
        self.encode_shape = (self.batch_size, self.observed_len, self.encode_dim)
        self.decode_shape = (self.batch_size, self.forecast_len, self.decode_dim)

        return data

    def prepare_dataset(self, k_step: int = 0) -> pd.DataFrame:
        # Prepare data
        data_len = self.data_length - self.sliding_step + k_step
        data = self.data[:data_len]

        # Windowing data
        stop = data_len - self.observed_len - self.forecast_len
        encoded, decoded = self.windowing(data, stop)

        # Split dataset
        valid_minlen = int((self.min_valid_scale) * self.forecast_len)
        valid_idx = min(int(data_len * self.split_rate), data_len - valid_minlen)
        split_idx = valid_idx - self.forecast_len - self.observed_len

        # Dataset Preparing
        self.trainset = Dataset(encoded[:split_idx], decoded[:split_idx])
        self.validset = Dataset(encoded[split_idx:], decoded[split_idx:])

        # Feature info
        self.train_size = self.trainset.encoded.shape[0]
        self.valid_size = self.validset.encoded.shape[0]
        logger.info(f"  - Train size : {self.train_size}, Valid size {self.valid_size}")

        return self.trainset, self.validset

    def prepare_testset(self) -> pd.DataFrame:
        # Prepare data
        data_len = self.data_length
        data = self.data[:data_len]

        # Windowing data
        stop = data_len - self.observed_len - self.forecast_len
        encoded, decoded = self.windowing(data, stop)

        # Dataset Preparing
        dataset = Dataset(encoded, decoded)

        # Feature info
        data_size = dataset.encoded.shape[0]
        logger.info(f" - Data size : {data_size}")

        return dataset

    def windowing(self, x: pd.DataFrame, stop: int) -> tuple((np.array, np.array)):
        observed = []
        forecast = []

        y = x[self.targets]
        for i in range(0, stop, self.stride):
            j = i + self.observed_len

            observed.append(x[i : i + self.observed_len])
            forecast.append(y[j : j + self.forecast_len])

        observed = np.array(observed)
        forecast = np.array(forecast)

        return observed, forecast

    def impute_zero_value(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Impute
        """

        for col in data:
            for row in range(len(data[col])):
                if data[col][row] == 0:
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

    def minmax_scaler(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Cutted Min Max Scaler
        """
        # Data Local
        self.origin_max = data.max()
        self.origin_min = data.min()

        min_p, max_p = self.cutoff["min"], self.cutoff["max"]

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

        target_col = ["O" if col in self.targets else "" for col in data.columns]

        df = pd.DataFrame(
            {
                f"TARGET": target_col,
                f"origin MIN": self.origin_min,
                f"cutoff min": self.encode_min,
                f"origin MAX": self.origin_max,
                f"cutoff max": self.encode_max,
            },
        )

        logger.info(
            f"Min Max info\n{tabulate(df, headers='keys', floatfmt='.2f')}", level=0
        )

        return data

    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize input in [-1,1] range, saving statics for denormalization"""
        # 2 * (x - x.min) / (x.max - x.min) - 1

        data = data - self.encode_min
        data = data / (self.encode_max - self.encode_min)
        data = 2 * data - 1

        return data

    def denormalize(self, data: pd.DataFrame) -> pd.DataFrame:
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

    def onehot(self, data: pd.DataFrame, category: pd.Series) -> pd.DataFrame:
        """
        Onehot Encoding
        """
        categories = sorted(set(category))
        n_category = len(categories)

        df = []
        for value in category:
            vec = [0] * n_category
            find = np.where(np.array(categories) == value)[0][0]
            vec[find] = 1.0
            df.append(vec)

        encoded = pd.DataFrame(df, columns=categories, index=data.index)
        return pd.concat([data, encoded], axis=1)

    def get_random(self):
        rand_scope = self.trainset.length - self.forecast_len
        idx = np.random.randint(rand_scope)

        data = self.trainset[idx : idx + self.forecast_len]

        encoded = data["encoded"].to(self.device)
        decoded = data["decoded"].to(self.device)

        return encoded, decoded
