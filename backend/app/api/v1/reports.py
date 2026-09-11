from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database.database import get_db
from app.repositories.incident_repository import IncidentRepository
from app.repositories.incident_event_repository import IncidentEventRepository
from app.ai.incident_investigator import IncidentInvestigator
from app.reports.pdf_report import PDFReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/incident/{incident_id}")
def generate_incident_report(
    incident_id: str,
    db: Session = Depends(get_db)
):
    incident_repo = IncidentRepository(db)
    timeline_repo = IncidentEventRepository(db)

    incident = incident_repo.get_by_incident_id(incident_id)

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    timeline = timeline_repo.get_timeline(incident_id)

    investigator = IncidentInvestigator()
    investigation = investigator.explain_incident(incident)

    pdf = PDFReportGenerator()
    file_path = pdf.generate_incident_report(
        incident=incident,
        investigation=investigation,
        timeline=timeline
    )

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not generated")

    return FileResponse(
        path=file_path,
        filename=f"{incident_id}.pdf",
        media_type="application/pdf"
    )