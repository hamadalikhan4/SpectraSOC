from app.enrichers.base import IOCEnricher
from app.services.abuseipdb_service import AbuseIPDBService


class AbuseIPDBEnricher(IOCEnricher):

    name = "AbuseIPDB"
    version = "1.0"
    author = "SpectraSOC"

    def supports(self, ioc_type: str) -> bool:
        return ioc_type == "ip"

    def enrich(self, indicator: str) -> dict:
        try:
            service = AbuseIPDBService()
            response = service.check_ip(indicator)

            data = response.get("data", {})

            return {
                "provider": self.name,
                "version": self.version,
                "indicator": indicator,
                "status": "success",
                "data": {
                    "abuse_score": data.get("abuseConfidenceScore", 0),
                    "country": data.get("countryCode"),
                    "isp": data.get("isp"),
                    "domain": data.get("domain"),
                    "tor": data.get("isTor", False),
                    "total_reports": data.get("totalReports", 0),
                    "usage_type": data.get("usageType"),
                }
            }

        except Exception as e:
            return {
                "provider": self.name,
                "version": self.version,
                "indicator": indicator,
                "status": "error",
                "error": str(e)
            }