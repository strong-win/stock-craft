import numpy as np
import matplotlib.pyplot as plt

from utils.color import COLORS
from TIMEBAND.dataset import TIMEBANDDataset

plt.rcParams["font.family"] = "Malgun Gothic"
plt.rc("font", family="Malgun Gothic")
plt.rc("axes", unicode_minus=False)


class TIMEBANDDashboard:
    def __init__(self, config: dict, dataset: TIMEBANDDataset) -> None:
        # Set Config
        self.set_config(config=config)

        # Dataset
        self.time_idx = 0
        self.dataset = dataset

        self.observed = dataset.observed
        self.target_cols = dataset.targets
        self.target_dims = len(self.target_cols)

        self.timestamp = dataset.times

        self.observed_len = dataset.observed_len
        self.forecast_len = dataset.forecast_len

        # Figure and Axis
        self.fig, self.axes = None, None

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
        if self.visual is False:
            return

        self.time_idx = 0

        # Config subplots
        nrows = 2 + (self.target_dims - 1) // self.feats_by_rows
        ncols = 1
        size = (self.width, self.height)

        plt.title("주가 데이터 Dashboard")
        fig, axes = plt.subplots(nrows, ncols, figsize=size, clear=True)
        # fig.tight_layout()
        # axes[0].set_title("TARGET FEATURES")

        for i, ax in enumerate(axes):
            idx_s = i * self.feats_by_rows
            idx_e = idx_s + min(self.target_dims - idx_s, self.feats_by_rows)
            subplot_title = f"TIMEBAND-Band Feature {idx_s} to {idx_e}"
            ax.set_title(subplot_title)

        self.fig, self.axes = fig, axes

    def visualize(self, batchs, real_data, pred, pred_data, std):
        if self.visual is False:
            return

        pred = pred.detach().numpy()
        if not hasattr(self, "lower"):
            zero_forecast = np.zeros(pred_data.shape)
            empty_forecast = np.empty(pred_data.shape)

            self.std = np.concatenate([np.zeros(self.observed.shape), zero_forecast])
            self.reals = np.concatenate([self.observed, real_data[0, :-1], real_data[:, -1]])
            self.preds = np.concatenate([self.observed, empty_forecast])
            self.lower = self.preds.copy()
            self.upper = self.preds.copy()
        else:
            empty_forecast = np.empty((batchs, self.target_dims))

            self.std = np.concatenate([self.std, empty_forecast])
            self.reals = np.concatenate([self.reals, real_data[:, -1]])
            self.preds = np.concatenate([self.preds, empty_forecast])
            self.lower = np.concatenate([self.lower, empty_forecast])
            self.upper = np.concatenate([self.upper, empty_forecast])

        update_idx = -pred_data.shape[0]
        self.std[update_idx:] = std
        self.preds[update_idx:] = pred_data
        self.lower[update_idx:] = pred_data - self.std[update_idx:]
        self.upper[update_idx:] = pred_data + self.std[update_idx:]

        for batch in range(batchs):
            fig, axes = self.reset_figure()
            # 하단 그래프
            SCOPE = max(0, self.time_idx - self.scope)
            PIVOT = SCOPE + self.observed_len + min(self.scope, self.time_idx)
            OBSRV = PIVOT - self.observed_len
            FRCST = PIVOT + self.forecast_len

            xticks = np.arange(SCOPE, FRCST)
            true_ticks = np.arange(SCOPE, PIVOT)
            pred_ticks = np.arange(SCOPE, FRCST)
            timelabel = [self.timestamp[x] for x in xticks]
            target_col = 0
            for i, ax in enumerate(axes):
                ax.set_xticks(xticks[:: self.xinterval])
                ax.set_xticklabels(timelabel[:: self.xinterval], rotation=30)

                idx_s = i * self.feats_by_rows
                idx_e = idx_s + min(self.target_dims - idx_s, self.feats_by_rows)

                ax.axvline(SCOPE)
                ax.axvline(PIVOT - 1)
                ax.axvline(OBSRV - 1)
                ax.axvline(FRCST + 1)

                ax.axvspan(OBSRV - 1, PIVOT - 1, alpha=0.1, label="Observed window")
                ax.axvspan(PIVOT - 1, FRCST, alpha=0.1, color="r", label="Forecast window")

                for target_col in range(idx_s, idx_e):
                    feature_label = self.target_cols[target_col]
                    color = COLORS[target_col]
                    ax.plot(
                        true_ticks,
                        self.reals[SCOPE:PIVOT, target_col],
                        label=f"Real {feature_label}",
                        color=color,
                    )
                    ax.plot(
                        pred_ticks,
                        self.reals[SCOPE:FRCST, target_col],
                        color=color,
                    )
                    ax.plot(
                        pred_ticks,
                        self.preds[SCOPE:FRCST, target_col],
                        alpha=0.2,
                        linewidth=5,
                        color=color,
                        label=f"Pred {feature_label}",
                    )
                    ax.fill_between(
                        pred_ticks,
                        self.lower[SCOPE:FRCST, target_col],
                        self.upper[SCOPE:FRCST, target_col],
                        label="Normal Band",
                        color=color,
                        alpha=0.2,
                    )
                    target_col += 1
                ax.legend(loc="lower left")
                ax.relim()
            self.time_idx += 1
            self.show_figure()

    def reset_figure(self):
        # Clear previous figure
        for i in range(len(self.axes)):
            self.axes[i].clear()
            self.axes[i].set_ylim(auto=True)

        return self.fig, self.axes

    def show_figure(self) -> None:
        self.fig.show()
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

    def clear_figure(self) -> None:
        if self.visual is False:
            return

        plt.close("all")
        plt.clf()

        del self.std
        del self.preds
        del self.lower
        del self.upper
        self.fig = None
        self.axes = None
