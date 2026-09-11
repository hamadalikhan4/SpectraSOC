from datetime import datetime
from typing import Optional

from pydantic import BaseModel

class DetectionResponse(BaseModel):
    alert_created: bool
    title: str | None = None
    severity: str | None = None
    reason: str
    
class LogEventCreate(BaseModel):
    source: str
    event_type: str
    raw_log: str

    source_ip: Optional[str] = None
    target_ip: Optional[str] = None
    username: Optional[str] = None


class LogEventResponse(BaseModel):
    id: int

    source: str
    event_type: str
    raw_log: str

    source_ip: Optional[str]
    target_ip: Optional[str]
    username: Optional[str]

    attack_type: Optional[str]
    severity: Optional[str]

    risk_score: float

    analyzed: bool
    alert_created: bool

    processing_time_ms: float

    created_at: datetime

    model_config = {
        "from_attributes": True
    }