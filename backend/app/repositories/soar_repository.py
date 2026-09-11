from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, joinedload

from app.models.soar_models import (
    SOARConnector,
    SOARExecution,
    SOARExecutionStep,
    SOARPlaybook,
    SOARPlaybookStep,
    SOARSettings,
)

from app.schemas.soar_schemas import (
    ConnectorCreate,
    ConnectorUpdate,
    ExecutionCreate,
    ExecutionStepCreate,
    ExecutionUpdate,
    PlaybookCreate,
    PlaybookStepCreate,
    PlaybookUpdate,
    SettingsUpdate,
)


class SOARRepository:
    def __init__(self, db: Session):
        self.db = db

    # ==========================================================
    # PLAYBOOKS
    # ==========================================================

    def list_playbooks(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[SOARPlaybook]:
        query = (
            self.db.query(SOARPlaybook)
            .options(joinedload(SOARPlaybook.steps))
            .order_by(desc(SOARPlaybook.updated_at))
        )

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    SOARPlaybook.name.ilike(like),
                    SOARPlaybook.description.ilike(like),
                    SOARPlaybook.category.ilike(like),
                    SOARPlaybook.trigger_source.ilike(like),
                )
            )

        if status:
            query = query.filter(SOARPlaybook.status == status)

        if category:
            query = query.filter(SOARPlaybook.category == category)

        return query.offset(skip).limit(limit).all()

    def get_playbook(self, playbook_id: str) -> Optional[SOARPlaybook]:
        return (
            self.db.query(SOARPlaybook)
            .options(joinedload(SOARPlaybook.steps))
            .filter(SOARPlaybook.id == playbook_id)
            .first()
        )

    def create_playbook(self, payload: PlaybookCreate) -> SOARPlaybook:
        data = payload.model_dump(exclude={"steps"})
        playbook = SOARPlaybook(**data)

        self.db.add(playbook)
        self.db.flush()

        for step_payload in payload.steps:
            step = SOARPlaybookStep(
                playbook_id=playbook.id,
                **step_payload.model_dump(),
            )
            self.db.add(step)

        self.db.commit()
        self.db.refresh(playbook)

        return self.get_playbook(playbook.id)

    def update_playbook(
        self,
        playbook_id: str,
        payload: PlaybookUpdate,
    ) -> Optional[SOARPlaybook]:
        playbook = self.get_playbook(playbook_id)

        if not playbook:
            return None

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(playbook, field, value)

        playbook.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(playbook)

        return self.get_playbook(playbook.id)

    def delete_playbook(self, playbook_id: str) -> bool:
        playbook = self.get_playbook(playbook_id)

        if not playbook:
            return False

        self.db.delete(playbook)
        self.db.commit()

        return True

    # ==========================================================
    # PLAYBOOK STEPS
    # ==========================================================

    def add_playbook_step(
        self,
        playbook_id: str,
        payload: PlaybookStepCreate,
    ) -> Optional[SOARPlaybookStep]:
        playbook = self.get_playbook(playbook_id)

        if not playbook:
            return None

        step = SOARPlaybookStep(
            playbook_id=playbook_id,
            **payload.model_dump(),
        )

        self.db.add(step)
        playbook.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(step)

        return step

    def replace_playbook_steps(
        self,
        playbook_id: str,
        steps: List[PlaybookStepCreate],
    ) -> Optional[SOARPlaybook]:
        playbook = self.get_playbook(playbook_id)

        if not playbook:
            return None

        self.db.query(SOARPlaybookStep).filter(
            SOARPlaybookStep.playbook_id == playbook_id
        ).delete()

        for step_payload in steps:
            step = SOARPlaybookStep(
                playbook_id=playbook_id,
                **step_payload.model_dump(),
            )
            self.db.add(step)

        playbook.updated_at = datetime.utcnow()

        self.db.commit()

        return self.get_playbook(playbook_id)

    # ==========================================================
    # EXECUTIONS
    # ==========================================================

    def list_executions(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[SOARExecution]:
        query = (
            self.db.query(SOARExecution)
            .options(joinedload(SOARExecution.steps))
            .order_by(desc(SOARExecution.created_at))
        )

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    SOARExecution.execution_id.ilike(like),
                    SOARExecution.playbook_name.ilike(like),
                    SOARExecution.trigger_source.ilike(like),
                    SOARExecution.incident_id.ilike(like),
                )
            )

        if status:
            query = query.filter(SOARExecution.status == status)

        if severity:
            query = query.filter(SOARExecution.severity == severity)

        return query.offset(skip).limit(limit).all()

    def get_execution(self, execution_id: str) -> Optional[SOARExecution]:
        return (
            self.db.query(SOARExecution)
            .options(joinedload(SOARExecution.steps))
            .filter(
                or_(
                    SOARExecution.id == execution_id,
                    SOARExecution.execution_id == execution_id,
                )
            )
            .first()
        )

    def create_execution(self, payload: ExecutionCreate) -> SOARExecution:
        execution = SOARExecution(**payload.model_dump())

        self.db.add(execution)

        if execution.playbook_id:
            playbook = self.get_playbook(execution.playbook_id)

            if playbook and hasattr(playbook, "execution_count"):
                playbook.execution_count = (playbook.execution_count or 0) + 1
                playbook.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(execution)

        return self.get_execution(execution.id)

    def update_execution(
        self,
        execution_id: str,
        payload: ExecutionUpdate,
    ) -> Optional[SOARExecution]:
        execution = self.get_execution(execution_id)

        if not execution:
            return None

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(execution, field, value)

        if update_data.get("status") in ["Completed", "Failed", "Cancelled"]:
            execution.completed_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(execution)

        return self.get_execution(execution.id)

    def add_execution_step(
        self,
        execution_id: str,
        payload: ExecutionStepCreate,
    ) -> Optional[SOARExecutionStep]:
        execution = self.get_execution(execution_id)

        if not execution:
            return None

        step = SOARExecutionStep(
            execution_id=execution.id,
            **payload.model_dump(),
        )

        self.db.add(step)
        self.db.commit()
        self.db.refresh(step)

        return step

    def get_execution_step(self, step_id: str) -> Optional[SOARExecutionStep]:
        return (
            self.db.query(SOARExecutionStep)
            .filter(SOARExecutionStep.id == step_id)
            .first()
        )

    def update_execution_step_state(
        self,
        step_id: str,
        status: Optional[str] = None,
        output_payload: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        logs_to_append: Optional[List[str]] = None,
        duration_ms: Optional[int] = None,
        mark_started: bool = False,
        mark_completed: bool = False,
        increment_retry: bool = False,
    ) -> Optional[SOARExecutionStep]:
        step = self.get_execution_step(step_id)

        if not step:
            return None

        if status:
            step.status = status

        if output_payload is not None:
            existing_output = step.output_payload or {}
            existing_output.update(output_payload)
            step.output_payload = existing_output

        if error_message is not None:
            step.error_message = error_message or None

        if logs_to_append:
            existing_logs = step.logs or []
            step.logs = existing_logs + logs_to_append

        if duration_ms is not None:
            step.duration_ms = duration_ms

        if increment_retry:
            step.retry_count = (step.retry_count or 0) + 1

        if mark_started and not step.started_at:
            step.started_at = datetime.utcnow()

        if mark_completed:
            step.completed_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(step)

        return step

    def update_execution_progress(
        self,
        execution_id: str,
        progress: int,
        status: Optional[str] = None,
        runtime_seconds: Optional[int] = None,
        error_message: Optional[str] = None,
    ) -> Optional[SOARExecution]:
        execution = self.get_execution(execution_id)

        if not execution:
            return None

        execution.progress = progress

        if status:
            execution.status = status

        if runtime_seconds is not None:
            execution.runtime_seconds = runtime_seconds

        if error_message is not None:
            execution.error_message = error_message or None

        if status in ["Completed", "Failed", "Cancelled"]:
            execution.completed_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(execution)

        return self.get_execution(execution.id)

    # ==========================================================
    # CONNECTORS
    # ==========================================================

    def list_connectors(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[SOARConnector]:
        query = self.db.query(SOARConnector).order_by(SOARConnector.name.asc())

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    SOARConnector.name.ilike(like),
                    SOARConnector.category.ilike(like),
                    SOARConnector.description.ilike(like),
                )
            )

        if category:
            query = query.filter(SOARConnector.category == category)

        if status:
            query = query.filter(SOARConnector.status == status)

        return query.offset(skip).limit(limit).all()

    def get_connector(self, connector_id: str) -> Optional[SOARConnector]:
        return (
            self.db.query(SOARConnector)
            .filter(
                or_(
                    SOARConnector.id == connector_id,
                    SOARConnector.name == connector_id,
                )
            )
            .first()
        )

    def create_connector(self, payload: ConnectorCreate) -> SOARConnector:
        connector = SOARConnector(**payload.model_dump())

        self.db.add(connector)
        self.db.commit()
        self.db.refresh(connector)

        return connector

    def update_connector(
        self,
        connector_id: str,
        payload: ConnectorUpdate,
    ) -> Optional[SOARConnector]:
        connector = self.get_connector(connector_id)

        if not connector:
            return None

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(connector, field, value)

        connector.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(connector)

        return connector

    def mark_connector_used(self, connector_id: str) -> Optional[SOARConnector]:
        connector = self.get_connector(connector_id)

        if not connector:
            return None

        connector.last_used_at = datetime.utcnow()

        if hasattr(connector, "executions_count"):
            connector.executions_count = (connector.executions_count or 0) + 1

        self.db.commit()
        self.db.refresh(connector)

        return connector

    # ==========================================================
    # SETTINGS
    # ==========================================================

    def get_settings(self) -> SOARSettings:
        settings = self.db.query(SOARSettings).first()

        if not settings:
            settings = SOARSettings()
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)

        return settings

    def update_settings(self, payload: SettingsUpdate) -> SOARSettings:
        settings = self.get_settings()

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(settings, field, value)

        settings.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(settings)

        return settings