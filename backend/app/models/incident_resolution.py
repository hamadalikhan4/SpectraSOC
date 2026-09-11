from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database.database import Base


class IncidentResolution(Base):
    __tablename__ = "incident_resolutions"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, nullable=False, unique=True, index=True)

    root_cause = Column(Text, nullable=True)
    containment = Column(Text, nullable=True)
    recovery = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    closure_notes = Column(Text, nullable=True)

    resolved_by = Column(String, nullable=False, default="SOC Analyst")

    resolved_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )