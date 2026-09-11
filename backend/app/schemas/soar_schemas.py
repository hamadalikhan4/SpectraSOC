from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ----------------------------------------------------
# Playbook Step
# ----------------------------------------------------

class PlaybookStepBase(BaseModel):
    step_order: int
    step_type: str
    name: str
    description: Optional[str] = None

    action_key: Optional[str] = None
    connector_name: Optional[str] = None

    config: Dict[str, Any] = Field(default_factory=dict)
    condition: Dict[str, Any] = Field(default_factory=dict)

    timeout_seconds: int = 60
    retry_count: int = 0

    on_success_step_id: Optional[str] = None
    on_failure_step_id: Optional[str] = None


class PlaybookStepCreate(PlaybookStepBase):
    pass


class PlaybookStepRead(PlaybookStepBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Playbook
# ----------------------------------------------------

class PlaybookBase(BaseModel):
    name: str
    description: Optional[str] = None

    category: Optional[str] = None

    status: str = "Draft"
    version: str = "v1.0"

    trigger_type: Optional[str] = None
    trigger_source: Optional[str] = None

    severity: str = "Medium"

    is_active: bool = True


class PlaybookCreate(PlaybookBase):
    created_by: Optional[str] = None
    steps: List[PlaybookStepCreate] = []


class PlaybookUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    category: Optional[str] = None

    status: Optional[str] = None
    version: Optional[str] = None

    trigger_type: Optional[str] = None
    trigger_source: Optional[str] = None

    severity: Optional[str] = None

    is_active: Optional[bool] = None


class PlaybookRead(PlaybookBase):
    id: str

    success_rate: float
    execution_count: int

    created_by: Optional[str]

    created_at: datetime
    updated_at: datetime

    steps: List[PlaybookStepRead] = []

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Execution Step
# ----------------------------------------------------

class ExecutionStepBase(BaseModel):
    step_order: int
    step_type: str

    name: str

    status: str

    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Dict[str, Any] = Field(default_factory=dict)

    error_message: Optional[str] = None

    duration_ms: int = 0
    retry_count: int = 0

    logs: List[Any] = Field(default_factory=list)


class ExecutionStepCreate(ExecutionStepBase):
    pass


class ExecutionStepRead(ExecutionStepBase):
    id: str

    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Execution
# ----------------------------------------------------

class ExecutionBase(BaseModel):
    execution_id: str

    playbook_id: Optional[str] = None
    playbook_name: Optional[str] = None

    trigger_source: Optional[str] = None
    trigger_payload: Dict[str, Any] = Field(default_factory=dict)

    severity: str = "Medium"

    status: str = "Queued"

    progress: int = 0

    runtime_seconds: int = 0

    started_by: Optional[str] = None

    incident_id: Optional[str] = None

    error_message: Optional[str] = None


class ExecutionCreate(ExecutionBase):
    pass


class ExecutionUpdate(BaseModel):
    status: Optional[str] = None

    progress: Optional[int] = None

    runtime_seconds: Optional[int] = None

    incident_id: Optional[str] = None

    error_message: Optional[str] = None


class ExecutionRead(ExecutionBase):
    id: str

    started_at: datetime

    completed_at: Optional[datetime]

    created_at: datetime

    steps: List[ExecutionStepRead] = []

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Connector
# ----------------------------------------------------

class ConnectorBase(BaseModel):
    name: str

    category: Optional[str] = None

    status: str = "Available"

    health: str = "Ready"

    description: Optional[str] = None

    auth_type: Optional[str] = None

    base_url: Optional[str] = None

    actions_count: int = 0

    executions_count: int = 0

    capabilities: List[Any] = Field(default_factory=list)

    config_schema: Dict[str, Any] = Field(default_factory=dict)

    risk_level: str = "Low"

    is_enabled: bool = True


class ConnectorCreate(ConnectorBase):
    pass


class ConnectorUpdate(BaseModel):
    status: Optional[str] = None
    health: Optional[str] = None
    description: Optional[str] = None
    auth_type: Optional[str] = None
    base_url: Optional[str] = None
    capabilities: Optional[List[Any]] = None
    config_schema: Optional[Dict[str, Any]] = None
    risk_level: Optional[str] = None
    is_enabled: Optional[bool] = None


class ConnectorRead(ConnectorBase):
    id: str

    last_used_at: Optional[datetime]

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Settings
# ----------------------------------------------------

class SettingsBase(BaseModel):
    workers_enabled: bool = True

    max_parallel_executions: int = 5

    default_timeout_seconds: int = 120

    default_retry_count: int = 2

    require_approval_for_destructive_actions: bool = True

    enable_audit_logging: bool = True

    enable_ai_recommendations: bool = True

    queue_config: Dict[str, Any] = Field(default_factory=dict)

    security_config: Dict[str, Any] = Field(default_factory=dict)

    notification_config: Dict[str, Any] = Field(default_factory=dict)


class SettingsUpdate(SettingsBase):
    pass


class SettingsRead(SettingsBase):
    id: str

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True