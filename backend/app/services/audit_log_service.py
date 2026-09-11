from sqlalchemy.orm import Session

from app.repositories.audit_log_repository import create_audit_log, get_audit_logs
from app.schemas.audit_log import AuditLogCreate


def log_action(
    db: Session,
    user_id: int | None,
    action: str,
    entity: str | None = None,
    description: str | None = None,
    ip_address: str | None = None,
):
    log = AuditLogCreate(
        user_id=user_id,
        action=action,
        entity=entity,
        description=description,
        ip_address=ip_address,
    )

    return create_audit_log(db, log)


def fetch_logs(db: Session, skip: int = 0, limit: int = 50):
    return get_audit_logs(db, skip, limit)