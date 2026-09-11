from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.threat_cache import ThreatCache


class ThreatCacheRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_indicator(self, indicator: str):
        return (
            self.db.query(ThreatCache)
            .filter(ThreatCache.indicator == indicator)
            .first()
        )

    def create_cache(
        self,
        indicator: str,
        indicator_type: str,
        risk_score: int,
        risk_level: str,
        data: dict
    ):
        cache = ThreatCache(
            indicator=indicator,
            indicator_type=indicator_type,
            risk_score=risk_score,
            risk_level=risk_level,
            lookup_count=1,
            data=data
        )

        self.db.add(cache)
        self.db.commit()
        self.db.refresh(cache)

        return cache

    def increment_lookup(self, cache: ThreatCache):
        cache.lookup_count = (cache.lookup_count or 0) + 1
        cache.last_seen = func.now()

        self.db.commit()
        self.db.refresh(cache)

        return cache

    def get_history(self, indicator: str):
        return self.get_by_indicator(indicator)

    def get_recent_iocs(self, limit: int = 20):
        return (
            self.db.query(ThreatCache)
            .order_by(ThreatCache.last_seen.desc())
            .limit(limit)
            .all()
        )

    def get_high_risk_iocs(self, limit: int = 20):
        return (
            self.db.query(ThreatCache)
            .filter(ThreatCache.risk_score >= 60)
            .order_by(ThreatCache.risk_score.desc())
            .limit(limit)
            .all()
        )