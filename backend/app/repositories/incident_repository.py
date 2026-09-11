from sqlalchemy.orm import Session
from app.models.incident import Incident


class IncidentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, incident: Incident):
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)
        return incident

    def get_by_incident_id(self, incident_id: str):
        return (
            self.db.query(Incident)
            .filter(Incident.incident_id == incident_id)
            .first()
        )

    def list_all(self, limit: int = 50):
        return (
            self.db.query(Incident)
            .order_by(Incident.created_at.desc())
            .limit(limit)
            .all()
        )

    def update_status(self, incident: Incident, status: str):
        incident.status = status
        self.db.commit()
        self.db.refresh(incident)
        return incident