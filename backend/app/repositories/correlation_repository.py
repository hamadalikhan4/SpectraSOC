from sqlalchemy.orm import Session
from app.models.correlation_case import CorrelationCase


class CorrelationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_case(self, case: CorrelationCase):
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    def list_cases(self, limit: int = 50):
        return (
            self.db.query(CorrelationCase)
            .order_by(CorrelationCase.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_case_id(self, case_id: str):
        return (
            self.db.query(CorrelationCase)
            .filter(CorrelationCase.case_id == case_id)
            .first()
        )