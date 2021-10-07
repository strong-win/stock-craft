import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time

from TIMEBAND.dataset import TIMEBANDDataset

plt.rcParams["font.family"] = "Malgun Gothic"


class TIMEBANDDashboard:
    def __init__(self, config: dict, dataset: TIMEBANDDataset) -> None:
        # Set Config
        self.set_config(config=config)

        # Dataset
        self.dataset = dataset
        self.timestamp = self.dataset.timestamp
        self.decode_dims = dataset.decode_dims
        self.targets_col = dataset.targets

        # Figure and Axis
        self.fig, self.axes = None, None

        # Data
        self.observed_len = None
        self.true_data = None

    def set_config(self, config: dict) -> None:
        """
        Configure settings related to the data set.

        params:
            config: Dashboard configuration dict
                `config['dashboard_cfg']`
        """

        # Data file configuration
        self.visual = config["visualize"]
        self.feats_by_rows = config["features_by_rows"]
        self.xinterval = config["xinterval"]

    def init_figure(self) -> tuple:
        # Config subplots
        nrows = 2 + (self.decode_dims - 1) // self.feats_by_rows
        ncols = 1
        size = (20, 10)
        color = "lightgray"

        fig, axes = plt.subplots(nrows, ncols, figsize=size, facecolor=color)
        # fig.tight_layout()

        axes[0].set_title("TARGET FEATURES")

        for row in range(1, len(axes)):
            idx_s = (row - 1) * self.feats_by_rows
            idx_e = idx_s + min(self.decode_dims - idx_s, self.feats_by_rows)
            subplot_title = f"TIMEBAND-Band Feature {idx_s} to {idx_e}"
            axes[row].set_title(subplot_title)

        self.fig, self.axes = fig, axes

    def visualize(self, batchs, true_data):
        if self.observed_len is None:
            self.observed_len = true_data.shape[0] - batchs

        for batch in range(batchs):
            base = max(0, self.observed_len - 80)
            upto = -28 + batch
            fig, axes = self.reset_figure()

            axes[0].plot(true_data[base:upto, 0], label=self.targets_col[0])

            for i in range(1, len(axes)):
                axes[i].axvspan(base, base + 80, alpha=0.2)
                axes[i].plot(true_data[: -28 + batch, :-1])

            self.observed_len += 1
            self.show_figure()

    def reset_figure(self):
        # Clear previous figure
        for i in range(len(self.axes)):
            self.axes[i].clear()
            # self.axes[i].grid()

        return self.fig, self.axes

    def show_figure(self):
        xticks = np.arange(self.observed_len)
        xlabels = self.dataset.timestamp[: self.observed_len]
        plt.xticks(xticks[:: self.xinterval], xlabels[:: self.xinterval], rotation=30)

        self.fig.show()
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()
