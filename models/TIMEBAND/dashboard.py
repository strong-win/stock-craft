import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import time

plt.rcParams["font.family"] = "Malgun Gothic"
DELTA = 2


class Dashboard_v2:
    def __init__(self, dataset) -> None:
        self.dataset = dataset
        self.target_col = self.dataset.targets
        self.decode_dim = self.dataset.decode_dim
        self.observed_len = self.dataset.observed_len
        self.forecast_len = self.dataset.forecast_len
        self.scope = DELTA * self.observed_len + self.forecast_len
        self.feature_by_rows = 7

        self.fig, self.ax = self.init_figure()
        self.predicted = 0

        self.true_data = None
        self.pred_list = [None] * self.forecast_len

    def init_figure(self) -> tuple:
        # Config subplots
        NROWS = 1 + (self.decode_dim - 1) // self.feature_by_rows

        fig, ax = plt.subplots(
            NROWS,
            1,
            figsize=(20, 10),
            facecolor="lightgray",
            sharex=True,
        )
        fig.tight_layout()

        if NROWS == 1:
            subplot_title = f"TIMEBAND-Band Feature to {self.decode_dim}"
            ax.set_title(subplot_title)
            ax = [ax]
        else:
            for row in range(len(ax)):
                feature_from = row * self.feature_by_rows
                feature_to = feature_from + min(
                    self.decode_dim - feature_from, self.feature_by_rows
                )
                subplot_title = f"TIMEBAND-Band Feature {feature_from} to {feature_to}"
                ax[row].set_title(subplot_title)

        return fig, ax

    def initalize(self, window):
        batch_size = window.shape[0]
        self.true_data = window[0]

        for batch in range(1, batch_size):
            self.true_data = np.concatenate([self.true_data, window[batch, -1:]])

        self.pred_list = [None] * self.forecast_len
        for f in range(self.forecast_len):
            self.pred_list[f] = self.true_data[: batch_size + f]

    def visualize(self, window, true, pred) -> None:
        # Clear figure

        # self.true_data, self.pred_data = self.data_concat(true, pred)

        true = true[0].cpu()
        REAL_GRAPH = np.concatenate([self.true_data, true])

        batch_size = int(window.shape[0])
        for b in range(batch_size):
            fig, ax = self.reset_figure()

            upto = self.observed_len + b
            preds = pred[b].cpu().detach().numpy()
            PRED_GRAPH = np.concatenate([self.pred_list[b], preds])
            for i, ax_ in enumerate(ax):
                idx_s = i * self.feature_by_rows
                idx_e = min((i + 1) * self.feature_by_rows, len(self.target_col))
                for f in range(idx_s, idx_e):
                    ax_.plot(
                        REAL_GRAPH[:upto, f],
                        color=f"C{f}",
                        alpha=0.2,
                        linewidth=3,
                        label=f"Real {self.target_col[f]}",
                    )
                    ax_.plot(
                        PRED_GRAPH[:upto, f],
                        color=f"C{f}",
                        alpha=1,
                        linewidth=1,
                        label=f"Fake {self.target_col[f]}",
                    )
                # # Legend
                ax_.legend(loc="upper left")
            # # Set Y limit by min-max
            # Show updated figure
            self.show_figure()
            plt.pause(0.01)

        # self.true_data, self.pred_data = self.data_concat(true, pred)

        # # print(self.pred_data.shape)
        # if self.pred_data.shape[0] == 15:
        #     print(self.pred_data)

        # start = max(self.observed_len, len(self.true_data) - self.scope + 1)
        # base = max(0, len(pred) - self.forecast_len - start)
        # # scope = max(0, len(self.true_data) - self.scope + self.forecast_len)

        # plt.axvspan(base + DELTA * self.observed_len, base + DELTA * self.observed_len + self.forecast_len, alpha=0.2)
        # for i, ax_ in enumerate(ax):
        #     feature_from = i * self.feature_by_rows
        #     feature_to = feature_from + min(self.decode_dim - feature_from, self.feature_by_rows)
        #     # Draw True data plot
        #     for j in range(feature_from, feature_to):
        #         label = self.target_col[j]

        #         for future in range(0, self.forecast_len, 2):
        #             # pred_scope = max(0, scope - self.observed_len)
        #             pred_scope = max(base, base - self.forecast_len)
        #             pred_j = np.concatenate([
        #                 self.true_data[-DELTA * self.observed_len - future:, j],
        #                 self.pred_data[-future - 1:, future, j]
        #             ])
        #             if self.scope < len(pred_j) - future:
        #                 pred_j = np.concatenate([
        #                     np.zeros((future)), pred_j
        #                 ])

        #             # pred_j = self.pred_data[pred_scope:, future, j]
        #             ax_.plot(pred_j[future:], alpha=1, linewidth=(self.forecast_len - future) // 2 + 1, label=f"Pred {future} {label}")

        # ax_.plot(self.true_data[-DELTA* self.observed_len:, j], color='k', alpha=1, linewidth=3, label=f"True {label}")

        # # Show updated figure
        # self.show_figure()

    def data_concat(self, true, pred) -> np.array:
        batch_size = true.shape[0]
        observed_len = true.shape[1]
        forecast_len = pred.shape[1]
        decode_dim = true.shape[2]
        true = true.numpy()
        pred = pred.detach().numpy()

        idx = 0
        if self.true_data is None:
            self.true_data = true[0]
            self.pred_data = np.zeros((0, forecast_len, decode_dim))

        # if self.predicted < forecast_len:
        #     for batch in range(batch_size):

        for batch in range(idx, batch_size):
            if (true[batch, -1:] == 0).sum() >= decode_dim // 2 + 1:
                continue

            self.true_data = np.concatenate([self.true_data, true[batch, -1:]])
            self.pred_data = np.concatenate([self.pred_data, pred[batch : batch + 1]])
            self.predicted = min(forecast_len, self.predicted + 1)

        return self.true_data, self.pred_data

    def reset_figure(self):
        # Clear previous figure
        for i in range(len(self.ax)):
            self.ax[i].clear()
            self.ax[i].grid()

        # Set X ticks
        xtick = np.arange(0, self.scope, 1)
        plt.xticks(xtick, rotation=30)

        return self.fig, self.ax

    def show_figure(self):
        self.fig.show()
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

    def close_figure(self):
        self.true_data = None
        self.pred_data = None

        plt.close("all")
        plt.pause(0.01)
        self.fig.canvas.flush_events()
        self.fig, self.ax = self.init_figure()


# class Dashboard:
#     def __init__(self, dataset):
#         super(Dashboard).__init__()
#         self.dataset = dataset
#         self.seq_len = dataset.observed_len

#         self.fig, self.ax = self.init_figure()

#         self.band_flag = False
#         self.bands = {"flag": False, "upper": list(), "lower": list()}

#         self.area_upper = None
#         self.area_lower = None
#         self.time = self.initialize(dataset.time)
#         self.scope = 1316
#         self.idx = 0

#         self.detects = list()

#     def init_figure(self):
#         fig, ax = plt.subplots(figsize=(20, 6), facecolor="lightgray")
#         fig.suptitle(self.dataset.title, fontsize=25)
#         fig.set_facecolor("lightgray")

#         ax.set_xlabel("Time")
#         ax.set_ylabel("Value")

#         return fig, ax

#     def initialize(self, value=None):
#         if value is None:
#             data_list = [list() for x in range(self.seq_len)]
#             for i in range(len(data_list)):
#                 data_list[i] = np.zeros(i)
#             return data_list
#         return value

#     def reset_figure(self):
#         self.ax.clear()
#         self.ax.grid()
#         return self.fig, self.ax

#     def show_figure(self):
#         self.fig.show(block=False)
#         self.fig.canvas.draw()
#         self.fig.canvas.flush_events()

#         return self.fig

#     def train_vis(self, data):
#         fig, ax = self.reset_figure()
#         start = max(self.seq_len, len(data) - self.scope + 1)

#         for i in range(1, 20):
#             ax.plot(data[start:, i], alpha=1, label=f"Column{i} data")

#         # # Fill Background Valid Area
#         # plt.fill_between(
#         #     (self.dataset.train_idx, self.dataset.valid_idx),
#         #     self.dataset.min,
#         #     self.dataset.max,
#         #     alpha=0.2,
#         #     label="Valid Set",
#         # )

#         # # Set Y limit by min-max
#         # plt.ylim(self.dataset.min, self.dataset.max
#         xtick = np.arange(0, self.scope, 20)
#         # values = self.time[start : start + self.scope : 24]

#         plt.xticks(xtick, rotation=30)
#         plt.legend()

#         self.show_figure()

#     def visualize(self, data, pred, label, bands, detects, pivot):
#         fig, ax = self.reset_figure()

#         start = max(self.seq_len, data.size - self.scope + 1)

#         length = len(pred)

#         # Pivot and Predict Area
#         base = max(0, length - self.seq_len - start)
#         detected = True in np.isin(label[:pivot], [1]) or True in np.isin(
#             label[:pivot], [-1]
#         )
#         pivot_color = "red" if detected else "lightblue"
#         preds_color = "red" if detected else "green"
#         plt.axvspan(base + pivot, length - start, facecolor=pivot_color, alpha=0.7)
#         plt.axvspan(base, base + pivot, facecolor=preds_color, alpha=0.3)

#         # Anomalies Line
#         for xpos, color in detects["labeled"]:
#             if xpos >= start:
#                 plt.axvline(xpos - start, 0, 1, color=color, linewidth=4, alpha=0.2)

#         for xpos, ypos, color in detects["analized"]:
#             if xpos >= start:
#                 plt.scatter(xpos - start, ypos, color=color, s=10)

#         # Bands Area
#         xscope = np.arange(len(bands["upper"][0][start:]))
#         for i in range(3):
#             color = "blue" if i < 2 else "red"
#             alpha = (3 - i) / 10
#             ax.fill_between(
#                 xscope,
#                 bands["upper"][i][start:],
#                 bands["lower"][i][start:],
#                 color=color,
#                 alpha=alpha,
#             )

#         # Data/Predict Line
#         ax.plot(data[start:], "r-", alpha=1, label="data")
#         ax.plot(pred[start:], "b-", alpha=0.2, label="pred")
#         ax.plot(bands["median"][start:], "k-", alpha=0.5, label="median")

#         xtick = np.arange(0, self.scope, 24)
#         values = self.time[start : start + self.scope : 24]

#         plt.ylim(self.dataset.min, self.dataset.max)
#         plt.xticks(xtick, values, rotation=30)
#         plt.legend()

#         self.show_figure()
