from datetime import datetime
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.repositories.incident_repository import IncidentRepository
from app.repositories.threat_cache_repository import ThreatCacheRepository
from app.services.incident_event_service import IncidentEventService


class IncidentService:
    def __init__(self, db: Session):
        self.db = db
        self.incident_repo = IncidentRepository(db)
        self.threat_repo = ThreatCacheRepository(db)
        self.event_service = IncidentEventService()

    def create_from_ioc(self, indicator: str):
        cached = self.threat_repo.get_by_indicator(indicator)

        if not cached:
            raise ValueError(
                "IOC not found in threat intelligence history. Analyze it first."
            )

        data = cached.data or {}
        incident_id = self.generate_incident_id()

        incident = Incident(
            incident_id=incident_id,
            indicator=cached.indicator,
            indicator_type=cached.indicator_type,
            severity=cached.risk_level,
            status="OPEN",
            title=f"{cached.risk_level} Threat Detected: {cached.indicator}",
            summary=self.build_summary(
                cached.indicator,
                cached.risk_level,
                cached.risk_score,
            ),
            business_impact=self.build_business_impact(cached.risk_level),
            risk_score=cached.risk_score,
            mitre_mapping=data.get("mitre_mapping", []),
            recommendations=data.get("recommendations", []),
            evidence=data,
        )

        incident = self.incident_repo.create(incident)

        self.event_service.log_event(
            db=self.db,
            incident_id=incident.incident_id,
            event_type="INCIDENT_CREATED",
            description=f"Incident created from IOC {cached.indicator}",
            created_by="SpectraSOC",
        )

        self.event_service.log_event(
            db=self.db,
            incident_id=incident.incident_id,
            event_type="THREAT_CONTEXT_ATTACHED",
            description=(
                f"Threat intelligence evidence attached. "
                f"Risk level: {cached.risk_level}, "
                f"Risk score: {cached.risk_score}."
            ),
            created_by="SpectraSOC",
        )

        return incident

    def list_incidents(self, limit: int = 50):
        return self.incident_repo.list_all(limit)

    def get_incident(self, incident_id: str):
        incident = self.incident_repo.get_by_incident_id(incident_id)

        if not incident:
            raise ValueError("Incident not found")

        return incident

    def update_status(self, incident_id: str, status: str):
        incident = self.get_incident(incident_id)

        old_status = incident.status
        new_status = status.upper()

        incident = self.incident_repo.update_status(incident, new_status)

        self.event_service.log_event(
            db=self.db,
            incident_id=incident.incident_id,
            event_type="STATUS_UPDATED",
            description=f"Status changed from {old_status} to {new_status}",
            created_by="SOC Analyst",
        )

        return incident

    def generate_incident_id(self):
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"INC-{timestamp}"

    def build_summary(self, indicator: str, risk_level: str, risk_score: int):
        return (
            f"The indicator {indicator} has been classified as {risk_level} "
            f"with a risk score of {risk_score}. This incident was generated "
            "from SpectraSOC threat intelligence analysis."
        )

    def build_business_impact(self, risk_level: str):
        if risk_level == "CRITICAL":
            return (
                "Potential malware infection, credential compromise, "
                "or active command-and-control activity."
            )

        if risk_level == "HIGH":
            return (
                "Possible unauthorized access, malicious communication, "
                "or high-risk exposure."
            )

        if risk_level == "MEDIUM":
            return "Suspicious activity requiring analyst validation."

        return "Low immediate business impact, but should remain in monitoring history."