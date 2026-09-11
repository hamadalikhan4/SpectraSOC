import httpx


class ThreatClient:

    async def get(self, url: str, headers: dict = None, params: dict = None):
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                url,
                headers=headers,
                params=params
            )
            return response.json()