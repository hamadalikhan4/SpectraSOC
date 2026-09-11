from app.enrichers.base import IOCEnricher
from app.services.virustotal_service import VirusTotalService
from app.utils.ioc_parser import detect_ioc_type


class VirusTotalEnricher(IOCEnricher):

    name = "VirusTotal"
    version = "1.2"
    author = "SpectraSOC"

    def supports(self, ioc_type: str) -> bool:
        return ioc_type in ["ip", "domain", "url", "md5", "sha1", "sha256"]

    def enrich(self, indicator: str) -> dict:
        try:
            service = VirusTotalService()
            ioc_type = detect_ioc_type(indicator)

            if ioc_type == "ip":
                data = service.get_ip_report(indicator)

            elif ioc_type == "domain":
                data = service.get_domain_report(indicator)

            elif ioc_type == "url":
                data = service.get_url_report(indicator)

            elif ioc_type in ["md5", "sha1", "sha256"]:
                data = service.get_file_report(indicator)

            else:
                raise ValueError(f"Unsupported IOC type: {ioc_type}")

            attributes = data.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})

            return {
                "provider": self.name,
                "version": self.version,
                "indicator": indicator,
                "type": ioc_type,
                "status": "success",
                "data": {
                    "malicious": stats.get("malicious", 0),
                    "suspicious": stats.get("suspicious", 0),
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                    "timeout": stats.get("timeout", 0),
                    "reputation": attributes.get("reputation", 0),
                    "country": attributes.get("country"),
                    "asn": attributes.get("asn"),
                    "as_owner": attributes.get("as_owner"),
                    "network": attributes.get("network"),
                    "tags": attributes.get("tags", []),
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