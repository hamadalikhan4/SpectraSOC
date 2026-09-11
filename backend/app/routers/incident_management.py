from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.incident_assignment import (
    IncidentAssignmentCreate,
    IncidentAssignmentResponse,
)
from app.services.incident_assignment_service import IncidentAssignmentService

from app.schemas.incident_comment import (
    IncidentCommentCreate,
    IncidentCommentResponse,
)
from app.services.incident_comment_service import IncidentCommentService

from app.schemas.incident_resolution import (
    IncidentResolutionCreate,
    IncidentResolutionResponse,
)
from app.services.incident_resolution_service import IncidentResolutionService

from app.schemas.incident_evidence import (
    IncidentEvidenceCreate,
    IncidentEvidenceResponse,
)
from app.services.incident_evidence_service import IncidentEvidenceService

from app.schemas.incident_event import (
    IncidentEventCreate,
    IncidentEventResponse,
)
from app.services.incident_event_service import IncidentEventService


router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incident Management"],
)

assignment_service = IncidentAssignmentService()
comment_service = IncidentCommentService()
resolution_service = IncidentResolutionService()
evidence_service = IncidentEvidenceService()
event_service = IncidentEventService()


@router.get("/{incident_id}/assignment", response_model=IncidentAssignmentResponse | None)
def get_incident_assignment(incident_id: str, db: Session = Depends(get_db)):
    return assignment_service.get_assignment(db, incident_id)


@router.post("/{incident_id}/assignment", response_model=IncidentAssignmentResponse)
def save_incident_assignment(
    incident_id: str,
    payload: IncidentAssignmentCreate,
    db: Session = Depends(get_db),
):
    assignment = assignment_service.save_assignment(db, incident_id, payload)

    event_service.log_event(
        db=db,
        incident_id=incident_id,
        event_type="ASSIGNMENT_UPDATED",
        description=f"Incident assigned to {payload.analyst} with priority {payload.priority}.",
        created_by="SOC Analyst",
    )

    return assignment


@router.get("/{incident_id}/comments", response_model=List[IncidentCommentResponse])
def get_incident_comments(incident_id: str, db: Session = Depends(get_db)):
    return comment_service.get_comments(db, incident_id)


@router.post("/{incident_id}/comments", response_model=IncidentCommentResponse)
def add_incident_comment(
    incident_id: str,
    payload: IncidentCommentCreate,
    db: Session = Depends(get_db),
):
    comment = comment_service.add_comment(db, incident_id, payload)

    event_service.log_event(
        db=db,
        incident_id=incident_id,
        event_type="COMMENT_ADDED",
        description=f"{payload.analyst} added an investigation comment.",
        created_by=payload.analyst,
    )

    return comment


@router.get("/{incident_id}/resolution", response_model=IncidentResolutionResponse | None)
def get_incident_resolution(incident_id: str, db: Session = Depends(get_db)):
    return resolution_service.get_resolution(db, incident_id)


@router.post("/{incident_id}/resolution", response_model=IncidentResolutionResponse)
def save_incident_resolution(
    incident_id: str,
    payload: IncidentResolutionCreate,
    db: Session = Depends(get_db),
):
    resolution = resolution_service.save_resolution(db, incident_id, payload)

    event_service.log_event(
        db=db,
        incident_id=incident_id,
        event_type="RESOLUTION_SAVED",
        description=f"Resolution details saved by {payload.resolved_by}.",
        created_by=payload.resolved_by,
    )

    return resolution


@router.get("/{incident_id}/evidence", response_model=List[IncidentEvidenceResponse])
def get_incident_evidence(incident_id: str, db: Session = Depends(get_db)):
    return evidence_service.get_all(db, incident_id)


@router.post("/{incident_id}/evidence", response_model=IncidentEvidenceResponse)
def add_incident_evidence(
    incident_id: str,
    payload: IncidentEvidenceCreate,
    db: Session = Depends(get_db),
):
    evidence = evidence_service.add(db, incident_id, payload)

    event_service.log_event(
        db=db,
        incident_id=incident_id,
        event_type="EVIDENCE_ADDED",
        description=f"Evidence added: {payload.title} ({payload.evidence_type}).",
        created_by=payload.collected_by,
    )

    return evidence


@router.delete("/{incident_id}/evidence/{evidence_id}")
def delete_incident_evidence(
    incident_id: str,
    evidence_id: int,
    db: Session = Depends(get_db),
):
    deleted = evidence_service.delete(db, evidence_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Evidence not found")

    event_service.log_event(
        db=db,
        incident_id=incident_id,
        event_type="EVIDENCE_DELETED",
        description=f"Evidence item #{evidence_id} was deleted.",
        created_by="SOC Analyst",
    )

    return {"message": "Evidence deleted successfully"}


@router.get("/{incident_id}/events", response_model=List[IncidentEventResponse])
def get_incident_events(incident_id: str, db: Session = Depends(get_db)):
    return event_service.get_events(db, incident_id)


@router.post("/{incident_id}/events", response_model=IncidentEventResponse)
def add_incident_event(
    incident_id: str,
    payload: IncidentEventCreate,
    db: Session = Depends(get_db),
):
    return event_service.add_event(db, incident_id, payload)