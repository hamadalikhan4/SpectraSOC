from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class IncidentResolutionCreate(BaseModel):
    root_cause: Optional[str] = None
    containment: Optional[str] = None
    recovery: Optional[str] = None
    lessons_learned: Optional[str] = None
    closure_notes: Optional[str] = None
    resolved_by: str = "SOC Analyst"


class IncidentResolutionResponse(IncidentResolutionCreate):
    id: int
    incident_id: str
    resolved_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True