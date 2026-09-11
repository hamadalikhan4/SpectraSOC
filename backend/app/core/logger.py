import logging


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("SpectraSOC")

    logger.setLevel(logging.INFO)

    if not logger.handlers:
        console_handler = logging.StreamHandler()

        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )

        console_handler.setFormatter(formatter)

        logger.addHandler(console_handler)

    return logger


logger = setup_logger()