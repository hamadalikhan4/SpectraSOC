from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class SIEMLogCreate(BaseModel):
    timestamp: Optional[datetime] = None

    source_type: str
    source_name: Optional[str] = None

    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None

    username: Optional[str] = None

    event_type: str
    severity: Optional[str] = "LOW"

    message: str
    raw_log: Optional[str] = None

    normalized_data: Optional[Dict[str, Any]] = None


class SIEMLogResponse(BaseModel):
    id: int
    source_type: str
    source_ip: Optional[str]
    destination_ip: Optional[str]
    username: Optional[str]
    event_type: str
    severity: str
    message: str
    mitre_technique: Optional[str]
    risk_score: int
    zero_day_score: int
    zero_day_suspicion: str
    created_at: datetime

    class Config:
        from_attributes = True