from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import require_admin, require_analyst_or_admin
from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.services.alert_service import (
    create_alert,
    delete_alert,
    get_alert_by_id,
    get_alerts,
    update_alert,
)


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.post("/", response_model=AlertResponse)
def create_new_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    return create_alert(db, alert)


@router.get("/", response_model=list[AlertResponse])
def read_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_alerts(db)


@router.get("/{alert_id}", response_model=AlertResponse)
def read_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = get_alert_by_id(db, alert_id)

    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_existing_alert(
    alert_id: int,
    alert: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    updated_alert = update_alert(db, alert_id, alert)

    if updated_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    return updated_alert


@router.delete("/{alert_id}")
def delete_existing_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    deleted = delete_alert(db, alert_id)

    if deleted is False:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {
        "message": "Alert deleted successfully"
    }