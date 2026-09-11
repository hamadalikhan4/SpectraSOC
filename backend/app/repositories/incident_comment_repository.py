from sqlalchemy.orm import Session

from app.models.incident_comment import IncidentComment
from app.schemas.incident_comment import IncidentCommentCreate


class IncidentCommentRepository:

    def get_comments(self, db: Session, incident_id: str):
        return (
            db.query(IncidentComment)
            .filter(
                IncidentComment.incident_id == incident_id
            )
            .order_by(
                IncidentComment.created_at.desc()
            )
            .all()
        )

    def add_comment(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentCommentCreate,
    ):

        comment = IncidentComment(
            incident_id=incident_id,
            analyst=payload.analyst,
            comment=payload.comment,
        )

        db.add(comment)

        db.commit()

        db.refresh(comment)

        return comment