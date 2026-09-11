from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database.database import Base


class IncidentEvidence(Base):
    __tablename__ = "incident_evidence"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, index=True, nullable=False)

    evidence_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    value = Column(Text, nullable=False)

    source = Column(String, nullable=False, default="SOC Analyst")
    collected_by = Column(String, nullable=False, default="SOC Analyst")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )