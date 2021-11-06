import os
import json
import torch
import random
import numpy as np
import pandas as pd

from utils.args import Parser
from utils.logger import Logger
from TIMEBAND.core import TIMEBANDCore


def seeding(seed=31):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = True

    torch.set_printoptions(precision=3, sci_mode=False)
    pd.set_option("mode.chained_assignment", None)
    pd.options.display.float_format = "{:.3f}".format
    np.set_printoptions(linewidth=np.inf, precision=3, suppress=True)


def load_config(config_path: str = "config.json"):
    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)
    config = Parser(config).config

    config = setting_path(config)

    config_path = os.path.join(config["core"]["path"], config_path)
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False)

    return config


def setting_path(config: dict) -> dict:
    """
    { OUTPUT_ROOT } / { DATA NAME } / { TAG }
        - models : trained model path
        - labels : missing / anomaly label path
        - data   : processed data path
        - logs   : log files path
    """

    OUTPUT_ROOT = config["core"]["outputs"]
    DATA_NAME = config["core"]["data_name"]
    MODEL_TAG = config["core"]["TAG"]

    output_path = os.path.join(OUTPUT_ROOT, DATA_NAME)
    models_path = os.path.join(output_path, MODEL_TAG)
    os.mkdir(OUTPUT_ROOT) if not os.path.exists(OUTPUT_ROOT) else None
    os.mkdir(output_path) if not os.path.exists(output_path) else None

    config["core"]["path"] = models_path
    config["core"]["models_path"] = os.path.join(models_path, "models")
    config["core"]["logs_path"] = os.path.join(models_path, "logs")

    if not os.path.exists(models_path):
        os.mkdir(models_path)
        os.mkdir(config["core"]["models_path"])
        os.mkdir(config["core"]["logs_path"])

    return config


def init_device():
    """
    Setting device CUDNN option

    """
    # TODO : Using parallel GPUs options
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    return torch.device(device)


def launcher():
    """
    Timeband model commend Launcher
    1. Please Check config.json for default config setting
    2. Prepare your timeseries data in 'data/' ( .csv format )

    """

    config = load_config()
    SEED = config.get("seed", 31)
    TAG = config["core"]["TAG"]

    logger = Logger(config["core"]["logs_path"], config["core"]["verbosity"])
    config["core"]["logger"] = logger
    config["core"]["device"] = init_device()

    logger.info("**********************")
    logger.info("***** TIME  BAND *****")
    logger.info("**********************")
    logger.info("** System   Setting **")
    logger.info(f"  Random Seed : {SEED}")
    logger.info(f"  MODELS TAG  : {TAG} ")
    logger.info(f"  OUTPUT DIR  : {config['core']['path']} ")
    logger.info(f"  VERBOSITY   : {config['core']['verbosity']} ")

    logger.info("** TIMEBAND Setting **")
    model = TIMEBANDCore(config=config)

    # Run Model Trainning
    logger.info("** Model   Training **")
    try:
        if config["train_mode"]:
            model.train()
    except KeyboardInterrupt:
        print("Abort!")

    logger.info("*********************")
    logger.info("- Model Output -")
    logger.info("*********************")
    try:
        if config["run_mode"]:
            model.run()
    except KeyboardInterrupt:
        print("Abort!")


if __name__ == "__main__":
    launcher()
