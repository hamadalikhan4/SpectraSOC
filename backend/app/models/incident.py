from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from app.database.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String(50), unique=True, index=True, nullable=False)

    indicator = Column(String(255), index=True, nullable=False)
    indicator_type = Column(String(50), nullable=False)

    severity = Column(String(50), default="LOW")
    status = Column(String(50), default="OPEN")

    title = Column(String(255), nullable=False)
    summary = Column(String, nullable=False)
    business_impact = Column(String, nullable=True)

    risk_score = Column(Integer, default=0)
    mitre_mapping = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    evidence = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())