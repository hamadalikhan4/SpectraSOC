from datetime import datetime

from pydantic import BaseModel


class IncidentEventCreate(BaseModel):
    event_type: str
    description: str
    created_by: str = "SpectraSOC"


class IncidentEventResponse(BaseModel):
    id: int
    incident_id: str
    event_type: str
    description: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True