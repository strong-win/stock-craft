import os
import torch
from utils.logger import Logger
from .utils.lstm_layer import LSTMGenerator as NetG
from .utils.lstm_layer import LSTMDiscriminator as NetD

logger = Logger(__file__)


class TIMEBANDModel:
    """
    TIMEBAND Dataset

    """

    def __init__(self, config: dict, device: torch.device) -> None:
        """
        TIMEBAND Dataset

        Args:
            config: Dataset configuration dict
            device: Torch device (cpu / cuda:0)
        """
        logger.info("  Model: ")

        # Set Config
        self.set_config(config)

        # Set device
        self.device = device

        self.netD = None
        self.netG = None

    def set_config(self, config: dict) -> None:
        """
        Configure settings related to the data set.

        params:
            config: Dataset configuration dict
                `config['models']`
        """
        self.directory = config["directory"]
        self.model_tag = config["model_tag"]
        self.model_dir = os.path.join(self.directory, self.model_tag)
        if not os.path.exists(self.model_dir):
            os.mkdir(self.model_dir)

        self.load_option = config["load"]
        self.load_interval = config["load_interval"]

        self.save_option = config["save"]
        self.save_interval = config["save_interval"]

        self.reload_option = config["reload"]
        self.reload_interval = config["reload_interval"]

        self.best_score = config["best_score"]
        self.current_counts = 0

        self.hidden_dim = config["hidden_dim"]

    def load_model(self, data_dims: tuple):
        if self.netD is not None and self.netG is not None:
            return self.netD, self.netG

        hidden_dim = self.hidden_dim
        enc_dim = data_dims["encoded"]
        dec_dim = data_dims["decoded"]
        device = self.device

        try:
            if self.load_option is True:
                self.netD, self.netG = self.load()
                logger.info(f"   - Network : \n{self.netG} \n{self.netD}")
                return self.netD, self.netG

        except FileNotFoundError:

            self.netD = NetD(dec_dim, hidden_dim=hidden_dim, device=device).to(device)
            self.netG = NetG(enc_dim, dec_dim, hidden_dim=hidden_dim, device=device).to(
                device
            )

            logger.info(f"   - Network : \n{self.netG} \n{self.netD}")
            return self.netD, self.netG

    def load(self, postfix: str = "") -> tuple((NetD, NetG)):
        if self.load_option is False:
            return None, None

        netD_path = self.get_path("netD", postfix)
        netG_path = self.get_path("netG", postfix)

        logger.info(f" - Loaded netD : {netD_path}, netG: {netG_path}")
        netD, netG = torch.load(netD_path), torch.load(netG_path)

        return netD, netG

    def save(self, netD: NetD, netG: NetG, postfix: str = "") -> None:
        if self.save_option is False:
            return

        netD_path = self.get_path("netD", postfix)
        netG_path = self.get_path("netG", postfix)

        torch.save(netD, netD_path)
        torch.save(netG, netG_path)

    def update(self, netD: NetD, netG: NetG, score: float) -> tuple((NetD, NetG)):
        if self.reload_option is False:
            return netD, netG

        if score < self.best_score:
            self.best_score = score
            score_tag = f"{self.best_score:.4f}"
            logger.info(f"*** BEST SCORE MODEL ({score_tag}) IS SAVED ***")

            self.save(netD, netG, postfix=score_tag)
            self.current_counts = 0
            return netD, netG

        self.current_counts += 1
        if self.current_counts >= self.reload_interval:
            score_tag = f"{self.best_score:.4f}"
            logger.info(f"*** BEST SCORE MODEL ({score_tag}) IS RELOADED ***")

            netD, netG = self.load(postfix=score_tag)
            self.current_counts = 0

        return netD, netG

    def get_path(self, target: str, postfix: str = ""):
        filename = target if postfix == "" else f"{target}_{postfix}"
        filepath = os.path.join(self.model_dir, f"{filename}.pth")
        return filepath
