from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class IncidentAssignmentBase(BaseModel):
    analyst: str = "Unassigned"
    priority: str = "P3 - Medium"
    sla: str = "24 Hours"
    due_date: Optional[str] = None
    escalation: str = "SOC Lead"


class IncidentAssignmentCreate(IncidentAssignmentBase):
    pass


class IncidentAssignmentResponse(IncidentAssignmentBase):
    id: int
    incident_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True