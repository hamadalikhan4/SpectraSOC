from abc import ABC, abstractmethod


class IOCEnricher(ABC):
    """
    Base class for all IOC enrichment providers.
    """

    # Plugin metadata
    name = "Base Plugin"
    version = "1.0"
    author = "SpectraSOC"

    @abstractmethod
    def supports(self, ioc_type: str) -> bool:
        """
        Return True if this plugin supports the IOC type.
        """
        pass

    @abstractmethod
    def enrich(self, indicator: str) -> dict:
        """
        Perform IOC enrichment.
        """
        pass