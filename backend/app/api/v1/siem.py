from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.siem import SIEMLogCreate
from app.services.siem_service import SIEMService

router = APIRouter(prefix="/siem", tags=["SIEM"])


@router.post("/logs")
def ingest_log(
    data: SIEMLogCreate,
    db: Session = Depends(get_db)
):
    service = SIEMService(db)
    log = service.ingest_log(data)

    return {
        "success": True,
        "message": "Log ingested successfully",
        "log": format_log(log)
    }


@router.get("/logs")
def list_logs(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = SIEMService(db)
    logs = service.list_logs(limit)

    return {
        "success": True,
        "count": len(logs),
        "logs": [format_log(log) for log in logs]
    }


@router.get("/high-risk")
def high_risk_logs(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    service = SIEMService(db)
    logs = service.high_risk_logs(limit)

    return {
        "success": True,
        "count": len(logs),
        "logs": [format_log(log) for log in logs]
    }


@router.get("/stats")
def siem_stats(db: Session = Depends(get_db)):
    service = SIEMService(db)
    logs = service.list_logs(500)

    total = len(logs)
    critical = len([l for l in logs if l.severity == "CRITICAL"])
    high = len([l for l in logs if l.severity == "HIGH"])
    zero_day = len([l for l in logs if l.zero_day_suspicion == "true"])

    return {
        "success": True,
        "total_logs": total,
        "critical_logs": critical,
        "high_logs": high,
        "zero_day_suspicion": zero_day
    }


def format_log(log):
    return {
        "id": log.id,
        "source_type": log.source_type,
        "source_name": log.source_name,
        "source_ip": log.source_ip,
        "destination_ip": log.destination_ip,
        "username": log.username,
        "event_type": log.event_type,
        "severity": log.severity,
        "message": log.message,
        "mitre_technique": log.mitre_technique,
        "mitre_tactic": log.mitre_tactic,
        "risk_score": log.risk_score,
        "zero_day_score": log.zero_day_score,
        "zero_day_suspicion": log.zero_day_suspicion,
        "created_at": log.created_at,
    }