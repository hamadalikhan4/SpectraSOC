from datetime import datetime
from typing import Any, Dict, List, Optional
import random
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.soar_repository import SOARRepository

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


class SOARService:
    def __init__(self, db: Session):
        self.repo = SOARRepository(db)

    # ==========================================================
    # HELPERS
    # ==========================================================

    def _generate_execution_id(self) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        suffix = uuid.uuid4().hex[:6].upper()
        return f"EXE-SOAR-{timestamp}-{suffix}"

    def _not_found(self, message: str):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        )

    def _bad_request(self, message: str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    def _sorted_execution_steps(self, execution):
        return sorted(
            execution.steps or [],
            key=lambda step: step.step_order or 0,
        )

    def _calculate_progress(self, steps) -> int:
        if not steps:
            return 0

        completed = len([step for step in steps if step.status == "Completed"])
        return int((completed / len(steps)) * 100)

    def _runtime_seconds(self, execution) -> int:
        if not execution.started_at:
            return 0

        end = execution.completed_at or datetime.utcnow()
        return int((end - execution.started_at).total_seconds())

    # ==========================================================
    # PLAYBOOKS
    # ==========================================================

    def list_playbooks(
        self,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        return self.repo.list_playbooks(
            search=search,
            status=status_filter,
            category=category,
            skip=skip,
            limit=limit,
        )

    def get_playbook(self, playbook_id: str):
        playbook = self.repo.get_playbook(playbook_id)

        if not playbook:
            self._not_found("SOAR playbook not found.")

        return playbook

    def create_playbook(self, payload: PlaybookCreate):
        if not payload.name.strip():
            self._bad_request("Playbook name is required.")

        if payload.steps:
            orders = [step.step_order for step in payload.steps]

            if len(orders) != len(set(orders)):
                self._bad_request("Duplicate step_order values are not allowed.")

        return self.repo.create_playbook(payload)

    def update_playbook(self, playbook_id: str, payload: PlaybookUpdate):
        updated = self.repo.update_playbook(playbook_id, payload)

        if not updated:
            self._not_found("SOAR playbook not found.")

        return updated

    def delete_playbook(self, playbook_id: str):
        deleted = self.repo.delete_playbook(playbook_id)

        if not deleted:
            self._not_found("SOAR playbook not found.")

        return {
            "deleted": True,
            "playbook_id": playbook_id,
            "message": "SOAR playbook deleted successfully.",
        }

    def replace_playbook_steps(
        self,
        playbook_id: str,
        steps: List[PlaybookStepCreate],
    ):
        if not steps:
            self._bad_request("A playbook must contain at least one step.")

        orders = [step.step_order for step in steps]

        if len(orders) != len(set(orders)):
            self._bad_request("Duplicate step_order values are not allowed.")

        playbook = self.repo.replace_playbook_steps(playbook_id, steps)

        if not playbook:
            self._not_found("SOAR playbook not found.")

        return playbook

    # ==========================================================
    # EXECUTIONS
    # ==========================================================

    def list_executions(
        self,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        return self.repo.list_executions(
            search=search,
            status=status_filter,
            severity=severity,
            skip=skip,
            limit=limit,
        )

    def get_execution(self, execution_id: str):
        execution = self.repo.get_execution(execution_id)

        if not execution:
            self._not_found("SOAR execution not found.")

        return execution

    def create_execution(self, payload: ExecutionCreate):
        if not payload.execution_id:
            self._bad_request("execution_id is required.")

        return self.repo.create_execution(payload)

    def update_execution(self, execution_id: str, payload: ExecutionUpdate):
        execution = self.repo.update_execution(execution_id, payload)

        if not execution:
            self._not_found("SOAR execution not found.")

        return execution

    def start_playbook_execution(
        self,
        playbook_id: str,
        trigger_payload: Optional[Dict[str, Any]] = None,
        started_by: Optional[str] = None,
    ):
        playbook = self.repo.get_playbook(playbook_id)

        if not playbook:
            self._not_found("SOAR playbook not found.")

        if not playbook.is_active:
            self._bad_request("This playbook is disabled and cannot be executed.")

        sorted_steps = sorted(playbook.steps or [], key=lambda step: step.step_order)

        if not sorted_steps:
            self._bad_request("This playbook has no steps to execute.")

        execution_payload = ExecutionCreate(
            execution_id=self._generate_execution_id(),
            playbook_id=playbook.id,
            playbook_name=playbook.name,
            trigger_source=playbook.trigger_source or playbook.trigger_type,
            trigger_payload=trigger_payload or {},
            severity=playbook.severity or "Medium",
            status="Running",
            progress=0,
            runtime_seconds=0,
            started_by=started_by or "SOAR Engine",
            incident_id=None,
            error_message=None,
        )

        execution = self.repo.create_execution(execution_payload)

        for step in sorted_steps:
            step_payload = ExecutionStepCreate(
                step_order=step.step_order,
                step_type=step.step_type,
                name=step.name,
                status="Waiting",
                input_payload={
                    "action_key": step.action_key,
                    "connector_name": step.connector_name,
                    "config": step.config or {},
                    "condition": step.condition or {},
                    "playbook_step_id": step.id,
                },
                output_payload={
                    "message": f"Waiting to execute {step.name}.",
                },
                error_message=None,
                duration_ms=0,
                retry_count=0,
                logs=[
                    f"[{datetime.utcnow().isoformat()}] Step queued: {step.name}",
                ],
            )

            self.repo.add_execution_step(execution.id, step_payload)

        return self.repo.get_execution(execution.id)

    def simulate_execution_progress(self, execution_id: str):
        execution = self.repo.get_execution(execution_id)

        if not execution:
            self._not_found("SOAR execution not found.")

        if execution.status in ["Completed", "Failed", "Cancelled"]:
            return execution

        steps = self._sorted_execution_steps(execution)

        if not steps:
            self._bad_request("Execution has no steps.")

        running_step = next(
            (step for step in steps if step.status == "Running"),
            None,
        )

        now = datetime.utcnow().isoformat()

        if running_step:
            input_payload = running_step.input_payload or {}
            action_key = input_payload.get("action_key")
            connector_name = input_payload.get("connector_name")

            self.repo.update_execution_step_state(
                step_id=running_step.id,
                status="Completed",
                output_payload={
                    "message": f"{running_step.name} completed successfully.",
                    "action_key": action_key,
                    "connector_name": connector_name,
                    "simulated": True,
                    "completed_at": now,
                },
                logs_to_append=[
                    f"[{now}] Completed action: {action_key}",
                    f"[{now}] Connector response received from: {connector_name}",
                ],
                duration_ms=random.randint(600, 2200),
                mark_completed=True,
            )

            if connector_name:
                self.repo.mark_connector_used(connector_name)

        else:
            next_step = next(
                (
                    step
                    for step in steps
                    if step.status in ["Waiting", "Queued", "Pending"]
                ),
                None,
            )

            if next_step:
                input_payload = next_step.input_payload or {}
                action_key = input_payload.get("action_key")
                connector_name = input_payload.get("connector_name")

                self.repo.update_execution_step_state(
                    step_id=next_step.id,
                    status="Running",
                    output_payload={
                        "message": f"Executing {next_step.name}.",
                        "action_key": action_key,
                        "connector_name": connector_name,
                        "simulated": True,
                        "started_at": now,
                    },
                    logs_to_append=[
                        f"[{now}] Started step: {next_step.name}",
                        f"[{now}] Action: {action_key}",
                        f"[{now}] Connector: {connector_name}",
                    ],
                    mark_started=True,
                )

        refreshed_execution = self.repo.get_execution(execution.id)
        refreshed_steps = self._sorted_execution_steps(refreshed_execution)

        progress = self._calculate_progress(refreshed_steps)

        if progress >= 100:
            return self.repo.update_execution_progress(
                execution_id=refreshed_execution.id,
                progress=100,
                status="Completed",
                runtime_seconds=self._runtime_seconds(refreshed_execution),
                error_message="",
            )

        return self.repo.update_execution_progress(
            execution_id=refreshed_execution.id,
            progress=progress,
            status="Running",
            runtime_seconds=self._runtime_seconds(refreshed_execution),
            error_message="",
        )

    def simulate_execution_failure(self, execution_id: str):
        execution = self.repo.get_execution(execution_id)

        if not execution:
            self._not_found("SOAR execution not found.")

        if execution.status in ["Completed", "Cancelled"]:
            return execution

        steps = self._sorted_execution_steps(execution)

        if not steps:
            self._bad_request("Execution has no steps to fail.")

        running_step = next(
            (step for step in steps if step.status == "Running"),
            None,
        )

        target_step = running_step or next(
            (
                step
                for step in steps
                if step.status in ["Waiting", "Queued", "Pending"]
            ),
            None,
        )

        if not target_step:
            self._bad_request("No active or waiting step available to fail.")

        input_payload = target_step.input_payload or {}
        action_key = input_payload.get("action_key")
        connector_name = input_payload.get("connector_name")
        now = datetime.utcnow().isoformat()

        failure_reason = f"Simulated connector failure while executing {target_step.name}."

        self.repo.update_execution_step_state(
            step_id=target_step.id,
            status="Failed",
            output_payload={
                "message": failure_reason,
                "action_key": action_key,
                "connector_name": connector_name,
                "simulated": True,
                "failed_at": now,
            },
            error_message=failure_reason,
            logs_to_append=[
                f"[{now}] ERROR: {failure_reason}",
                f"[{now}] Connector: {connector_name}",
                f"[{now}] Action: {action_key}",
                f"[{now}] Retry is required before workflow can continue.",
            ],
            duration_ms=random.randint(700, 1800),
            mark_started=True,
            mark_completed=True,
        )

        refreshed_execution = self.repo.get_execution(execution.id)
        refreshed_steps = self._sorted_execution_steps(refreshed_execution)
        progress = self._calculate_progress(refreshed_steps)

        return self.repo.update_execution_progress(
            execution_id=refreshed_execution.id,
            progress=progress,
            status="Failed",
            runtime_seconds=self._runtime_seconds(refreshed_execution),
            error_message=failure_reason,
        )

    def retry_failed_step(self, execution_id: str, step_id: Optional[str] = None):
        execution = self.repo.get_execution(execution_id)

        if not execution:
            self._not_found("SOAR execution not found.")

        if execution.status in ["Completed", "Cancelled"]:
            self._bad_request("Cannot retry a completed or cancelled execution.")

        steps = self._sorted_execution_steps(execution)
        failed_steps = [step for step in steps if step.status == "Failed"]

        if not failed_steps:
            self._bad_request("No failed step found to retry.")

        if step_id:
            target_step = next((step for step in failed_steps if step.id == step_id), None)

            if not target_step:
                self._bad_request("Requested failed step was not found.")
        else:
            target_step = failed_steps[0]

        input_payload = target_step.input_payload or {}
        action_key = input_payload.get("action_key")
        connector_name = input_payload.get("connector_name")
        now = datetime.utcnow().isoformat()

        self.repo.update_execution_step_state(
            step_id=target_step.id,
            status="Running",
            output_payload={
                "message": f"Retry started for {target_step.name}.",
                "action_key": action_key,
                "connector_name": connector_name,
                "simulated": True,
                "retried_at": now,
            },
            error_message="",
            logs_to_append=[
                f"[{now}] Retry started for failed step.",
                f"[{now}] Connector: {connector_name}",
                f"[{now}] Action: {action_key}",
            ],
            duration_ms=0,
            mark_started=True,
            increment_retry=True,
        )

        refreshed_execution = self.repo.get_execution(execution.id)
        refreshed_steps = self._sorted_execution_steps(refreshed_execution)
        progress = self._calculate_progress(refreshed_steps)

        return self.repo.update_execution_progress(
            execution_id=refreshed_execution.id,
            progress=progress,
            status="Running",
            runtime_seconds=self._runtime_seconds(refreshed_execution),
            error_message="",
        )

    def add_execution_step(
        self,
        execution_id: str,
        payload: ExecutionStepCreate,
    ):
        step = self.repo.add_execution_step(execution_id, payload)

        if not step:
            self._not_found("SOAR execution not found.")

        return step

    # ==========================================================
    # CONNECTORS
    # ==========================================================

    def list_connectors(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        return self.repo.list_connectors(
            search=search,
            category=category,
            status=status_filter,
            skip=skip,
            limit=limit,
        )

    def get_connector(self, connector_id: str):
        connector = self.repo.get_connector(connector_id)

        if not connector:
            self._not_found("SOAR connector not found.")

        return connector

    def create_connector(self, payload: ConnectorCreate):
        if not payload.name.strip():
            self._bad_request("Connector name is required.")

        return self.repo.create_connector(payload)

    def update_connector(self, connector_id: str, payload: ConnectorUpdate):
        connector = self.repo.update_connector(connector_id, payload)

        if not connector:
            self._not_found("SOAR connector not found.")

        return connector

    def mark_connector_used(self, connector_id: str):
        connector = self.repo.mark_connector_used(connector_id)

        if not connector:
            self._not_found("SOAR connector not found.")

        return connector

    def seed_default_connectors(self):
        default_connectors = [
            ConnectorCreate(
                name="VirusTotal",
                category="Threat Intelligence",
                status="Connected",
                health="Healthy",
                description="Enrich IPs, domains, URLs, and file hashes using VirusTotal.",
                auth_type="API Key",
                actions_count=12,
                executions_count=0,
                capabilities=[
                    "Hash reputation lookup",
                    "URL scanning",
                    "Domain intelligence",
                    "IP reputation",
                ],
                risk_level="Low",
                is_enabled=True,
            ),
            ConnectorCreate(
                name="AbuseIPDB",
                category="Threat Intelligence",
                status="Connected",
                health="Healthy",
                description="Check IP reputation and abuse confidence score.",
                auth_type="API Key",
                actions_count=8,
                executions_count=0,
                capabilities=[
                    "IP abuse score",
                    "Reporter history",
                    "Geo details",
                    "Confidence scoring",
                ],
                risk_level="Low",
                is_enabled=True,
            ),
            ConnectorCreate(
                name="Microsoft Defender",
                category="Endpoint Security",
                status="Needs Setup",
                health="Not Configured",
                description="Automate endpoint isolation and malware investigation.",
                auth_type="OAuth / Tenant",
                actions_count=18,
                executions_count=0,
                capabilities=[
                    "Isolate endpoint",
                    "Collect investigation package",
                    "Run antivirus scan",
                    "Get device timeline",
                ],
                risk_level="Medium",
                is_enabled=False,
            ),
            ConnectorCreate(
                name="Webhook",
                category="Custom Automation",
                status="Connected",
                health="Healthy",
                description="Trigger external workflows through HTTP requests.",
                auth_type="Token / Header",
                actions_count=6,
                executions_count=0,
                capabilities=[
                    "POST request",
                    "Custom headers",
                    "Payload mapping",
                    "Response parsing",
                ],
                risk_level="Medium",
                is_enabled=True,
            ),
        ]

        created = []

        for connector_payload in default_connectors:
            existing = self.repo.get_connector(connector_payload.name)

            if existing:
                continue

            created.append(self.repo.create_connector(connector_payload))

        return {
            "created_count": len(created),
            "message": "Default SOAR connectors seeded successfully.",
            "connectors": created,
        }

    # ==========================================================
    # SETTINGS
    # ==========================================================

    def get_settings(self):
        return self.repo.get_settings()

    def update_settings(self, payload: SettingsUpdate):
        return self.repo.update_settings(payload)

    # ==========================================================
    # DASHBOARD / METRICS
    # ==========================================================

    def get_soar_overview(self):
        playbooks = self.repo.list_playbooks(limit=500)
        executions = self.repo.list_executions(limit=500)
        connectors = self.repo.list_connectors(limit=500)
        settings = self.repo.get_settings()

        total_playbooks = len(playbooks)
        active_playbooks = len([p for p in playbooks if p.is_active])

        total_executions = len(executions)
        running_executions = len([e for e in executions if e.status == "Running"])
        completed_executions = len([e for e in executions if e.status == "Completed"])
        failed_executions = len([e for e in executions if e.status == "Failed"])
        queued_executions = len([e for e in executions if e.status == "Queued"])

        connected_connectors = len(
            [c for c in connectors if c.status == "Connected" and c.is_enabled]
        )

        success_rate = 0

        if total_executions > 0:
            success_rate = round((completed_executions / total_executions) * 100, 2)

        return {
            "playbooks": {
                "total": total_playbooks,
                "active": active_playbooks,
            },
            "executions": {
                "total": total_executions,
                "running": running_executions,
                "completed": completed_executions,
                "failed": failed_executions,
                "queued": queued_executions,
                "success_rate": success_rate,
            },
            "connectors": {
                "total": len(connectors),
                "connected": connected_connectors,
            },
            "settings": {
                "workers_enabled": settings.workers_enabled,
                "max_parallel_executions": settings.max_parallel_executions,
                "ai_recommendations": settings.enable_ai_recommendations,
                "audit_logging": settings.enable_audit_logging,
            },
        }