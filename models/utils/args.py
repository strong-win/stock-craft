import os
import yaml
import argparse


def load_yaml():
    """
    Setting Input arguments option
    """
    args = Args()

    YAML_FILE_IS_NOT_EXISTS = "Config File is not exists"
    assert os.path.exists(args.path), YAML_FILE_IS_NOT_EXISTS

    with open(args.path) as f:
        config = yaml.safe_load(f)

    return config


class Args:
    def __init__(self):
        parser = self.get_parser()

        self.path = parser.config
        self.opt = parser

    def get_parser(self):
        parser = argparse.ArgumentParser(description="** BandGan CLI **")
        parser.set_defaults(function=None)
        parser.add_argument(
            "-cfg",
            "--config",
            type=str,
            default="config/config.yml",
            help="config.yml path",
        )
        return parser.parse_args()

    def __str__(self):
        return str(self.opt)
