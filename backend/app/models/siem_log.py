from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.database.database import Base


class SIEMLog(Base):
    __tablename__ = "siem_logs"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(DateTime(timezone=True), nullable=True)

    source_type = Column(String(50), index=True, nullable=False)
    source_name = Column(String(100), nullable=True)

    source_ip = Column(String(100), index=True, nullable=True)
    destination_ip = Column(String(100), nullable=True)

    username = Column(String(100), nullable=True)

    event_type = Column(String(100), index=True, nullable=False)

    severity = Column(String(50), default="LOW", index=True)

    message = Column(String, nullable=False)
    raw_log = Column(String, nullable=True)

    normalized_data = Column(JSON, nullable=True)

    mitre_technique = Column(String(50), nullable=True)
    mitre_tactic = Column(String(100), nullable=True)

    risk_score = Column(Integer, default=0)

    zero_day_score = Column(Integer, default=0)
    zero_day_suspicion = Column(String(10), default="false")

    created_at = Column(DateTime(timezone=True), server_default=func.now())