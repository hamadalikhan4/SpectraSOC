from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.database import Base


class IncidentAssignment(Base):
    __tablename__ = "incident_assignments"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, index=True, nullable=False, unique=True)

    analyst = Column(String, nullable=False, default="Unassigned")
    priority = Column(String, nullable=False, default="P3 - Medium")
    sla = Column(String, nullable=False, default="24 Hours")
    due_date = Column(String, nullable=True)
    escalation = Column(String, nullable=False, default="SOC Lead")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )