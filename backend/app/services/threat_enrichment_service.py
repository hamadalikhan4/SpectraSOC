import requests

from app.utils.ioc_parser import detect_ioc_type


class ThreatEnrichmentService:

    @staticmethod
    def enrich(value: str):

        ioc_type = detect_ioc_type(value)

        result = {
            "ioc": value,
            "ioc_type": ioc_type,
            "country": None,
            "city": None,
            "isp": None,
            "risk_score": 0,
            "severity": "LOW",
        }

        # Only enrich IPs for now
        if ioc_type != "ip":
            return result

        try:

            response = requests.get(
                f"http://ip-api.com/json/{value}",
                timeout=5,
            )

            data = response.json()

            if data["status"] == "success":

                result["country"] = data.get("country")
                result["city"] = data.get("city")
                result["isp"] = data.get("isp")

                # Simple initial scoring
                result["risk_score"] = 25
                result["severity"] = "LOW"

        except Exception:
            pass

        return result