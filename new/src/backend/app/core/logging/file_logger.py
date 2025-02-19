"""Service for logging to file."""

import logging
import os
from core.logging.base import LoggerBase


class FileLogger(LoggerBase):
    """Service for logging to file."""

    logdir = "/tmp/acc2/logs"

    def __init__(self, file_name: str = "logs.log") -> None:
        super().__init__()
        self.file_name = file_name

        if not os.path.isdir(self.logdir):
            os.makedirs(self.logdir)

        logging.basicConfig(
            filename=os.path.join(
                self.logdir, self.file_name
            ),  # TODO: use separate log files for web and internal apis?
            level=logging.INFO,
            filemode="a+",
            format="%(asctime)s [%(levelname)s] %(message)s",  # TODO: what format should be used?
        )

        self.logger = logging.getLogger(__name__)

    def info(self, message: str) -> None:
        return self.logger.info(message)

    def warn(self, message: str) -> None:
        return self.logger.warning(message)

    def error(self, message: str) -> None:
        return self.logger.error(message)
