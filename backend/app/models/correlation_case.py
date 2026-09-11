from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.database.database import Base


class CorrelationCase(Base):
    __tablename__ = "correlation_cases"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(String(100), unique=True, index=True, nullable=False)

    source_ip = Column(String(100), index=True, nullable=True)

    title = Column(String(255), nullable=False)

    attack_chain = Column(JSON, nullable=True)

    correlated_events = Column(JSON, nullable=True)

    mitre_tactics = Column(JSON, nullable=True)

    risk_score = Column(Integer, default=0)

    severity = Column(String(50), default="LOW")

    status = Column(String(50), default="OPEN")

    ai_summary = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())