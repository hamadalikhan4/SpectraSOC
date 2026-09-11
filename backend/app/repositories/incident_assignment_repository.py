from sqlalchemy.orm import Session

from app.models.incident_assignment import IncidentAssignment
from app.schemas.incident_assignment import IncidentAssignmentCreate


class IncidentAssignmentRepository:
    def get_by_incident_id(self, db: Session, incident_id: str):
        return (
            db.query(IncidentAssignment)
            .filter(IncidentAssignment.incident_id == incident_id)
            .first()
        )

    def upsert(
        self,
        db: Session,
        incident_id: str,
        data: IncidentAssignmentCreate,
    ):
        assignment = self.get_by_incident_id(db, incident_id)

        if assignment:
            assignment.analyst = data.analyst
            assignment.priority = data.priority
            assignment.sla = data.sla
            assignment.due_date = data.due_date
            assignment.escalation = data.escalation
        else:
            assignment = IncidentAssignment(
                incident_id=incident_id,
                analyst=data.analyst,
                priority=data.priority,
                sla=data.sla,
                due_date=data.due_date,
                escalation=data.escalation,
            )
            db.add(assignment)

        db.commit()
        db.refresh(assignment)

        return assignment