from sqlalchemy.orm import Session
from app.models.siem_log import SIEMLog


class SIEMRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_log(self, log: SIEMLog):
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list_logs(self, limit: int = 100):
        return (
            self.db.query(SIEMLog)
            .order_by(SIEMLog.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_high_risk_logs(self, limit: int = 50):
        return (
            self.db.query(SIEMLog)
            .filter(SIEMLog.risk_score >= 70)
            .order_by(SIEMLog.created_at.desc())
            .limit(limit)
            .all()
        )