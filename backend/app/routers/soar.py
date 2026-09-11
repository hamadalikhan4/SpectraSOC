from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.soar_service import SOARService

from app.schemas.soar_schemas import (
    ConnectorCreate,
    ConnectorRead,
    ConnectorUpdate,
    ExecutionCreate,
    ExecutionRead,
    ExecutionStepCreate,
    ExecutionStepRead,
    ExecutionUpdate,
    PlaybookCreate,
    PlaybookRead,
    PlaybookStepCreate,
    PlaybookStepRead,
    PlaybookUpdate,
    SettingsRead,
    SettingsUpdate,
)


router = APIRouter(
    prefix="/api/v1/soar",
    tags=["SOAR Automation"],
)


# ==========================================================
# REQUEST MODELS
# ==========================================================

class StartExecutionRequest(BaseModel):
    trigger_payload: Dict[str, Any] = Field(default_factory=dict)
    trigger_source: Optional[str] = None
    started_by: Optional[str] = "SOAR Engine"
    triggered_by: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)


class ReplacePlaybookStepsRequest(BaseModel):
    steps: List[PlaybookStepCreate]


class RetryFailedStepRequest(BaseModel):
    step_id: Optional[str] = None


# ==========================================================
# DASHBOARD / OVERVIEW
# ==========================================================

@router.get("/overview")
def get_soar_overview(db: Session = Depends(get_db)):
    service = SOARService(db)
    return service.get_soar_overview()


# ==========================================================
# PLAYBOOKS
# ==========================================================

@router.get("/playbooks", response_model=List[PlaybookRead])
def list_playbooks(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.list_playbooks(
        search=search,
        status_filter=status_filter,
        category=category,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/playbooks",
    response_model=PlaybookRead,
    status_code=status.HTTP_201_CREATED,
)
def create_playbook(
    payload: PlaybookCreate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.create_playbook(payload)


@router.get("/playbooks/{playbook_id}", response_model=PlaybookRead)
def get_playbook(
    playbook_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.get_playbook(playbook_id)


@router.put("/playbooks/{playbook_id}", response_model=PlaybookRead)
def update_playbook(
    playbook_id: str,
    payload: PlaybookUpdate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.update_playbook(playbook_id, payload)


@router.delete("/playbooks/{playbook_id}")
def delete_playbook(
    playbook_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.delete_playbook(playbook_id)


@router.post(
    "/playbooks/{playbook_id}/steps",
    response_model=PlaybookStepRead,
    status_code=status.HTTP_201_CREATED,
)
def add_playbook_step(
    playbook_id: str,
    payload: PlaybookStepCreate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    step = service.repo.add_playbook_step(
        playbook_id=playbook_id,
        payload=payload,
    )

    if not step:
        service._not_found("SOAR playbook not found.")

    return step


@router.put("/playbooks/{playbook_id}/steps", response_model=PlaybookRead)
def replace_playbook_steps(
    playbook_id: str,
    payload: ReplacePlaybookStepsRequest,
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.replace_playbook_steps(
        playbook_id=playbook_id,
        steps=payload.steps,
    )


@router.post(
    "/playbooks/{playbook_id}/start",
    response_model=ExecutionRead,
    status_code=status.HTTP_201_CREATED,
)
def start_playbook_execution(
    playbook_id: str,
    payload: StartExecutionRequest,
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    trigger_payload = payload.trigger_payload or {}

    if payload.trigger_source:
        trigger_payload["trigger_source"] = payload.trigger_source

    if payload.context:
        trigger_payload["context"] = payload.context

    return service.start_playbook_execution(
        playbook_id=playbook_id,
        trigger_payload=trigger_payload,
        started_by=payload.triggered_by or payload.started_by,
    )


# ==========================================================
# EXECUTIONS
# ==========================================================

@router.get("/executions", response_model=List[ExecutionRead])
def list_executions(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.list_executions(
        search=search,
        status_filter=status_filter,
        severity=severity,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/executions",
    response_model=ExecutionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_execution(
    payload: ExecutionCreate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.create_execution(payload)


@router.get("/executions/{execution_id}", response_model=ExecutionRead)
def get_execution(
    execution_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.get_execution(execution_id)


@router.put("/executions/{execution_id}", response_model=ExecutionRead)
def update_execution(
    execution_id: str,
    payload: ExecutionUpdate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.update_execution(execution_id, payload)


@router.post(
    "/executions/{execution_id}/steps",
    response_model=ExecutionStepRead,
    status_code=status.HTTP_201_CREATED,
)
def add_execution_step(
    execution_id: str,
    payload: ExecutionStepCreate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.add_execution_step(
        execution_id=execution_id,
        payload=payload,
    )


@router.post(
    "/executions/{execution_id}/simulate-progress",
    response_model=ExecutionRead,
)
def simulate_execution_progress(
    execution_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.simulate_execution_progress(execution_id)


@router.post(
    "/executions/{execution_id}/simulate-failure",
    response_model=ExecutionRead,
)
def simulate_execution_failure(
    execution_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.simulate_execution_failure(execution_id)


@router.post(
    "/executions/{execution_id}/retry-failed-step",
    response_model=ExecutionRead,
)
def retry_failed_step(
    execution_id: str,
    payload: RetryFailedStepRequest,
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.retry_failed_step(
        execution_id=execution_id,
        step_id=payload.step_id,
    )


# ==========================================================
# CONNECTORS / ACTION LIBRARY
# ==========================================================

@router.get("/connectors", response_model=List[ConnectorRead])
def list_connectors(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    service = SOARService(db)

    return service.list_connectors(
        search=search,
        category=category,
        status_filter=status_filter,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/connectors",
    response_model=ConnectorRead,
    status_code=status.HTTP_201_CREATED,
)
def create_connector(
    payload: ConnectorCreate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.create_connector(payload)


@router.post("/connectors/seed-defaults")
def seed_default_connectors(
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.seed_default_connectors()


@router.get("/connectors/{connector_id}", response_model=ConnectorRead)
def get_connector(
    connector_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.get_connector(connector_id)


@router.put("/connectors/{connector_id}", response_model=ConnectorRead)
def update_connector(
    connector_id: str,
    payload: ConnectorUpdate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.update_connector(connector_id, payload)


@router.post("/connectors/{connector_id}/mark-used", response_model=ConnectorRead)
def mark_connector_used(
    connector_id: str,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.mark_connector_used(connector_id)


# ==========================================================
# SETTINGS
# ==========================================================

@router.get("/settings", response_model=SettingsRead)
def get_settings(db: Session = Depends(get_db)):
    service = SOARService(db)
    return service.get_settings()


@router.put("/settings", response_model=SettingsRead)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
):
    service = SOARService(db)
    return service.update_settings(payload)