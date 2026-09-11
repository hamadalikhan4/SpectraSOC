import pkgutil
import importlib
import logging

import app.enrichers as enrichers_package

from app.enrichers.base import IOCEnricher

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("SpectraSOC")


def load_enrichers():

    plugins = []

    for _, module_name, _ in pkgutil.iter_modules(enrichers_package.__path__):

        if module_name in ["base", "loader"]:
            continue

        try:

            module = importlib.import_module(
                f"app.enrichers.{module_name}"
            )

            for attribute_name in dir(module):

                attribute = getattr(module, attribute_name)

                if (
                    isinstance(attribute, type)
                    and issubclass(attribute, IOCEnricher)
                    and attribute != IOCEnricher
                ):

                    plugin = attribute()

                    plugins.append(plugin)

                    logger.info(
                        f"Loaded plugin: {plugin.name} v{plugin.version}"
                    )

        except Exception as e:

            logger.error(
                f"Failed loading plugin {module_name}: {e}"
            )

    return plugins