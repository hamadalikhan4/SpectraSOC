from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.repositories.threat_cache_repository import ThreatCacheRepository
from app.repositories.incident_repository import IncidentRepository

from app.ai.soc_assistant import SocAssistant
from app.ai.incident_investigator import IncidentInvestigator


router = APIRouter(
    prefix="/ai",
    tags=["AI SOC Assistant"]
)


@router.get("/explain-ioc/{indicator}")

def explain_ioc(

        indicator: str,

        db: Session = Depends(get_db)

):

    repo = ThreatCacheRepository(db)

    cached = repo.get_by_indicator(indicator)

    if not cached:

        raise HTTPException(

            status_code=404,

            detail="IOC not found"

        )

    assistant = SocAssistant()

    data = cached.data

    return assistant.explain_ioc(

        indicator=cached.indicator,

        risk_score=cached.risk_score,

        risk_level=cached.risk_level,

        mitre_mapping=data.get("mitre_mapping", []),

        recommendations=data.get("recommendations", [])

    )


@router.get("/explain-incident/{incident_id}")

def explain_incident(

        incident_id: str,

        db: Session = Depends(get_db)

):

    repo = IncidentRepository(db)

    incident = repo.get_by_incident_id(incident_id)

    if not incident:

        raise HTTPException(

            status_code=404,

            detail="Incident not found"

        )

    investigator = IncidentInvestigator()

    return investigator.explain_incident(

        incident

    )