import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class SOARPlaybook(Base):
    __tablename__ = "soar_playbooks"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    category = Column(String(120), nullable=True)
    status = Column(String(50), default="Draft", index=True)
    version = Column(String(50), default="v1.0")

    trigger_type = Column(String(120), nullable=True)
    trigger_source = Column(String(120), nullable=True)

    severity = Column(String(50), default="Medium")
    success_rate = Column(Float, default=0.0)
    execution_count = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)

    created_by = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    steps = relationship(
        "SOARPlaybookStep",
        back_populates="playbook",
        cascade="all, delete-orphan",
    )

    executions = relationship(
        "SOARExecution",
        back_populates="playbook",
        cascade="all, delete-orphan",
    )


class SOARPlaybookStep(Base):
    __tablename__ = "soar_playbook_steps"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    playbook_id = Column(
        String,
        ForeignKey("soar_playbooks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    step_order = Column(Integer, nullable=False, default=1)

    step_type = Column(String(80), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    action_key = Column(String(255), nullable=True)
    connector_name = Column(String(255), nullable=True)

    config = Column(JSON, default=dict)
    condition = Column(JSON, default=dict)

    timeout_seconds = Column(Integer, default=60)
    retry_count = Column(Integer, default=0)

    on_success_step_id = Column(String, nullable=True)
    on_failure_step_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    playbook = relationship("SOARPlaybook", back_populates="steps")


class SOARExecution(Base):
    __tablename__ = "soar_executions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    execution_id = Column(String(100), unique=True, nullable=False, index=True)

    playbook_id = Column(
        String,
        ForeignKey("soar_playbooks.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    playbook_name = Column(String(255), nullable=True)

    status = Column(String(50), default="Queued", index=True)
    severity = Column(String(50), default="Medium", index=True)

    trigger_source = Column(String(255), nullable=True)
    trigger_payload = Column(JSON, default=dict)

    progress = Column(Integer, default=0)
    runtime_seconds = Column(Integer, default=0)

    started_by = Column(String(255), nullable=True)
    incident_id = Column(String(255), nullable=True)

    error_message = Column(Text, nullable=True)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    playbook = relationship("SOARPlaybook", back_populates="executions")

    steps = relationship(
        "SOARExecutionStep",
        back_populates="execution",
        cascade="all, delete-orphan",
    )


class SOARExecutionStep(Base):
    __tablename__ = "soar_execution_steps"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    execution_id = Column(
        String,
        ForeignKey("soar_executions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    step_order = Column(Integer, nullable=False, default=1)

    step_type = Column(String(80), nullable=False)
    name = Column(String(255), nullable=False)

    status = Column(String(50), default="Waiting", index=True)

    input_payload = Column(JSON, default=dict)
    output_payload = Column(JSON, default=dict)

    error_message = Column(Text, nullable=True)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    duration_ms = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)

    logs = Column(JSON, default=list)

    execution = relationship("SOARExecution", back_populates="steps")


class SOARConnector(Base):
    __tablename__ = "soar_connectors"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(120), nullable=True)

    status = Column(String(80), default="Available", index=True)
    health = Column(String(80), default="Ready")

    description = Column(Text, nullable=True)

    auth_type = Column(String(120), nullable=True)
    base_url = Column(String(500), nullable=True)

    actions_count = Column(Integer, default=0)
    executions_count = Column(Integer, default=0)

    capabilities = Column(JSON, default=list)
    config_schema = Column(JSON, default=dict)

    risk_level = Column(String(50), default="Low")
    is_enabled = Column(Boolean, default=True)

    last_used_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SOARSettings(Base):
    __tablename__ = "soar_settings"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    workers_enabled = Column(Boolean, default=True)
    max_parallel_executions = Column(Integer, default=5)

    default_timeout_seconds = Column(Integer, default=120)
    default_retry_count = Column(Integer, default=2)

    require_approval_for_destructive_actions = Column(Boolean, default=True)
    enable_audit_logging = Column(Boolean, default=True)
    enable_ai_recommendations = Column(Boolean, default=True)

    queue_config = Column(JSON, default=dict)
    security_config = Column(JSON, default=dict)
    notification_config = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)