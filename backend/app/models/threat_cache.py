from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from app.database.database import Base


class ThreatCache(Base):
    __tablename__ = "threat_cache"

    id = Column(Integer, primary_key=True, index=True)

    indicator = Column(String(255), unique=True, index=True, nullable=False)
    indicator_type = Column(String(50), default="ip", nullable=False)

    risk_score = Column(Integer, default=0)
    risk_level = Column(String(50), default="LOW")

    lookup_count = Column(Integer, default=1)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    data = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())