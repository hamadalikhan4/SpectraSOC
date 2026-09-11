from sqlalchemy.orm import Session

from app.models.log_event import LogEvent
from app.schemas.log_event import LogEventCreate


def create_log(db: Session, log: LogEventCreate):

    new_log = LogEvent(**log.model_dump())

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


def get_logs(db: Session):

    return (
        db.query(LogEvent)
        .order_by(LogEvent.created_at.desc())
        .all()
    )


def get_log(db: Session, log_id: int):

    return (
        db.query(LogEvent)
        .filter(LogEvent.id == log_id)
        .first()
    )


def update_log(db: Session, log: LogEvent):

    db.commit()
    db.refresh(log)

    return log