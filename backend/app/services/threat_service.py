from sqlalchemy.orm import Session

from app.repositories.threat_cache_repository import ThreatCacheRepository
from app.services.threat_analysis_engine import ThreatAnalysisEngine


class ThreatService:
    def __init__(self, db: Session):
        self.db = db
        self.cache_repo = ThreatCacheRepository(db)
        self.analysis_engine = ThreatAnalysisEngine()

    async def analyze_indicator(self, indicator: str, indicator_type: str = "ip"):
        cached = self.cache_repo.get_by_indicator(indicator)

        if cached:
            return {
                "success": True,
                "source": "cache",
                "indicator": cached.indicator,
                "indicator_type": cached.indicator_type,
                "risk_score": cached.risk_score,
                "risk_level": cached.risk_level,
                "data": cached.data,
            }

        analysis = self.analysis_engine.analyze(indicator)

        score = analysis["score"]
        cache_payload = analysis["cache_payload"]

        self.cache_repo.create_cache(
            indicator=cache_payload["indicator"],
            indicator_type=cache_payload["indicator_type"],
            risk_score=cache_payload["risk_score"],
            risk_level=cache_payload["risk_level"],
            data=cache_payload["data"],
        )

        return {
            "success": True,
            "source": "live_lookup",
            "indicator": score["indicator"],
            "indicator_type": score["type"],
            "risk_score": score["risk_score"],
            "risk_level": score["severity"],
            "provider_scores": score.get("provider_scores", {}),
            "providers": score.get("providers", []),
            "reasons": score.get("reasons", []),
            "should_create_incident": analysis["should_create_incident"],
            "enrichment": analysis["enrichment"],
            "cache_payload": cache_payload,
        }

    async def analyze_ip(self, ip: str):
        return await self.analyze_indicator(ip, "ip")

    async def analyze_domain(self, domain: str):
        return await self.analyze_indicator(domain, "domain")

    async def analyze_url(self, url: str):
        return await self.analyze_indicator(url, "url")

    async def analyze_hash(self, file_hash: str):
        return await self.analyze_indicator(file_hash, "hash")