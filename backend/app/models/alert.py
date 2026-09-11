from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text)

    severity = Column(String(50), nullable=False)

    source_ip = Column(String(45))

    target_ip = Column(String(45))

    status = Column(String(50), default="Open")

    created_at = Column(DateTime(timezone=True), server_default=func.now())