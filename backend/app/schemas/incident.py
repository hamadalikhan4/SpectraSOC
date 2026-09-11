from typing import Optional
from pydantic import BaseModel


class IncidentCreateRequest(BaseModel):
    indicator: str


class IncidentUpdateStatusRequest(BaseModel):
    status: str


class IncidentResponse(BaseModel):
    incident_id: str
    indicator: str
    indicator_type: str
    severity: str
    status: str
    title: str
    summary: str
    business_impact: Optional[str] = None
    risk_score: int