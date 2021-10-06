import torch
from utils.logger import Logger

logger = Logger(__file__)


def init_device():
    """
    Setting device CUDNN option

    """
    # TODO : Using parallel GPUs options
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    logger.info(f"  Device : {device}")

    return torch.device(device)
