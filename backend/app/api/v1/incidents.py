from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.incident_service import IncidentService
from app.services.incident_event_service import IncidentEventService
from app.schemas.incident import IncidentCreateRequest, IncidentUpdateStatusRequest

router = APIRouter(prefix="/incidents", tags=["Incident Response"])


@router.post("/create-from-ioc")
def create_incident_from_ioc(
    request: IncidentCreateRequest,
    db: Session = Depends(get_db),
):
    try:
        service = IncidentService(db)
        incident = service.create_from_ioc(request.indicator)

        return {
            "success": True,
            "message": "Incident created successfully",
            "incident": format_incident(incident),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def list_incidents(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    incidents = service.list_incidents(limit)

    return {
        "success": True,
        "count": len(incidents),
        "incidents": [format_incident(i) for i in incidents],
    }


@router.get("/{incident_id}")
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
):
    try:
        service = IncidentService(db)
        incident = service.get_incident(incident_id)

        return {
            "success": True,
            "incident": format_incident(incident, include_evidence=True),
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    request: IncidentUpdateStatusRequest,
    db: Session = Depends(get_db),
):
    try:
        service = IncidentService(db)
        incident = service.update_status(incident_id, request.status)

        return {
            "success": True,
            "message": "Incident status updated",
            "incident": format_incident(incident),
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{incident_id}/timeline")
def get_incident_timeline(
    incident_id: str,
    db: Session = Depends(get_db),
):
    event_service = IncidentEventService()
    events = event_service.get_events(db, incident_id)

    return {
        "success": True,
        "incident_id": incident_id,
        "timeline": [
            {
                "event_type": e.event_type,
                "description": e.description,
                "created_by": e.created_by,
                "created_at": e.created_at,
            }
            for e in events
        ],
    }


def format_incident(incident, include_evidence: bool = False):
    data = {
        "incident_id": incident.incident_id,
        "indicator": incident.indicator,
        "indicator_type": incident.indicator_type,
        "severity": incident.severity,
        "status": incident.status,
        "title": incident.title,
        "summary": incident.summary,
        "business_impact": incident.business_impact,
        "risk_score": incident.risk_score,
        "mitre_mapping": incident.mitre_mapping,
        "recommendations": incident.recommendations,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
    }

    if include_evidence:
        data["evidence"] = incident.evidence

    return data