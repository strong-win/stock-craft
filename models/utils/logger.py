import os
import pytz
import structlog
import datetime
import logging.config

KST = pytz.timezone("Asia/Seoul")
timestamper = structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S", utc=False)
pre_chain = [structlog.stdlib.add_log_level, timestamper]

today = datetime.datetime.today()

DETAIL = 0
NORMAL = 1
IMPORT = 2


class Logger:
    def __init__(self, logpath: str, verbosity: int):
        # Set log file path
        self.logpath = logpath
        self.verbosity = verbosity

        self.init_config()
        self.logger = logging.getLogger()

    def init_config(self):
        logtime = (today).strftime("%y%m%d_%H%M")
        logfile = os.path.join(self.logpath, f"{logtime}.log")
        logging.config.dictConfig(
            {
                "version": 1,
                "disable_existing_loggers": True,
                "formatters": {
                    "plain": {
                        "()": structlog.stdlib.ProcessorFormatter,
                        "processor": structlog.dev.ConsoleRenderer(colors=False),
                        "foreign_pre_chain": pre_chain,
                    },
                    "colored": {
                        "()": structlog.stdlib.ProcessorFormatter,
                        "processor": structlog.dev.ConsoleRenderer(colors=True),
                        "foreign_pre_chain": pre_chain,
                    },
                },
                "handlers": {
                    "default": {
                        "level": "DEBUG",
                        "class": "logging.StreamHandler",
                        "formatter": "colored",
                    },
                    "file": {
                        "level": "INFO",
                        "class": "logging.handlers.RotatingFileHandler",
                        "filename": logfile,
                        "formatter": "plain",
                        "backupCount": 20,
                    },
                },
                "loggers": {
                    "": {
                        "handlers": ["default", "file"],
                        "level": "INFO",
                        "propagate": True,
                    }
                },
            }
        )

    def debug(self, message: str, level: int = NORMAL):
        if level >= self.verbosity:
            return self.logger.debug(message)

    def info(self, message: str, level: int = NORMAL):
        if level >= self.verbosity:
            return self.logger.info(message)

    def warn(self, message: str, level: int = NORMAL):
        if level >= self.verbosity:
            return self.logger.warning(message)
