from sqlalchemy.orm import Session

from app.models.incident_event import IncidentEvent
from app.schemas.incident_event import IncidentEventCreate


class IncidentEventRepository:
    def get_events(self, db: Session, incident_id: str):
        return (
            db.query(IncidentEvent)
            .filter(IncidentEvent.incident_id == incident_id)
            .order_by(IncidentEvent.created_at.desc())
            .all()
        )

    def add_event(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentEventCreate,
    ):
        event = IncidentEvent(
            incident_id=incident_id,
            event_type=payload.event_type,
            description=payload.description,
            created_by=payload.created_by,
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return event