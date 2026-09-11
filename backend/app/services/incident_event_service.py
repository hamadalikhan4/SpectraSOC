from sqlalchemy.orm import Session

from app.repositories.incident_event_repository import IncidentEventRepository
from app.schemas.incident_event import IncidentEventCreate


class IncidentEventService:
    def __init__(self):
        self.repo = IncidentEventRepository()

    def get_events(self, db: Session, incident_id: str):
        return self.repo.get_events(db, incident_id)

    def add_event(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentEventCreate,
    ):
        return self.repo.add_event(db, incident_id, payload)

    def log_event(
        self,
        db: Session,
        incident_id: str,
        event_type: str,
        description: str,
        created_by: str = "SpectraSOC",
    ):
        payload = IncidentEventCreate(
            event_type=event_type,
            description=description,
            created_by=created_by,
        )

        return self.repo.add_event(db, incident_id, payload)