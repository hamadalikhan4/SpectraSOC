from app.enrichers.base import IOCEnricher


class GeoIPEnricher(IOCEnricher):

    name = "GeoIP"

    version = "1.0"

    author = "SpectraSOC"

    def supports(self, ioc_type: str) -> bool:
        return ioc_type == "ip"

    def enrich(self, indicator: str):

        return {
            "provider": self.name,
            "version": self.version,
            "indicator": indicator,
            "status": "success",
            "data": {
                "country": "Unknown",
                "city": "Unknown",
                "latitude": None,
                "longitude": None,
                "note": "Real lookup will be added later."
            }
        }