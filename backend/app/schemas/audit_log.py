from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditLogBase(BaseModel):
    action: str
    entity: Optional[str] = None
    description: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None
    ip_address: Optional[str] = None


class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True