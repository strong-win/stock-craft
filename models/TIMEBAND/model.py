import os
import torch
from .utils.lstm_layer import LSTMGenerator as NetG
from .utils.lstm_layer import LSTMDiscriminator as NetD

logger = None


class TIMEBANDModel:
    """
    TIMEBAND Dataset

    """

    def __init__(self, config: dict) -> None:
        """
        TIMEBAND Dataset

        Args:
            config: Dataset configuration dict
            device: Torch device (cpu / cuda:0)
        """
        global logger
        logger = config["logger"]

        # Set Config
        self.set_config(config)

        self.netD = None
        self.netG = None

        logger.info(
            "\n  Model: \n"
            f"  - File path  : {self.models_path} \n"
            f"  - Pretrained : {self.pretrain} \n"
            f"  - Save opts  : {self.save_opt} \n"
            f"  - Load opts  : {self.load_opt} \n",
            level=0,
        )

    def set_config(self, config: dict) -> None:
        """
        Configure settings related to the data set.

        params:
            config: Dataset configuration dict
                `config['core'] & config['models']`
        """
        logger.info("Timeband Model Setting")
        self.__dict__ = {**config, **self.__dict__}

    def initiate(self, dims: dict) -> None:
        if self.netD and self.netG:
            return

        enc_dim, dec_dim = dims["encode"], dims["decode"]
        netD = NetD(dec_dim, self.hidden_dim, self.layers_num, self.device)
        netG = NetG(enc_dim, dec_dim, self.hidden_dim, self.layers_num, self.device)

        self.netD, self.netG = netD.to(self.device), netG.to(self.device)
        logger.info(f" - Initiated netD : {self.netD}, netG: {self.netG}", level=0)
        self.save()

    def load(self, postfix: str = "") -> tuple((NetD, NetG)):
        netD_path = self.get_path("netD", postfix)
        netG_path = self.get_path("netG", postfix)

        if self.load_opt:
            if os.path.exists(netD_path) and os.path.exists(netG_path):
                logger.info(f" - {postfix} Model Loading : {netD_path}, {netG_path}")
                self.netD, self.netG = torch.load(netD_path), torch.load(netG_path)
            else:
                logger.warn(f" - {postfix} Model Loading Fail")

        return self.netD, self.netG

    def save(self, postfix: str = "", best: bool = False) -> None:
        netD_path = self.get_path("netD", postfix)
        netG_path = self.get_path("netG", postfix)

        if self.save_opt:
            if best:
                best_netD_path = self.get_path("netD", "BEST")
                best_netG_path = self.get_path("netG", "BEST")
                torch.save(self.netD, best_netD_path)
                torch.save(self.netG, best_netG_path)
                postfix = f"Best({postfix})"
            else:
                torch.save(self.netD, netD_path)
                torch.save(self.netG, netG_path)

            logger.info(f"*** {postfix} MODEL IS SAVED ***")

    def get_path(self, target: str, postfix: str = "") -> os.path:
        filename = target if postfix == "" else f"{target}_{postfix}"
        filepath = os.path.join(self.models_path, f"{filename}.pth")
        return filepath
