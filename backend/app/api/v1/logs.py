from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.log_service import ingest_log, analyze_and_update_log
from app.database.database import get_db
from app.schemas.log_event import (
    LogEventCreate,
    LogEventResponse,
)
from app.services.log_service import (
    get_log_details,
    ingest_log,
    list_logs,
)

router = APIRouter(
    prefix="/logs",
    tags=["Logs"],
)


@router.post("/", response_model=LogEventResponse)
def create_log(log: LogEventCreate, db: Session = Depends(get_db)):

    saved_log = ingest_log(db, log)

    updated_log, analysis = analyze_and_update_log(db, saved_log)

    return updated_log

@router.get(
    "/",
    response_model=list[LogEventResponse],
)
def read_logs(
    db: Session = Depends(get_db),
):
    return list_logs(db)


@router.get(
    "/{log_id}",
    response_model=LogEventResponse,
)
def read_log(
    log_id: int,
    db: Session = Depends(get_db),
):

    log = get_log_details(db, log_id)

    if log is None:
        raise HTTPException(
            status_code=404,
            detail="Log not found",
        )

    return log