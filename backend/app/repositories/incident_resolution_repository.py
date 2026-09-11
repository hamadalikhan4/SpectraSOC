from sqlalchemy.orm import Session

from app.models.incident_resolution import IncidentResolution
from app.schemas.incident_resolution import IncidentResolutionCreate


class IncidentResolutionRepository:

    def get(self, db: Session, incident_id: str):
        return (
            db.query(IncidentResolution)
            .filter(
                IncidentResolution.incident_id == incident_id
            )
            .first()
        )

    def upsert(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentResolutionCreate,
    ):

        resolution = self.get(db, incident_id)

        if resolution:

            resolution.root_cause = payload.root_cause
            resolution.containment = payload.containment
            resolution.recovery = payload.recovery
            resolution.lessons_learned = payload.lessons_learned
            resolution.closure_notes = payload.closure_notes
            resolution.resolved_by = payload.resolved_by

        else:

            resolution = IncidentResolution(
                incident_id=incident_id,
                root_cause=payload.root_cause,
                containment=payload.containment,
                recovery=payload.recovery,
                lessons_learned=payload.lessons_learned,
                closure_notes=payload.closure_notes,
                resolved_by=payload.resolved_by,
            )

            db.add(resolution)

        db.commit()
        db.refresh(resolution)

        return resolution