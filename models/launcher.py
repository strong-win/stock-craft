import os
import json
import torch
import random
import numpy as np
import pandas as pd
from TIMEBAND.core import TIMEBANDCore
from utils.logger import Logger

logger = Logger(__file__)

torch.set_printoptions(precision=3, sci_mode=False)
pd.set_option("mode.chained_assignment", None)
pd.options.display.float_format = "{:.3f}".format
np.set_printoptions(linewidth=np.inf, precision=3, suppress=True)


def use_default_config(path: os.path = "config.json"):
    """
    User Default Configuration settings
    """
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            config = json.load(f)
    return config


def seeding(seed=31):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = True
    logger.info(f"  Seed   : {seed}")


def launcher():
    """
    Timeband model commend Launcher
    1. Please Check config.json for default config setting
    2. Prepare your timeseries data in 'data/' ( .csv format )

    """

    logger.info("*********************")
    logger.info("***** TIME BAND *****")
    logger.info("*********************\n\n")

    logger.info("*********************")
    logger.info("- System  Setting -")
    logger.info("*********************")

    config = use_default_config("config.json")
    seeding(31)

    logger.info("*********************")
    logger.info("- Model Setting -")
    logger.info("*********************")
    # Model setting
    # - Timeband Dataset
    # - Timeband Metric
    # - Timeband Model
    model = TIMEBANDCore(config=config)

    logger.info("*********************")
    logger.info("- Model Training -")
    logger.info("*********************")

    netG = None
    try:
        # Run Model Trainning
        netD, netG = model.train()
    except (KeyboardInterrupt, SyntaxError):
        model.models.save(model.netD, model.netG)
        logger.warn("Abort!")

    logger.info("*********************")
    logger.info("- Model Output -")
    logger.info("*********************")
    model.run(netG)

    logger.info("*********************")
    logger.info("- Data Visualize -")
    logger.info("*********************")
    model.visualize()

    model.clear()


if __name__ == "__main__":
    launcher()
