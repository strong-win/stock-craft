import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time

from TIMEBAND.dataset import TIMEBANDDataset

plt.rcParams["font.family"] = "Malgun Gothic"
plt.rc("font", family="Malgun Gothic")
plt.rc("axes", unicode_minus=False)


class TIMEBANDDashboard:
    def __init__(self, config: dict, dataset: TIMEBANDDataset) -> None:
        # Set Config
        self.set_config(config=config)

        # Dataset
        self.dataset = dataset
        self.idx = 0
        self.origin_df = dataset.origin_df
        self.origin_data = dataset.origin_data
        self.origin_cols = dataset.origin_cols
        self.origin_dims = len(self.origin_cols)

        self.target_df = dataset.target_df
        self.targets = dataset.target_data
        self.target_cols = dataset.target_cols
        self.target_dims = len(self.target_cols)

        self.timestamp = dataset.timestamp

        self.observed_len = dataset.observed_len
        self.forecast_len = dataset.forecast_len

        # Figure and Axis
        self.fig, self.axes = None, None

        # Data
        self.pred_data = None
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
        self.scope = config["scope"]
        self.feats_by_rows = config["features_by_rows"]
        self.xinterval = config["xinterval"]

        self.height = config["height"]
        self.width = config["width"]

    def init_figure(self) -> tuple:
        if self.fig is not None:
            return

        # Config subplots
        nrows = 1 # 2 + (self.origin_dims - 1) // self.feats_by_rows
        ncols = 1
        size = (self.width, self.height)

        plt.title("주가 데이터 Dashboard")
        fig, axes = plt.subplots(nrows, ncols, figsize=size, clear=True)
        # fig.tight_layout()
        axes = [axes]
        # axes[0].set_title("TARGET FEATURES")

        for i, ax in enumerate(axes[1:]):
            idx_s = i * self.feats_by_rows
            idx_e = idx_s + min(self.origin_dims - idx_s, self.feats_by_rows)
            subplot_title = f"TIMEBAND-Band Feature {idx_s} to {idx_e}"
            ax.set_title(subplot_title)

        self.fig, self.axes = fig, axes

    def visualize(self, batchs, reals, preds, predictions, std):
        if self.visual is False:
            return

        reals = reals.detach().numpy()
        preds = preds.detach().numpy()
        predictions = predictions.detach().numpy()
        std = std.detach().numpy()

        if self.pred_data is None:
            self.pred_data = self.origin_df[self.target_cols][: 2 * self.observed_len]
            self.lower = self.origin_df[self.target_cols][: 2 * self.observed_len]
            self.upper = self.origin_df[self.target_cols][: 2 * self.observed_len]

        self.pred_data = np.concatenate(
            [self.pred_data, np.zeros((batchs, self.target_dims))]
        )
        self.lower = np.concatenate([self.lower, np.zeros((batchs, self.target_dims))])
        self.upper = np.concatenate([self.upper, np.zeros((batchs, self.target_dims))])

        self.pred_data[-batchs - self.forecast_len : -1] = predictions[
            -batchs - self.forecast_len : -1
        ]
        self.upper[-self.forecast_len - batchs :] = (
            self.pred_data[-self.forecast_len - batchs :]
            + 2 * std[-self.forecast_len - batchs :]
        )
        self.lower[-self.forecast_len - batchs :] = (
            self.pred_data[-self.forecast_len - batchs :]
            - 2 * std[-self.forecast_len - batchs :]
        )

        # self.pred_data = self.target_data[:self.index + self.observed_len + batchs + self.forecast_len]
        # print(self.pred_data.shape)
        # self.pred_data = np.concatenate([self.pred_data, np.zeros((batchs+self.forecast_len, self.target_dims))])

        # self.pred_data = np.concatenate([self.pred_data[:-batchs-self.forecast_len], predictions[-batchs-self.forecast_len:]])
        # print(self.pred_data.shape)
        for batch in range(batchs):
            fig, axes = self.reset_figure()
            PIVOT = 0
            OBSRV = PIVOT + self.observed_len
            FRCST = OBSRV + self.forecast_len

            axes[0].axvline(PIVOT, color="k")
            axes[0].axvline(OBSRV - 1, color="k")
            axes[0].axvline(FRCST - 1, color="k")

            axes[0].axvspan(PIVOT, OBSRV - 1, alpha=0.05, label="Observed")
            axes[0].axvspan(OBSRV - 1, FRCST - 1, alpha=0.05, label="Forecast")

            xticks = np.arange(PIVOT, FRCST - 1)
            timelabel = [self.timestamp[x + self.idx] for x in xticks]

            axes[0].set_xticks(xticks[:: self.xinterval])
            axes[0].set_xticklabels(timelabel[:: self.xinterval], rotation=30)

            for col in range(self.target_dims):
                true_ticks = np.arange(PIVOT, OBSRV)
                pred_ticks = np.arange(OBSRV - 1, FRCST)
                label = self.target_cols[col]

                axes[0].plot(
                    self.targets[PIVOT + self.idx : FRCST + self.idx, col],
                    alpha=0.5,
                    label = label
                )
                # axes[0].plot(
                #     true_ticks,
                #     self.targets[PIVOT + self.idx : OBSRV + self.idx, col],
                #     label=f"Real {label}",
                # )

                axes[0].plot(
                    pred_ticks,
                    np.concatenate(
                        [
                            self.targets[OBSRV + self.idx - 1 : OBSRV + self.idx, col],
                            self.pred_data[OBSRV + self.idx : FRCST + self.idx, col],
                        ]
                    ),
                    alpha=0.2,
                    linewidth=5,
                    # label=f"Pred {label}",
                )
                # axes[0].fill_between(
                #     np.arange(PIVOT, FRCST),
                #     self.lower[PIVOT + self.idx : FRCST + self.idx, col],
                #     self.upper[PIVOT + self.idx : FRCST + self.idx, col],
                #     alpha=0.2,
                #     label=f"Prediciont Band {label}",
                # )
            axes[0].legend(loc="lower left")

            # # 하단 그래프
            # SCOPE = max(0, self.idx - self.scope)
            # PIVOT = SCOPE + self.observed_len + min(self.scope, self.idx)
            # OBSRV = PIVOT - self.observed_len
            # FRCST = PIVOT + self.forecast_len - 1

            # xticks = np.arange(SCOPE, FRCST)
            # trueticks = np.arange(SCOPE, PIVOT)
            # timelabel = [self.timestamp[x] for x in xticks]
            # for i, ax in enumerate(axes[1:]):
            #     ax.set_xticks(xticks[:: self.xinterval])
            #     ax.set_xticklabels(timelabel[:: self.xinterval], rotation=30)

            #     idx_s = i * self.feats_by_rows
            #     idx_e = idx_s + min(self.origin_dims - idx_s, self.feats_by_rows)

            #     ax.axvline(SCOPE)
            #     ax.axvline(PIVOT - 1)
            #     ax.axvline(OBSRV - 1)
            #     ax.axvline(FRCST)

            #     ax.axvspan(OBSRV - 1, PIVOT - 1, alpha=0.1, label="Observed window")
            #     ax.axvspan(PIVOT - 1, FRCST, alpha=0.1, color="r", label="Forecast window")

            #     # Origin data
            #     for idx in range(idx_s, idx_e):
            #         feature_label = self.origin_cols[idx]
            #         if feature_label not in self.target_cols:
            #             continue 

            #         alpha = 1.0 if feature_label in self.target_cols else 0.2
            #         ax.plot(
            #             np.arange(SCOPE, FRCST + 1),
            #             self.origin_data[SCOPE: FRCST + 1, idx],
            #             label=f"Real Value", # {feature_label}",
            #             alpha=alpha,
            #         )
            #         ax.plot(
            #             np.arange(SCOPE, FRCST + 1),
            #             self.pred_data[SCOPE : FRCST + 1, col],
            #             alpha=0.2,
            #             linewidth=5,
            #             label=f"Pred Value", # {feature_label}"
            #         )
            #         ax.fill_between(
            #             np.arange(SCOPE, FRCST + 1),
            #             self.lower[SCOPE : FRCST + 1, col],
            #             self.upper[SCOPE : FRCST + 1, col],
            #             label="Normal Band",
            #             alpha=0.2,
            #         )
            #     ax.legend(loc="lower left")

            self.show_figure()
            self.idx += 1

    def reset_figure(self):
        # Clear previous figure
        for i in range(len(self.axes)):
            self.axes[i].clear()

        return self.fig, self.axes

    def show_figure(self):
        base = max(0, self.observed_len - self.scope)

        xticks = np.arange(base + self.scope)
        xlabels = self.dataset.timestamp[: base + self.scope]

        # plt.xticks(xticks[:: self.xinterval], xlabels[:: self.xinterval], rotation=30)
        self.fig.show()
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

    def clear_figure(self):
        plt.close("all")
