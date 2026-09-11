from sqlalchemy.orm import Session

from app.repositories.incident_evidence_repository import (
    IncidentEvidenceRepository,
)
from app.schemas.incident_evidence import IncidentEvidenceCreate


class IncidentEvidenceService:

    def __init__(self):
        self.repo = IncidentEvidenceRepository()

    def get_all(
        self,
        db: Session,
        incident_id: str,
    ):
        return self.repo.get_all(db, incident_id)

    def add(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentEvidenceCreate,
    ):
        return self.repo.add(db, incident_id, payload)

    def delete(
        self,
        db: Session,
        evidence_id: int,
    ):
        return self.repo.delete(db, evidence_id)