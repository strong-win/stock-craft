import torch
import numpy as np

from tqdm import tqdm
from torch.optim import RMSprop, Adam
from torch.utils.data import DataLoader

from utils.color import colorstr
from TIMEBAND.loss import TIMEBANDLoss
from TIMEBAND.model import TIMEBANDModel
from TIMEBAND.metric import TIMEBANDMetric
from TIMEBAND.dataset import TIMEBANDDataset
from TIMEBAND.dashboard import TIMEBANDDashboard

logger = None


class TIMEBANDTrainer:
    def __init__(
        self,
        config: dict,
        dataset: TIMEBANDDataset,
        models: TIMEBANDModel,
        metric: TIMEBANDMetric,
        losses: TIMEBANDLoss,
        dashboard: TIMEBANDDashboard,
    ) -> None:
        global logger
        logger = config["logger"]

        self.dataset = dataset
        self.models = models
        self.metric = metric
        self.losses = losses
        self.dashboard = dashboard

        # Set Config
        config = self.set_config(config=config)

        self.forecast_len = self.dataset.forecast_len

    def set_config(self, config: dict = None) -> dict:
        """
        Configure settings related to the data set.

        params:
            config: Trainer configuration dict
                `config['trainer']`
        """

        # Train option
        self.__dict__ = {
            **config,
            **self.__dict__,
        }
        self.lr = config["learning_rate"]["base"]
        self.lr_decay = config["learning_rate"]["decay"]
        self.lr_gammaG = config["learning_rate"]["gammaG"]
        self.lr_gammaD = config["learning_rate"]["gammaD"]

        self.trainer_config = config["epochs"]
        self.epochs = config["epochs"]["iter"]
        self.base_epochs = config["epochs"]["base"]
        self.iter_epochs = config["epochs"]["iter"]
        self.iter_critic = config["epochs"]["critic"]

        # Models options
        self.reload_option = config["models"]["reload"]
        self.reload_counts = 0
        self.reload_interval = config["models"]["reload_interval"]
        self.save_interval = config["models"]["save_interval"]

    def model_update(self, epoch: int, score: float) -> None:
        # Best Model Save options
        if score < self.models.best_score:
            self.reload_counts = -1
            self.models.best_score = score
            self.models.save(f"{score:.3f}", best=True)

        # Periodic Save options
        if (epoch + 1) % self.save_interval == 0:
            self.models.save()

        # Best Model Reload options
        if self.reload_option:
            self.reload_counts += 1
            if self.reload_counts >= self.reload_interval:
                self.reload_counts = 0
                logger.info(
                    f" - Learning rate decay {self.lr} to {self.lr * self.lr_decay}"
                )
                self.lr *= self.lr_decay
                self.models.load("BEST")

    def train(self, trainset: DataLoader, validset: DataLoader) -> None:
        logger.info("Train the model")

        # Score plot
        train_score_plot = []
        valid_score_plot = []
        EPOCHS = self.base_epochs + self.iter_epochs
        for epoch in range(self.base_epochs, EPOCHS):
            # Model Settings
            paramD, lrD = self.models.netD.parameters(), self.lr * self.lr_gammaD
            paramG, lrG = self.models.netG.parameters(), self.lr * self.lr_gammaG
            self.optimD = Adam(paramD, lr=lrD)
            self.optimG = Adam(paramG, lr=lrG)

            # Prediction
            self.idx = 0
            self.pred_initate()
            self.dashboard.init_figure()

            # Train Step
            train_score = self.train_step(epoch, trainset, training=True)
            train_score_plot.append(train_score)

            # Valid Step
            valid_score = self.train_step(epoch, validset, training=False)
            valid_score_plot.append(valid_score)

            self.model_update(epoch, valid_score)
            self.dashboard.clear_figure()

        self.models.load("BEST")
        self.models.save(best=True)

    def train_step(self, epoch: int, dataset: DataLoader, training: bool = True):
        def discriminate(x):
            return self.models.netD(x).to(self.device)

        def generate(x):
            return self.models.netG(x)[:, : self.forecast_len].to(self.device)

        losses = self.losses.init_loss()
        score = self.metric.init_score()

        tqdm_ = tqdm(dataset, desc(training, epoch, score, losses))
        outputs = self.dataset.observed
        for i, data in enumerate(tqdm_):
            # #######################
            # Critic & Optimizer init
            # #######################
            if training:
                paramD, lrD = self.models.netD.parameters(), self.lr * self.lr_gammaD
                optimD = RMSprop(paramD, lr=lrD)
                for _ in range(self.iter_critic):
                    # Load Random Sample Data
                    true_x, true_y = self.dataset.get_random()
                    fake_y = generate(true_x)

                    # Optimizer initialize
                    optimD.zero_grad()

                    Dy = discriminate(true_y)
                    DGx = discriminate(fake_y)

                    errD = self.losses.dis_loss(true_y, fake_y, Dy, DGx, critic=True)
                    errD.backward()
                    optimD.step()

            self.optimD.zero_grad()
            self.optimG.zero_grad()

            # #######################
            # Load Data
            # #######################
            true_x = data["encoded"].to(self.device)
            true_y = data["decoded"].to(self.device)
            (batchs, forecast_len, target_dims) = true_y.shape

            # #######################
            # Discriminator Training
            # #######################
            fake_y = generate(true_x)
            Dy = discriminate(true_y)
            DGx = discriminate(fake_y)

            # masked = (1 - mask_y) * true_y + mask_y * fake_y
            if training:
                errD = self.losses.dis_loss(true_y, fake_y, Dy, DGx)
                errD.backward()
                self.optimD.step()
            else:
                with torch.no_grad():
                    self.losses.dis_loss(true_y, fake_y, Dy, DGx)

            # #######################
            # Generator Trainining
            # #######################
            fake_y = generate(true_x)
            DGx = self.models.netD(fake_y)

            # masked = (1 - mask_y) * true_y + mask_y * fake_y
            if training:
                errG = self.losses.gen_loss(true_y, fake_y, DGx)
                errG.backward()
                self.optimG.step()
            else:
                with torch.no_grad():
                    self.losses.gen_loss(true_y, fake_y, DGx)

            # #######################
            # Process
            # #######################
            pred_y = self.dataset.denormalize(fake_y.cpu())
            preds, lower, upper = self.predicts(pred_y)

            pred_len = preds.shape[0]
            reals = self.dataset.forecast[self.idx : self.idx + pred_len]
            masks = self.dataset.missing[self.idx : self.idx + pred_len]
            self.idx += batchs

            output = np.concatenate([outputs[-1:], reals])
            target = self.adjust(output, preds, masks, lower, upper)
            outputs = np.concatenate([outputs[: 1 - forecast_len], target])

            # #######################
            # Visualize
            # #######################
            self.dashboard.vis(batchs, reals, preds, lower, upper, target)

            # #######################
            # Scoring
            # #######################
            preds = torch.tensor(preds)
            masks = torch.tensor(masks)
            self.metric.NMAE(reals, preds, masks)
            self.metric.RMSE(reals, preds, masks)
            self.metric.NME(reals, preds, masks)

            # #######################
            # Losses Log
            # #######################
            losses = self.losses.loss(i)
            score = self.metric.score(i)
            tqdm_.set_description(desc(training, epoch, score, losses))

        return self.metric.nmae / (i + 1)

    def adjust(self, output, preds, masks, lower, upper):
        len = preds.shape[0]
        a = self.missing_gamma
        b = self.anomaly_gamma

        for p in range(len):
            value = output[p + 1]

            lmask = value < lower[p]
            umask = value > upper[p]
            mmask = masks[p] * (lmask + umask)

            value = (1 - lmask) * value + lmask * (b * preds[p] + (1 - b) * value)
            value = (1 - umask) * value + umask * (b * preds[p] + (1 - b) * value)
            value = (1 - mmask) * value + mmask * (a * preds[p] + (1 - a) * output[p])

            output[p + 1] = value

        target = output[1:]
        return target

    def pred_initate(self):
        forecast_len = self.dataset.decode_shape[1]
        target_dims = self.dataset.decode_shape[2]

        self.preds = np.empty((forecast_len - 1, forecast_len, target_dims))
        self.preds[:] = np.nan

    def predicts(self, pred):
        (batch_size, forecast_len, target_dims) = pred.shape
        pred = pred.detach().numpy()

        nan_shape = np.empty((batch_size, forecast_len, target_dims))
        nan_shape[:] = np.nan

        self.preds = np.concatenate([self.preds[1 - forecast_len :], nan_shape])
        for f in range(forecast_len):
            self.preds[f : batch_size + f, f] = pred[:, f]

        preds = np.nanmedian(self.preds, axis=1)
        std = np.nanstd(self.preds, axis=1)

        for f in range(forecast_len - 1, 0, -1):
            gamma = (forecast_len - f) / (forecast_len - 1)
            std[-f] += std[-f - 1] * gamma

        lower = preds - self.band_width * std
        upper = preds + self.band_width * std

        return preds, lower, upper


def desc(training, epoch, score, losses):
    process = "Train" if training else "Valid"

    if not training:
        score["RMSE"] = colorstr("bright_blue", score["RMSE"])
        score["NMAE"] = colorstr("bright_red", score["NMAE"])
        losses["L1"] = colorstr("bright_blue", losses["L1"])
        losses["L2"] = colorstr("bright_blue", losses["L2"])
        losses["GP"] = colorstr("bright_blue", losses["GP"])

    return (
        f"[{process} e{epoch + 1:4d}] "
        f"NMAE Score {score['NMAE']} ( NME {score['NME']} / RMSE {score['RMSE']} ) "
        f"D {losses['D']} ( R {losses['R']} F {losses['F']} ) "
        f"G {losses['G']} ( G {losses['G_']} L1 {losses['L1']} L2 {losses['L2']} GP {losses['GP']} )"
    )
