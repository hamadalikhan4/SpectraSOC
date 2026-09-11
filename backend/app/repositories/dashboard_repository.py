from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alert import Alert


def count_total_alerts(db: Session) -> int:
    return db.query(Alert).count()


def count_alerts_by_severity(db: Session):
    return (
        db.query(Alert.severity, func.count(Alert.id))
        .group_by(Alert.severity)
        .all()
    )


def count_alerts_by_status(db: Session):
    return (
        db.query(Alert.status, func.count(Alert.id))
        .group_by(Alert.status)
        .all()
    )


def get_top_source_ips(db: Session, limit: int = 5):
    return (
        db.query(Alert.source_ip, func.count(Alert.id).label("count"))
        .filter(Alert.source_ip.isnot(None))
        .group_by(Alert.source_ip)
        .order_by(func.count(Alert.id).desc())
        .limit(limit)
        .all()
    )


def get_top_target_ips(db: Session, limit: int = 5):
    return (
        db.query(Alert.target_ip, func.count(Alert.id).label("count"))
        .filter(Alert.target_ip.isnot(None))
        .group_by(Alert.target_ip)
        .order_by(func.count(Alert.id).desc())
        .limit(limit)
        .all()
    )


def get_recent_alerts(db: Session, limit: int = 10):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(limit)
        .all()
    )