from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.threat_ioc import (
    ThreatIOCCreate,
    ThreatIOCResponse,
)

from app.services.threat_ioc_service import ThreatIOCService
from app.services.threat_service import ThreatService
from app.services.incident_service import IncidentService


router = APIRouter(
    prefix="/api/v1/threat",
    tags=["Threat Intelligence"],
)


@router.get(
    "/iocs",
    response_model=list[ThreatIOCResponse],
)
def list_iocs(
    db: Session = Depends(get_db),
):
    return ThreatIOCService.list_iocs(db)


@router.post(
    "/iocs",
    response_model=ThreatIOCResponse,
)
def create_ioc(
    request: ThreatIOCCreate,
    db: Session = Depends(get_db),
):
    return ThreatIOCService.create(
        db,
        request,
    )


@router.get(
    "/search/{value}",
    response_model=ThreatIOCResponse,
)
def search_ioc(
    value: str,
    db: Session = Depends(get_db),
):

    result = ThreatIOCService.search(
        db,
        value,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="IOC not found",
        )

    return result


@router.delete(
    "/iocs/{ioc_id}",
)
def delete_ioc(
    ioc_id: int,
    db: Session = Depends(get_db),
):

    deleted = ThreatIOCService.delete(
        db,
        ioc_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="IOC not found",
        )

    return {
        "message": "IOC deleted successfully"
    }


@router.post("/analyze")
async def analyze_indicator(
    indicator: str,
    indicator_type: str = "ip",
    auto_incident: bool = True,
    threshold: int = 35,
    db: Session = Depends(get_db),
):
    try:
        threat_service = ThreatService(db)

        result = await threat_service.analyze_indicator(
            indicator=indicator,
            indicator_type=indicator_type,
        )

        incident_created = False
        incident_id = None

        if auto_incident and result.get("risk_score", 0) >= threshold:
            incident_service = IncidentService(db)
            incident = incident_service.create_from_ioc(indicator)

            incident_created = True
            incident_id = incident.incident_id

        return {
            "success": True,
            "indicator": result.get("indicator"),
            "indicator_type": result.get("indicator_type"),
            "risk_score": result.get("risk_score"),
            "risk_level": result.get("risk_level"),
            "source": result.get("source"),
            "incident_created": incident_created,
            "incident_id": incident_id,
            "analysis": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )