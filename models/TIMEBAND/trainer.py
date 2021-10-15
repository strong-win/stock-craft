import torch
import numpy as np
import pandas as pd

from tqdm import tqdm
from torch import Tensor
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
        self.reals = None
        self.preds = None
        self.answer = None
        self.predictions = None
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
        self.netD, self.netG = models.init(self.dataset.dims)

        self.optimD = RMSprop(self.netD.parameters(), lr=self.lr * self.lr_gammaD)
        self.optimG = RMSprop(self.netG.parameters(), lr=self.lr * self.lr_gammaG)

        # Score plot
        train_score_plot = []
        valid_score_plot = []
        EPOCHS = self.base_epochs + self.iter_epochs
        for epoch in range(self.base_epochs, EPOCHS):
            self.preds = None
            self.data = None
            self.answer = None

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

            self.dashboard.clear_figure()

        best_score = models.best_score
        netD_best, netG_best = models.load(postfix=f"{best_score:.4f}")
        models.save(netD_best, netG_best)
        return self.netD, self.netG

    def train_step(self, tqdm, epoch, training=True):
        def discriminate(x):
            return self.netD(x).to(self.device)

        def generate(x):
            # FIXME
            # 현재 Obeserved Len은 forecast Len보다 크거나 같아야함.
            fake_y = self.netG(x)[:, : self.dataset.forecast_len]
            return fake_y.to(self.device)

        losses = init_loss()
        TAG = "Train" if training else "Valid"
        for i, data in enumerate(tqdm):
            # #######################
            # Critic
            # #######################
            if training:
                for _ in range(self.iter_critic):
                    # Data Load
                    true_x, true_y = self.dataset.get_random()
                    fake_y = generate(true_x)

                    # Optimizer initialize
                    self.optimD.zero_grad()

                    Dx = discriminate(true_y)
                    Dy = discriminate(fake_y)

                    errD_real = self.metric.GANloss(Dx, target_is_real=True)
                    errD_fake = self.metric.GANloss(Dy, target_is_real=False)
                    errGP = self.metric.grad_penalty(fake_y, true_y)

                    errD = errD_real + errD_fake + errGP
                    errD.backward(retain_graph=True)
                    self.optimD.step()

            # Data
            true_x = data["encoded"].to(self.device)
            true_y = data["decoded"].to(self.device)
            real_x = data["observed"]
            real_y = data["forecast"]
            fake_y = generate(true_x)

            batchs = true_y.shape[0]

            # Optimizer initialize
            self.optimD.zero_grad()
            self.optimG.zero_grad()

            # #######################
            # Discriminator Training
            # #######################
            Dx = discriminate(true_y)
            Dy = discriminate(fake_y)

            errD_real = self.metric.GANloss(Dx, target_is_real=True)
            errD_fake = self.metric.GANloss(Dy, target_is_real=False)

            losses["D"] = errD_real + errD_fake

            if training:
                errD = errD_real + errD_fake
                errD.backward(retain_graph=True)
                self.optimD.step()

            # #######################
            # Generator Trainining
            # #######################
            Dy = self.netD(fake_y)
            errG_ = self.metric.GANloss(Dy, target_is_real=False)
            errl1 = self.metric.l1loss(fake_y, true_y)
            errl2 = self.metric.l2loss(fake_y, true_y)
            errGP = self.metric.grad_penalty(fake_y, true_y)
            errG = errG_ + errl1 + errl2 + errGP

            losses["G"] += errG_
            losses["l1"] += errl1
            losses["l2"] += errl2
            losses["GP"] += errGP

            if training:
                errG.backward(retain_graph=True)
                self.optimG.step()

            # #######################
            # Scoring
            # #######################
            pred_y = self.dataset.denormalize(fake_y.cpu())
            self.concat(real_x, pred_y)

            losses["Score"] += self.metric.NMAE(pred_y, real_y).detach().numpy()

            # Losses Log
            tqdm.set_description(loss_info(TAG, epoch, losses, i))
            self.dashboard.visualize(
                batchs, self.reals, self.preds, self.predictions, self.std
            )

        return losses["Score"] / (i + 1)

    def data_process(self, real):
        batch_size = real.shape[0]

        if self.true_data is None:
            self.true_data = real[0, :-1, :]

        for b in range(batch_size):
            self.true_data = np.concatenate([self.true_data, real[b, -1:, :]])

    def concat(self, real_x: Tensor, pred_y: Tensor):
        batch_size = pred_y.shape[0]
        future_len = pred_y.shape[1]
        target_dim = pred_y.shape[2]

        if self.preds is None:
            observe_len = real_x.shape[1]
            origin_dim = real_x.shape[2]

            self.index = 0
            self.reals = torch.zeros((future_len, observe_len, origin_dim))
            self.preds = torch.zeros((future_len, future_len, target_dim))

            self.answer = torch.zeros((future_len, future_len, target_dim))
            self.predictions = torch.zeros((future_len, target_dim))
            self.std = torch.zeros((future_len, target_dim))

        zeros_3 = torch.zeros((batch_size, future_len, target_dim))
        zeros_2 = torch.zeros((batch_size, target_dim))

        self.reals = torch.cat([self.reals, real_x])
        self.preds = torch.cat([self.preds, pred_y])

        self.answer = torch.cat([self.answer, zeros_3])
        self.predictions = torch.cat([self.predictions, zeros_2])
        self.std = torch.cat([self.std, zeros_2])

        for f in range(future_len):
            idx_s = self.index + f
            self.answer[idx_s : idx_s + batch_size, f] = self.preds[-batch_size:, f]

        ans = self.answer[-batch_size - future_len :].detach().numpy()
        ans[:-1][ans[:-1] == 0] = np.nan
        median = np.nanmedian(ans, axis=1)
        std = np.nanstd(ans, axis=1)  # / np.count_nonzero(~np.isnan(ans), axis=1)

        GAMMA = (batch_size - 1) / batch_size
        for f in range(future_len):
            std[f - future_len] = (
                std[f - future_len] + std[f - future_len - 1]
            ) * GAMMA

        self.predictions[-batch_size - future_len :] = torch.from_numpy(median)
        self.std[-batch_size - future_len :] = torch.from_numpy(std)

        df = pd.DataFrame(
            np.concatenate(
                [
                    self.predictions[-batch_size - future_len :],
                    median[-batch_size - future_len :],
                    std[-batch_size - future_len :],
                ],
                axis=1,
            )
        )

        self.index += batch_size


def loss_info(process, epoch, losses=None, i=0):
    if losses is None:
        losses = init_loss()

    return (
        f"[{process} e{epoch + 1:4d}]"
        f"Score {losses['Score']/(i+1):7.5f}("
        f"D {losses['D']/(i+1):6.3f} "
        f"G {losses['G']/(i+1):6.3f} "
        f"L1 {losses['l1']/(i+1):6.3f} "
        f"L2 {losses['l2']/(i+1):6.3f} "
        f"GP {losses['GP']/(i+1):6.3f} "
    )


def init_loss() -> dict:
    return {
        "G": 0,
        "D": 0,
        "l1": 0,
        "l2": 0,
        "GP": 0,
        "Score": 0,
    }
