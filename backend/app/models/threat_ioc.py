from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, func
from app.database.database import Base


class ThreatIOC(Base):
    __tablename__ = "threat_iocs"

    id = Column(Integer, primary_key=True, index=True)

    ioc_type = Column(String(50), index=True, nullable=False)
    ioc_value = Column(String(500), unique=True, index=True, nullable=False)

    risk_score = Column(Integer, default=0)
    severity = Column(String(50), default="LOW", index=True)
    confidence = Column(Integer, default=0)

    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    asn = Column(String(100), nullable=True)
    provider = Column(String(255), nullable=True)

    source = Column(String(100), default="manual")
    status = Column(String(50), default="active", index=True)

    mitre_technique = Column(String(50), nullable=True)
    mitre_tactic = Column(String(100), nullable=True)

    ai_summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    is_watchlisted = Column(Boolean, default=False)

    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())