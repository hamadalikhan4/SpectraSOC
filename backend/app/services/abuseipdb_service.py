import os
import requests
from dotenv import load_dotenv

load_dotenv()


class AbuseIPDBService:
    BASE_URL = "https://api.abuseipdb.com/api/v2/check"

    def __init__(self):
        self.api_key = os.getenv("ABUSEIPDB_API_KEY")

        if not self.api_key:
            raise ValueError("ABUSEIPDB_API_KEY not found in .env")

        self.headers = {
            "Key": self.api_key,
            "Accept": "application/json"
        }

    def check_ip(self, ip_address: str) -> dict:
        params = {
            "ipAddress": ip_address,
            "maxAgeInDays": 90
        }

        response = requests.get(
            self.BASE_URL,
            headers=self.headers,
            params=params,
            timeout=15
        )

        response.raise_for_status()
        return response.json()