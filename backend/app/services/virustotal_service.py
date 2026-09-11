import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()


class VirusTotalService:
    BASE_URL = "https://www.virustotal.com/api/v3"

    def __init__(self):
        self.api_key = os.getenv("VIRUSTOTAL_API_KEY")

        if not self.api_key:
            raise ValueError("VIRUSTOTAL_API_KEY not found in .env")

        self.headers = {
            "x-apikey": self.api_key
        }

    def get_ip_report(self, ip_address: str) -> dict:
        response = requests.get(
            f"{self.BASE_URL}/ip_addresses/{ip_address}",
            headers=self.headers,
            timeout=15
        )
        response.raise_for_status()
        return response.json()

    def get_domain_report(self, domain: str) -> dict:
        response = requests.get(
            f"{self.BASE_URL}/domains/{domain}",
            headers=self.headers,
            timeout=15
        )
        response.raise_for_status()
        return response.json()

    def get_url_report(self, url: str) -> dict:
        url_id = base64.urlsafe_b64encode(
            url.encode("utf-8")
        ).decode("utf-8").rstrip("=")

        response = requests.get(
            f"{self.BASE_URL}/urls/{url_id}",
            headers=self.headers,
            timeout=15
        )
        response.raise_for_status()
        return response.json()

    def get_file_report(self, file_hash: str) -> dict:
        response = requests.get(
            f"{self.BASE_URL}/files/{file_hash}",
            headers=self.headers,
            timeout=15
        )
        response.raise_for_status()
        return response.json()