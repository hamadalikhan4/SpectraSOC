from sqlalchemy.orm import Session
from app.models.threat_ioc import ThreatIOC


class ThreatIOCRepository:

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(ThreatIOC)
            .order_by(ThreatIOC.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, ioc_id: int):
        return (
            db.query(ThreatIOC)
            .filter(ThreatIOC.id == ioc_id)
            .first()
        )

    @staticmethod
    def get_by_value(db: Session, value: str):
        return (
            db.query(ThreatIOC)
            .filter(ThreatIOC.ioc_value == value)
            .first()
        )

    @staticmethod
    def create(db: Session, ioc: ThreatIOC):
        db.add(ioc)
        db.commit()
        db.refresh(ioc)
        return ioc

    @staticmethod
    def update(db: Session):
        db.commit()

    @staticmethod
    def delete(db: Session, ioc):
        db.delete(ioc)
        db.commit()