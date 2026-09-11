from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.database.database import get_db
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_log_service import fetch_logs


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get("/", response_model=list[AuditLogResponse])
def get_logs(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return fetch_logs(db)