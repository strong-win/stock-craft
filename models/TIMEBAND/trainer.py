import torch
import numpy as np

from tqdm import tqdm
from torch.optim import RMSprop

from utils.color import colorstr
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
        
        # Model option
        self.netD, self.netG = self.models.netD, self.models.netG

    def train(self, trainset, validset):
        logger.info("Train the model")

        # Models Setting
        models = self.models
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
            self.pred_initate()
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

        i = 0
        losses = init_loss()
        amplifier = self.amplifier
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
                    errD.backward()
                    self.optimD.step()

            # Data
            true_x = data["encoded"].to(self.device)
            true_y = data["decoded"].to(self.device)
            real_y = data["forecast"]
            fake_y = generate(true_x)

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

            losses["Dr"] += errD_real
            losses["Df"] += errD_fake

            losses["D"] += errD_real + errD_fake

            if training:
                errD = errD_real + errD_fake
                errD.backward(retain_graph=True)
                self.optimD.step()

            # #######################
            # Generator Trainining
            # #######################
            fake_y = generate(true_x)
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
                errG.backward()
                self.optimG.step()

            # #######################
            # Scoring
            # #######################
            pred_y = self.dataset.denormalize(fake_y.cpu())
            (batchs, forecast_len, target_dims) = true_y.shape
            self.pred_concat(pred_y, real_y)

            losses["Score"] += (
                self.metric.NMAE(
                    torch.from_numpy(self.pred_ans[-batchs - forecast_len :])
                    * self.amplifier,
                    torch.from_numpy(self.real_ans[-batchs - forecast_len :]),
                )
                .detach()
                .numpy()
            )

            losses["RMSE"] += self.metric.RMSE(pred_y, real_y).detach().numpy()
            losses["Score_raw"] += self.metric.NMAE(pred_y, real_y).detach().numpy()
            nme = self.metric.NME(pred_y * self.amplifier, real_y).detach().numpy()

            if training and i > 150:
                amplifier += nme * amplifier * (batchs / self.dataset.data_length) * 0.1

            losses["NME"] += nme
            # Losses Log
            tqdm.set_description(loss_info(TAG, epoch, losses, i))
            # if not training:
            self.dashboard.visualize(
                batchs,
                real_y,
                pred_y,
                self.pred_ans[-batchs - forecast_len :],
                self.pred_std[-batchs - forecast_len :],
            )

        if training:
            print(f"Amplifier {self.amplifier:2.5f}, {amplifier:2.5f}")
            self.amplifier = self.amplifier + (amplifier - self.amplifier) * 0.1

        return losses["Score"] / (i + 1)

    def pred_initate(self):
        decoded_shape = self.dataset.decode_shape
        (batch_size, forecast_len, target_dims) = decoded_shape

        init_shape3 = (forecast_len - 1, forecast_len, target_dims)
        init_shape2 = (forecast_len - 1, target_dims)

        self.pred_idx = 0

        self.pred_data = np.empty(init_shape3)
        self.pred_data[:] = np.nan

        self.real_ans = np.zeros(init_shape2)

        self.pred_ans = np.empty(init_shape2)
        self.pred_ans[:] = np.nan

        self.pred_std = np.zeros(init_shape2)

    def pred_concat(self, pred, reals):
        (batch_size, forecast_len, target_dims) = pred.shape
        pred = pred.detach().numpy()

        nan_shape3 = np.empty((batch_size, forecast_len, target_dims))
        nan_shape3[:] = np.nan
        nan_shape2 = np.empty((batch_size, target_dims))
        nan_shape2[:] = np.nan

        self.pred_data = np.concatenate([self.pred_data, nan_shape3])
        if self.real_ans.shape[0] < forecast_len:
            self.real_ans[: forecast_len - 1] = reals[0, :-1]
        self.real_ans = np.concatenate([self.real_ans, nan_shape2])

        self.pred_ans = np.concatenate([self.pred_ans, nan_shape2])
        self.pred_std = np.concatenate([self.pred_std, nan_shape2])

        # Concat predictions
        for f in range(forecast_len):
            idx_s = self.pred_idx + f
            idx_e = self.pred_idx + batch_size + f
            self.pred_data[idx_s:idx_e, f] = pred[:, f]

        for b in range(batch_size):
            self.real_ans[-batch_size + b] = reals[b, -1]

        update_idx = -batch_size - forecast_len
        self.pred_ans[update_idx:] = np.nanmedian(self.pred_data[update_idx:], axis=1)
        self.pred_std[update_idx:] = np.nanstd(self.pred_data[update_idx:], axis=1)

        for f in range(forecast_len - 1, 0, -1):
            gamma = (forecast_len - f) / (forecast_len - 1)
            self.pred_std[-f] += self.pred_std[-f - 1] * gamma

        self.pred_idx += batch_size


def loss_info(process, epoch, losses=None, i=0):
    if losses is None:
        losses = init_loss()

    score = f"{losses['Score'] / (i + 1):7.5f}"
    return (
        f"[{process} e{epoch + 1:4d}]"
        f"Score {losses['Score_raw']/(i+1):7.5f} / "
        f"{colorstr(score)} / "
        f"{losses['RMSE']/(i+1):7.5f} / "
        f"{losses['NME']/(i+1):7.4f}  ("
        f"D {losses['D']/(i+1):6.3f} "
        f"(R {losses['Dr']/(i+1):6.3f}, "
        f"F {losses['Df']/(i+1):6.3f}) "
        f"G {losses['G']/(i+1):6.3f} "
        f"L1 {losses['l1']/(i+1):6.3f} "
        f"L2 {losses['l2']/(i+1):6.3f} "
        f"GP {losses['GP']/(i+1):6.3f} "
    )


def init_loss() -> dict:
    return {
        "G": 0,
        "D": 0,
        "Dr": 0,
        "Df": 0,
        "l1": 0,
        "l2": 0,
        "GP": 0,
        "NME": 0,
        "RMSE": 0,
        "Score": 0,
        "Score_raw": 0,
    }
