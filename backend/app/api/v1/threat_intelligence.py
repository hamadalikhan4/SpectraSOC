from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.threat_service import ThreatService
from app.schemas.threat_intel import ThreatIntelRequest
from app.repositories.threat_cache_repository import ThreatCacheRepository

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])


@router.post("/")
async def analyze_threat(
    data: ThreatIntelRequest,
    db: Session = Depends(get_db)
):
    try:
        service = ThreatService(db)

        indicator = data.indicator or data.ip

        if not indicator:
            raise HTTPException(
                status_code=400,
                detail="Indicator is required. Use 'indicator' or old field 'ip'."
            )

        result = await service.analyze_indicator(
            indicator=indicator,
            indicator_type=data.indicator_type.lower()
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/history/{indicator}")
def get_ioc_history(
    indicator: str,
    db: Session = Depends(get_db)
):
    repo = ThreatCacheRepository(db)
    cache = repo.get_history(indicator)

    if not cache:
        raise HTTPException(status_code=404, detail="IOC not found in history")

    return {
        "success": True,
        "indicator": cache.indicator,
        "indicator_type": cache.indicator_type,
        "risk_score": cache.risk_score,
        "risk_level": cache.risk_level,
        "lookup_count": cache.lookup_count,
        "first_seen": cache.first_seen,
        "last_seen": cache.last_seen,
        "data": cache.data
    }


@router.get("/recent")
def get_recent_iocs(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    repo = ThreatCacheRepository(db)
    records = repo.get_recent_iocs(limit)

    return {
        "success": True,
        "count": len(records),
        "records": [
            {
                "indicator": r.indicator,
                "indicator_type": r.indicator_type,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "lookup_count": r.lookup_count,
                "last_seen": r.last_seen
            }
            for r in records
        ]
    }


@router.get("/high-risk")
def get_high_risk_iocs(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    repo = ThreatCacheRepository(db)
    records = repo.get_high_risk_iocs(limit)

    return {
        "success": True,
        "count": len(records),
        "records": [
            {
                "indicator": r.indicator,
                "indicator_type": r.indicator_type,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "lookup_count": r.lookup_count,
                "last_seen": r.last_seen
            }
            for r in records
        ]
    }