import time

from sqlalchemy.orm import Session

from app.detection.detector import analyze_log
from app.repositories.log_repository import (
    create_log,
    get_log,
    get_logs,
    update_log,
)
from app.schemas.log_event import LogEventCreate


def ingest_log(db: Session, log: LogEventCreate):
    start = time.perf_counter()

    new_log = create_log(db, log)

    end = time.perf_counter()

    new_log.processing_time_ms = round((end - start) * 1000, 2)

    db.commit()
    db.refresh(new_log)

    return new_log


def analyze_and_update_log(db: Session, log):
    result = analyze_log(
        {
            "raw_log": log.raw_log,
            "source": log.source,
            "event_type": log.event_type,
            "source_ip": log.source_ip,
            "target_ip": log.target_ip,
            "username": log.username,
        }
    )

    log.attack_type = result["attack_type"]
    log.severity = result["severity"]
    log.risk_score = result["risk_score"]
    log.analyzed = True
    log.processing_time_ms = result.get("processing_time_ms", log.processing_time_ms)

    if result["risk_score"] >= 80:
        log.alert_created = True

    update_log(db, log)

    return log, result


def list_logs(db: Session):
    return get_logs(db)


def get_log_details(db: Session, log_id: int):
    return get_log(db, log_id)