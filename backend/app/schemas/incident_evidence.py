from datetime import datetime
from pydantic import BaseModel


class IncidentEvidenceCreate(BaseModel):
    evidence_type: str
    title: str
    description: str | None = None
    value: str
    source: str = "SOC Analyst"
    collected_by: str = "SOC Analyst"


class IncidentEvidenceResponse(IncidentEvidenceCreate):
    id: int
    incident_id: str
    created_at: datetime

    class Config:
        from_attributes = True