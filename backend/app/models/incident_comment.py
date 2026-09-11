from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database.database import Base


class IncidentComment(Base):
    __tablename__ = "incident_comments"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, index=True, nullable=False)

    analyst = Column(String, nullable=False)

    comment = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )