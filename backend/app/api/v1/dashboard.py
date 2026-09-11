from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.services.dashboard_service import (
    get_dashboard_recent_alerts,
    get_dashboard_summary,
    get_dashboard_threats,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_summary(db)


@router.get("/threats")
def dashboard_threats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_threats(db)


@router.get("/recent-alerts", response_model=list[AlertResponse])
def dashboard_recent_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_recent_alerts(db)