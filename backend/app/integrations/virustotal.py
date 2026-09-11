import os
import base64
import httpx


class VirusTotalService:
    def __init__(self):
        self.api_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.base_url = "https://www.virustotal.com/api/v3"

    def _headers(self):
        return {
            "x-apikey": self.api_key
        }

    async def check_ip(self, ip: str):
        return await self._get(
            endpoint=f"/ip_addresses/{ip}",
            ioc_type="ip"
        )

    async def check_domain(self, domain: str):
        return await self._get(
            endpoint=f"/domains/{domain}",
            ioc_type="domain"
        )

    async def check_hash(self, file_hash: str):
        return await self._get(
            endpoint=f"/files/{file_hash}",
            ioc_type="hash"
        )

    async def check_url(self, url: str):
        url_id = self._encode_url_id(url)

        return await self._get(
            endpoint=f"/urls/{url_id}",
            ioc_type="url"
        )

    async def _get(self, endpoint: str, ioc_type: str):
        if not self.api_key:
            return {
                "error": "VIRUSTOTAL_API_KEY is missing in environment"
            }

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(
                    self.base_url + endpoint,
                    headers=self._headers()
                )

            if response.status_code == 404:
                return {
                    "error": "IOC not found in VirusTotal",
                    "ioc_type": ioc_type
                }

            if response.status_code == 401:
                return {
                    "error": "Invalid VirusTotal API key"
                }

            if response.status_code == 429:
                return {
                    "error": "VirusTotal rate limit exceeded"
                }

            if response.status_code >= 400:
                return {
                    "error": f"VirusTotal API error: {response.status_code}",
                    "details": response.text
                }

            data = response.json()
            return self._format(data, ioc_type)

        except httpx.TimeoutException:
            return {
                "error": "VirusTotal request timed out"
            }

        except Exception as e:
            return {
                "error": f"VirusTotal request failed: {str(e)}"
            }

    def _format(self, data: dict, ioc_type: str):
        try:
            attributes = data["data"]["attributes"]
            stats = attributes.get("last_analysis_stats", {})

            result = {
                "ioc_type": ioc_type,
                "malicious": stats.get("malicious", 0),
                "suspicious": stats.get("suspicious", 0),
                "harmless": stats.get("harmless", 0),
                "undetected": stats.get("undetected", 0),
                "reputation": attributes.get("reputation", 0)
            }

            if ioc_type == "domain":
                result["categories"] = attributes.get("categories", {})
                result["registrar"] = attributes.get("registrar")
                result["creation_date"] = attributes.get("creation_date")
                result["last_dns_records"] = attributes.get("last_dns_records", [])

            if ioc_type == "hash":
                result["meaningful_name"] = attributes.get("meaningful_name")
                result["type_description"] = attributes.get("type_description")
                result["size"] = attributes.get("size")
                result["sha256"] = attributes.get("sha256")
                result["md5"] = attributes.get("md5")

            if ioc_type == "url":
                result["url"] = attributes.get("url")
                result["title"] = attributes.get("title")
                result["final_url"] = attributes.get("last_final_url")

            return result

        except Exception:
            return {
                "error": "Invalid VirusTotal response format",
                "ioc_type": ioc_type
            }

    def _encode_url_id(self, url: str):
        return base64.urlsafe_b64encode(
            url.encode()
        ).decode().strip("=")