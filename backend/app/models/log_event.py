from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class LogEvent(Base):
    __tablename__ = "log_events"

    id = Column(Integer, primary_key=True, index=True)

    source = Column(String(100), nullable=False)
    event_type = Column(String(100), nullable=False)

    raw_log = Column(Text, nullable=False)

    source_ip = Column(String(45))
    target_ip = Column(String(45))
    username = Column(String(100))

    attack_type = Column(String(100))
    severity = Column(String(20))
    risk_score = Column(Float, default=0)

    analyzed = Column(Boolean, default=False)
    alert_created = Column(Boolean, default=False)

    processing_time_ms = Column(Float, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )