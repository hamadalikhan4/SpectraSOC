from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=True)

    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=True)

    description = Column(Text, nullable=True)

    ip_address = Column(String(45), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)