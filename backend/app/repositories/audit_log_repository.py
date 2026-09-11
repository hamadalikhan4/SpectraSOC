from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate


def create_audit_log(db: Session, log: AuditLogCreate):
    entry = AuditLog(**log.model_dump())

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


def get_audit_logs(db: Session, skip: int = 0, limit: int = 50):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()