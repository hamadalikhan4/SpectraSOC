from sqlalchemy.orm import Session

from app.models.incident_evidence import IncidentEvidence
from app.schemas.incident_evidence import IncidentEvidenceCreate


class IncidentEvidenceRepository:

    def get_all(self, db: Session, incident_id: str):
        return (
            db.query(IncidentEvidence)
            .filter(
                IncidentEvidence.incident_id == incident_id
            )
            .order_by(
                IncidentEvidence.created_at.desc()
            )
            .all()
        )

    def add(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentEvidenceCreate,
    ):
        evidence = IncidentEvidence(
            incident_id=incident_id,
            evidence_type=payload.evidence_type,
            title=payload.title,
            description=payload.description,
            value=payload.value,
            source=payload.source,
            collected_by=payload.collected_by,
        )

        db.add(evidence)
        db.commit()
        db.refresh(evidence)

        return evidence

    def delete(
        self,
        db: Session,
        evidence_id: int,
    ):
        evidence = (
            db.query(IncidentEvidence)
            .filter(IncidentEvidence.id == evidence_id)
            .first()
        )

        if evidence:
            db.delete(evidence)
            db.commit()

        return evidence