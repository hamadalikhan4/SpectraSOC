from sqlalchemy.orm import Session

from app.repositories.incident_assignment_repository import (
    IncidentAssignmentRepository,
)
from app.schemas.incident_assignment import IncidentAssignmentCreate


class IncidentAssignmentService:
    def __init__(self):
        self.repository = IncidentAssignmentRepository()

    def get_assignment(self, db: Session, incident_id: str):
        return self.repository.get_by_incident_id(db, incident_id)

    def save_assignment(
        self,
        db: Session,
        incident_id: str,
        data: IncidentAssignmentCreate,
    ):
        return self.repository.upsert(db, incident_id, data)