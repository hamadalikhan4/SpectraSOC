from sqlalchemy.orm import Session

from app.repositories.incident_comment_repository import (
    IncidentCommentRepository,
)

from app.schemas.incident_comment import (
    IncidentCommentCreate,
)


class IncidentCommentService:

    def __init__(self):
        self.repo = IncidentCommentRepository()

    def get_comments(
        self,
        db: Session,
        incident_id: str,
    ):
        return self.repo.get_comments(db, incident_id)

    def add_comment(
        self,
        db: Session,
        incident_id: str,
        payload: IncidentCommentCreate,
    ):
        return self.repo.add_comment(
            db,
            incident_id,
            payload,
        )