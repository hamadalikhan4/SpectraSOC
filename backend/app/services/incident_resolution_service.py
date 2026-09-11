from sqlalchemy.orm import Session

from app.repositories.incident_resolution_repository import (
    IncidentResolutionRepository,
)
from app.schemas.incident_resolution import IncidentResolutionCreate


class IncidentResolutionService:
    def __init__(self):
        self.repo = IncidentResolutionRepository()

    def get_resolution(self, db: Session, incident_id: str):
        return self.repo.get(db, incident_id)

    def save_resolution(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentResolutionCreate,
    ):
        return self.repo.upsert(db, incident_id, payload)