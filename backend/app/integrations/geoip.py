from app.integrations.threat_client import ThreatClient


class GeoIPService:

    def __init__(self):
        self.client = ThreatClient()

    async def lookup(self, ip: str):

        url = f"http://ip-api.com/json/{ip}"

        result = await self.client.get(url)

        return {
            "country": result.get("country"),
            "region": result.get("regionName"),
            "city": result.get("city"),
            "lat": result.get("lat"),
            "lon": result.get("lon"),
            "isp": result.get("isp"),
        }