from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_analyst_or_admin
from app.database.database import get_db
from app.schemas.log_event import DetectionResponse, LogEventCreate
from app.services.detection_service import analyze_log_event


router = APIRouter(
    prefix="/detection",
    tags=["Detection Engine"],
)


@router.post("/analyze-log", response_model=DetectionResponse)
def analyze_log(
    event: LogEventCreate,
    db: Session = Depends(get_db),
    user=Depends(require_analyst_or_admin),
):
    return analyze_log_event(db, event)