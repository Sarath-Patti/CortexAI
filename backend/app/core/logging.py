import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """
    Configures structured logging for the application.
    """
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    logger = logging.getLogger(settings.PROJECT_NAME)
    return logger


logger = setup_logging()
