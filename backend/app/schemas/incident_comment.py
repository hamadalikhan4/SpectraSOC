from datetime import datetime

from pydantic import BaseModel


class IncidentCommentCreate(BaseModel):
    analyst: str
    comment: str


class IncidentCommentResponse(BaseModel):
    id: int
    incident_id: str
    analyst: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True