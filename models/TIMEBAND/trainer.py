import torch
import numpy as np
import pandas as pd

from tqdm import tqdm
from torch.optim import RMSprop
import matplotlib.pyplot as plt

from utils.logger import Logger
from TIMEBAND.model import TIMEBANDModel
from TIMEBAND.metric import TIMEBANDMetric
from TIMEBAND.dataset import TIMEBANDDataset
from TIMEBAND.dashboard import TIMEBANDDashboard

logger = Logger(__file__)


class TIMEBANDTrainer:
    def __init__(
        self,
        config: dict,
        dataset: TIMEBANDDataset,
        models: TIMEBANDModel,
        metric: TIMEBANDMetric,
        dashboard: TIMEBANDDashboard,
        device: torch.device,
    ) -> None:
        # Set device
        self.device = device

        self.dataset = dataset
        self.models = models
        self.metric = metric
        self.dashboard = dashboard

        # Set Config
        config = self.set_config(config=config)

        self.data = None
        self.answer = None
        self.future_data = None

        self.true_data = None

    def set_config(self, config: dict = None) -> dict:
        """
        Configure settings related to the data set.

        params:
            config: Trainer configuration dict
                `config['trainer']`
        """

        self.print_cfg = print_cfg = config["print"]

        # Train option
        self.lr_config = config["learning_rate"]
        self.lr = config["learning_rate"]["base"]
        self.lr_gammaG = config["learning_rate"]["gammaG"]
        self.lr_gammaD = config["learning_rate"]["gammaD"]

        self.trainer_config = config["epochs"]
        self.epochs = config["epochs"]["iter"]
        self.base_epochs = config["epochs"]["base"]
        self.iter_epochs = config["epochs"]["iter"]
        self.iter_critic = config["epochs"]["critic"]

        self.amplifier = config["amplifier"]

        # Print option
        self.print_verbose = print_cfg["verbose"]
        self.print_interval = print_cfg["interval"]

        # Visual option
        self.print_cfg = config["print"]

    def train(self, trainset, validset):
        logger.info("Train the model")

        # Models Setting
        models = self.models
        self.netD, self.netG = models.load_model(self.dataset.dims)

        self.optimD = RMSprop(self.netD.parameters(), lr=self.lr * self.lr_gammaD)
        self.optimG = RMSprop(self.netG.parameters(), lr=self.lr * self.lr_gammaG)

        # Score plot
        train_score_plot = []
        valid_score_plot = []
        EPOCHS = self.base_epochs + self.iter_epochs
        for epoch in range(self.base_epochs, EPOCHS):
            # Dashboard
            self.dashboard.init_figure()

            # Train Section
            losses = init_loss()
            train_tqdm = tqdm(trainset, loss_info("Train", epoch, losses))
            train_score = self.train_step(train_tqdm, epoch, training=True)
            train_score_plot.append(train_score)

            # Valid Section
            losses = init_loss()
            valid_tqdm = tqdm(validset, loss_info("Valid", epoch))
            valid_score = self.train_step(valid_tqdm, epoch, training=False)
            valid_score_plot.append(valid_score)

            if (epoch + 1) % models.save_interval == 0:
                models.save(self.netD, self.netG)

            # Best Model save
            self.netD, self.netG = models.update(self.netD, self.netG, valid_score)

        best_score = models.best_score
        netD_best, netG_best = models.load(postfix=f"{best_score:.4f}")
        models.save(netD_best, netG_best)

        return self.netD, self.netG

    def train_step(self, tqdm, epoch, training=True):
        def discriminate(x):
            return self.netD(x).to(self.device)

        def generate(x):
            return self.netG(x).to(self.device)

        self.data = None
        self.answer = None

        losses = init_loss()
        TAG = "Train" if training else "Valid"
        for i, data in enumerate(tqdm):
            if training:
                for _ in range(self.iter_critic):
                    true_x, true_y = self.dataset.get_random()
                    fake_y = generate(true_x)

                    Dx = discriminate(true_y)
                    Dy = discriminate(fake_y)
                    self.optimD.zero_grad()

                    loss_GP = self.metric.grad_penalty(fake_y, true_y)
                    loss_D_ = Dy.mean() - Dx.mean()

                    loss_D = loss_D_ + loss_GP
                    loss_D.backward()
                    self.optimD.step()

            # Data
            true_x = data["encoded"].to(self.device)
            true_y = data["decoded"].to(self.device)
            real_x = data["observed"]
            real_y = data["forecast"]
            batchs = true_y.shape[0]

            # Optimizer initialize
            self.optimD.zero_grad()
            self.optimG.zero_grad()

            # #######################
            # Discriminator Training
            # #######################
            Dx = discriminate(true_y)
            errD_real = self.metric.GANloss(Dx, target_is_real=True)

            fake_y = generate(true_x)

            Dy = discriminate(fake_y)
            errD_fake = self.metric.GANloss(Dy, target_is_real=False)
            errD = errD_real + errD_fake

            if training:
                errD_real.backward(retain_graph=True)
                errD_fake.backward(retain_graph=True)
                self.optimD.step()

            # Discriminator Loss
            losses["D"] += errD

            # #######################
            # Generator Trainining
            # #######################
            Dy = self.netD(fake_y)
            err_G = self.metric.GANloss(Dy, target_is_real=False)
            err_l1 = self.metric.l1loss(true_y, fake_y)
            err_l2 = self.metric.l2loss(true_y, fake_y)
            err_gp = self.metric.grad_penalty(true_y, fake_y)
            errG = err_G + err_l1 + err_l2 + err_gp

            if training:
                errG.backward(retain_graph=True)
                self.optimG.step()

            # Generator Loss
            losses["G"] += err_G
            losses["l1"] += err_l1
            losses["l2"] += err_l2
            losses["GP"] += err_gp

            # #######################
            # Scoring
            # #######################
            pred_y = self.dataset.denormalize(fake_y.cpu())
            # for f in range(self.dataset.decode_dims):
            #     pred_y[:, :, f] = pred_y[:, :, f] * self.data_gamma[f]

            self.data_concat(real_x, real_y, pred_y)
            self.predict(pred_y)

            score = self.metric.NMAE(pred_y, real_y, real_test=True).detach().numpy()
            score_all = self.metric.NMAE(pred_y, real_y).detach().numpy()

            # Losses Log
            losses["Score"] += score
            losses["ScoreAll"] += score_all

            tqdm.set_description(loss_info(TAG, epoch, losses, i))
            # if not training and self.visual is True:
            #     self.dashboard.initalize(window)
            self.data_process(real_x)

            self.dashboard.visualize(batchs, self.true_data)

        self.result(real_y, training)

        return losses["Score"] / (i + 1)

    def data_process(self, real):
        batch_size = real.shape[0]

        if self.true_data is None:
            self.true_data = real[0, :-1, :]

        for b in range(batch_size):
            self.true_data = np.concatenate([self.true_data, real[b, -1:, :]])

    def data_concat(self, real, true, pred):
        batch_size = pred.shape[0]
        window_size = pred.shape[1]
        future_size = pred.shape[1]
        feature_dim = pred.shape[2]

        real = real.reshape((-1, window_size, feature_dim))
        true = true.reshape((-1, future_size, feature_dim))
        pred = pred.reshape((-1, future_size, feature_dim))

        if self.data is None:
            empty = torch.empty(pred.shape)
            self.data = {
                "real": torch.cat([real[0, :-1], real[:, -1]]),
                "true": torch.cat([true[0, :-1], true[:, -1]]),
                "pred": torch.cat([empty, pred]),
            }
            return

        self.data["real"] = torch.cat([self.data["real"], real[:, -1]])
        self.data["true"] = torch.cat([self.data["true"], true[:, -1]])
        self.data["pred"] = torch.cat([self.data["pred"], pred])

    def predict(self, pred):
        batch_size = pred.shape[0]
        future_size = pred.shape[1]
        feature_dim = pred.shape[2]

        pred = pred.reshape((-1, future_size, feature_dim))

        preds = np.concatenate(
            [
                self.data["pred"][-batch_size - future_size :].detach().numpy(),
                np.zeros((batch_size, future_size, feature_dim)),
            ]
        )

        if self.answer is None:
            self.answer = np.zeros(
                (batch_size + future_size - 1, future_size, feature_dim)
            )
            self.index = 0
        else:
            self.answer = np.concatenate(
                [self.answer, np.zeros((batch_size, future_size, feature_dim))],
            )

        for f in range(future_size):
            self.answer[self.index + f : self.index + f + batch_size, f] = preds[
                batch_size : 2 * batch_size, f
            ]

        self.index += batch_size

    def result(self, y_pred, training=False):
        #### Result

        results = None
        for f in range(y_pred.shape[2]):
            data = self.answer[:, :, f]
            data[data == 0] = np.nan

            predict_mean = np.nanmean(data, axis=1).reshape((-1, 1))
            predict_median = np.nanmedian(data, axis=1).reshape((-1, 1))

            true = self.data["true"][:, f : f + 1]

            mean = torch.tensor(predict_mean)
            median = torch.tensor(predict_median)
            week1 = torch.tensor(data[:, 6:7])
            week2 = torch.tensor(data[:, 13:14])
            week4 = torch.tensor(data[:, 27:28])

            target = torch.where(true != 0)
            mean[target] = (true[target] - mean[target]) / true[target]
            median[target] = (true[target] - median[target]) / true[target]
            week1[target] = (true[target] - week1[target]) / true[target]
            week2[target] = (true[target] - week2[target]) / true[target]
            week4[target] = (true[target] - week4[target]) / true[target]

            target = torch.where(true == 0)
            mean[target] = 0
            median[target] = 0
            week1[target] = 0
            week1[target] = 0
            week2[target] = 0
            week4[target] = 0

            mean_score = torch.sum(torch.abs(mean)) / torch.count_nonzero(true)
            median_score = torch.sum(torch.abs(median)) / torch.count_nonzero(true)
            week1_score = torch.sum(
                torch.abs(week1[~torch.any(week1.isnan(), dim=1)])
            ) / torch.count_nonzero(true[~torch.any(week1.isnan(), dim=1)])
            week2_score = torch.sum(
                torch.abs(week2[~torch.any(week2.isnan(), dim=1)])
            ) / torch.count_nonzero(true[~torch.any(week2.isnan(), dim=1)])
            week4_score = torch.sum(
                torch.abs(week4[~torch.any(week4.isnan(), dim=1)])
            ) / torch.count_nonzero(true[~torch.any(week4.isnan(), dim=1)])

            _mean_score = torch.sum(mean) / torch.count_nonzero(true)
            _median_score = torch.sum(median) / torch.count_nonzero(true)
            _week1_score = torch.sum(
                week1[~torch.any(week1.isnan(), dim=1)]
            ) / torch.count_nonzero(true[~torch.any(week1.isnan(), dim=1)])
            _week2_score = torch.sum(
                week2[~torch.any(week2.isnan(), dim=1)]
            ) / torch.count_nonzero(true[~torch.any(week2.isnan(), dim=1)])
            _week4_score = torch.sum(
                week4[~torch.any(week4.isnan(), dim=1)]
            ) / torch.count_nonzero(true[~torch.any(week4.isnan(), dim=1)])

            abs_mean_err = np.array(
                [
                    [
                        mean_score,
                        median_score,
                        (week1_score + week2_score + week4_score) / 3,
                        week1_score,
                        week2_score,
                        week4_score,
                    ]
                ]
            )

            mean_err = np.array(
                [
                    [
                        _mean_score,
                        _median_score,
                        (_week1_score + _week2_score + _week4_score) / 3,
                        _week1_score,
                        _week2_score,
                        _week4_score,
                    ]
                ]
            )

            mean_err = mean_err.reshape(-1, 1)
            abs_mean_err = abs_mean_err.reshape(-1, 1)
            # if training is True:
            #     self.data_gamma[f] += mean_err[3] * abs_mean_err[3] * 0.1

            abs_mean_err = np.concatenate([abs_mean_err, mean_err], axis=1)
            if results is None:
                results = pd.DataFrame(abs_mean_err)
            else:
                results = pd.DataFrame(np.concatenate([results, abs_mean_err], axis=1))

        mean = results.mean(axis=1).values.reshape((-1, 1))
        results = pd.DataFrame(np.concatenate([results, mean], axis=1))
        results = results.set_axis(
            ["Mean", "Median", "Week124", "Week1", "Week2", "Week4"], axis=0
        )
        # logger.info(f"\n{results}")

        # data_gamma_df = pd.DataFrame(self.data_gamma).set_axis(["DataGamma"], axis=0)
        # logger.info(f"\n{data_gamma_df.T}")
        # self.data_gamma = next_gamma


def loss_info(process, epoch, losses=None, i=0):
    if losses is None:
        losses = init_loss()

    return (
        f"[{process} e{epoch + 1:4d}]"
        f"Score {losses['Score']/(i+1):7.4f}("
        f"all {losses['ScoreAll']/(i+1):5.2f} "
        f"D {losses['D']/(i+1):7.3f} "
        f"G {losses['G']/(i+1):7.3f} "
        f"L1 {losses['l1']/(i+1):6.3f} "
        f"L2 {losses['l2']/(i+1):6.3f} "
        f"GP {losses['GP']/(i+1):7.3f} "
    )


def init_loss() -> dict:
    return {
        "G": 0,
        "D": 0,
        "l1": 0,
        "l2": 0,
        "GP": 0,
        "Score": 0,
        "ScoreAll": 0,
    }
