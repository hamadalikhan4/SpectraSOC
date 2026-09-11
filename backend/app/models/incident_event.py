from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database.database import Base


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, index=True, nullable=False)

    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_by = Column(String, nullable=False, default="SpectraSOC")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )