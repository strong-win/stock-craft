from utils.args import load_yaml
from utils.logger import Logger
from utils.device import init_device

from TIMEBAND.dashboard import Dashboard_v2
from torch.utils.data import DataLoader
from TIMEBAND.trainer import TIMEBANDTrainer
from TIMEBAND.dataset import TIMEBANDDataset
from TIMEBAND.metric import TIMEBANDMetric
from TIMEBAND.model import TIMEBANDModel

logger = Logger(__file__)


class TIMEBANDCore:
    """
    TIMEBANDBand : Timeseries Analysis using GAN Band

    The Model for Detecting anomalies / Imputating missing value in timeseries data

    """

    def __init__(self, config: dict = None) -> None:
        # Set device
        self.device = init_device()

        # Set Config
        self.set_config(config=config)

        # Dataset option
        self.dataset = TIMEBANDDataset(self.dataset_cfg, self.device)

        # Model option
        self.models = TIMEBANDModel(self.models_cfg, self.device)

        # Metric option
        self.metric = TIMEBANDMetric(self.metric_cfg, self.device)

        # Trainer option
        # self.dashboard = Dashboard_v2(self.dataset)

    def init_dataset(self):
        self.dataset = TIMEBANDDataset(self.dataset_cfg, self.device, self.count)

    def set_config(self, config: dict = None) -> None:
        """
        Setting configuration

        If config/config.json is not exists,
        Use default config 'config.yml'
        """
        if config is None:
            logger.info("  Config : Default configs")
            config = load_yaml()
        else:
            logger.info("  Config : JSON configs")

        core = config["core"]

        # Core configs
        self.mode = core["mode"]

        self.workers = core["workers"]
        self.batch_size = core["batch_size"]
        self.seed = core["seed"]  # UNUSED

        # Configuration Categories
        self.dataset_cfg = config["dataset"]
        self.models_cfg = config["models"]
        self.metric_cfg = config["metric"]
        self.trainer_cfg = config["trainer"]

    def train(self) -> None:
        # Model train

        self.trainer = TIMEBANDTrainer(
            self.trainer_cfg,
            self.dataset,
            self.models,
            self.metric,
            self.device
        )

        for k in range(self.dataset.window_sliding + 1):
            logger.info(f"Run ({k + 1}/{self.dataset.window_sliding + 1})")

            # Dataset
            trainset, validset, _ = self.dataset.load_dataset(k + 1)
            trainset = self.loader(trainset)
            validset = self.loader(validset)

            # Model 
            netD, netG = self.trainer.train(trainset, validset)
            
            logger.info(f"Done ({k + 1}/{self.dataset.window_sliding + 1}) ")

        # return netD, netG
        return None, None

    def run(self, netG=None):
        predsset = self.dataset.load_dataset(0)
        predsset = self.loader(predsset)
        if netG == None:
            return
            _, netG = self.models.load("0.1211")

        mean, output = self.trainer.inference(netG, predsset)
        date = mean.iloc[-29].values[0].strftime("%Y%m%d")

        mean.to_csv(f"./output/배추/{date}.csv", index=False)
        output.to_csv(f"./output/배추s/{date}.csv", index=False)

        # encoder_input = encoder_input.to(self.device)
        # decoder_input = torch.zeros([1, future_size+1, target_n], dtype=torch.float32).to(device)
        # output = model(encoder_input, decoder_input, False)
        # return output.cpu()

    def loader(self, dataset: TIMEBANDDataset):
        dataloader = DataLoader(dataset, self.batch_size, num_workers=self.workers)
        return dataloader

    def clear(self):
        del self.dataset
        self.dataset = None
