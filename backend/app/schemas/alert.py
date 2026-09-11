from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AlertBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str
    source_ip: Optional[str] = None
    target_ip: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    source_ip: Optional[str] = None
    target_ip: Optional[str] = None
    status: Optional[str] = None


class AlertResponse(AlertBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True