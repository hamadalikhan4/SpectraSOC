import os
import httpx


class AbuseIPDBService:

    def __init__(self):
        self.api_key = os.getenv("ABUSEIPDB_API_KEY")
        self.base_url = "https://api.abuseipdb.com/api/v2/check"

    async def check_ip(self, ip: str):

        # ✅ SAFE CHECK (prevents header None crash)
        if not self.api_key:
            return {
                "error": "ABUSEIPDB_API_KEY is missing in environment"
            }

        headers = {
            "Key": self.api_key,
            "Accept": "application/json"
        }

        params = {
            "ipAddress": ip,
            "maxAgeInDays": 90
        }

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    self.base_url,
                    headers=headers,
                    params=params
                )

            data = response.json()

            return self._format(data)

        except Exception as e:
            return {
                "error": f"AbuseIPDB request failed: {str(e)}"
            }

    def _format(self, data: dict):

        try:
            info = data["data"]

            return {
                "abuse_score": info.get("abuseConfidenceScore", 0),
                "country": info.get("countryCode"),
                "isp": info.get("isp"),
                "tor": info.get("isTor"),
                "total_reports": info.get("totalReports", 0)
            }

        except Exception:
            return {
                "error": "Invalid AbuseIPDB response format"
            }