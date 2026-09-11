from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.correlation_service import CorrelationService

router = APIRouter(prefix="/correlation", tags=["Correlation Engine"])


@router.post("/run")
def run_correlation(db: Session = Depends(get_db)):
    service = CorrelationService(db)
    cases = service.run_correlation()

    return {
        "success": True,
        "created": len(cases),
        "cases": [format_case(case) for case in cases],
    }


@router.get("/cases")
def list_cases(limit: int = 50, db: Session = Depends(get_db)):
    service = CorrelationService(db)
    cases = service.list_cases(limit)

    return {
        "success": True,
        "count": len(cases),
        "cases": [format_case(case) for case in cases],
    }


@router.get("/cases/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    service = CorrelationService(db)
    case = service.get_case(case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Correlation case not found")

    return {
        "success": True,
        "case": format_case(case),
    }


def format_case(case):
    return {
        "id": case.id,
        "case_id": case.case_id,
        "source_ip": case.source_ip,
        "title": case.title,
        "attack_chain": case.attack_chain,
        "correlated_events": case.correlated_events,
        "mitre_tactics": case.mitre_tactics,
        "risk_score": case.risk_score,
        "severity": case.severity,
        "status": case.status,
        "ai_summary": case.ai_summary,
        "created_at": case.created_at,
    }