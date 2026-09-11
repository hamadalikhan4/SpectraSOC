from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ThreatIOCSearch(BaseModel):
    ioc_type: str
    ioc_value: str


class ThreatIOCCreate(BaseModel):
    ioc_type: str
    ioc_value: str
    source: Optional[str] = "manual"
    notes: Optional[str] = None


class ThreatIOCResponse(BaseModel):
    id: int
    ioc_type: str
    ioc_value: str
    risk_score: int
    severity: str
    confidence: int
    country: Optional[str] = None
    city: Optional[str] = None
    asn: Optional[str] = None
    provider: Optional[str] = None
    source: str
    status: str
    mitre_technique: Optional[str] = None
    mitre_tactic: Optional[str] = None
    ai_summary: Optional[str] = None
    notes: Optional[str] = None
    is_watchlisted: bool
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True