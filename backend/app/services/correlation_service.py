from datetime import datetime
from sqlalchemy.orm import Session

from app.models.correlation_case import CorrelationCase
from app.repositories.correlation_repository import CorrelationRepository
from app.repositories.siem_repository import SIEMRepository


class CorrelationService:
    def __init__(self, db: Session):
        self.db = db
        self.case_repo = CorrelationRepository(db)
        self.siem_repo = SIEMRepository(db)

    def run_correlation(self):
        logs = self.siem_repo.list_logs(limit=200)

        grouped = {}

        for log in logs:
            if not log.source_ip:
                continue

            grouped.setdefault(log.source_ip, []).append(log)

        created_cases = []

        for source_ip, events in grouped.items():
            if len(events) < 2:
                continue

            attack_chain = self.build_attack_chain(events)
            risk_score = self.calculate_case_risk(events)

            if risk_score < 60:
                continue

            case_id = self.generate_case_id(source_ip)

            case = CorrelationCase(
                case_id=case_id,
                source_ip=source_ip,
                title=f"Correlated Attack Activity from {source_ip}",
                attack_chain=attack_chain,
                correlated_events=[self.format_event(e) for e in events],
                mitre_tactics=list(set([e.mitre_tactic for e in events if e.mitre_tactic])),
                risk_score=risk_score,
                severity=self.calculate_severity(risk_score),
                ai_summary=self.generate_ai_summary(source_ip, events, risk_score),
            )

            created_cases.append(self.case_repo.create_case(case))

        return created_cases

    def list_cases(self, limit: int = 50):
        return self.case_repo.list_cases(limit)

    def get_case(self, case_id: str):
        return self.case_repo.get_by_case_id(case_id)

    def build_attack_chain(self, events):
        chain = []

        for event in events:
            chain.append({
                "event_type": event.event_type,
                "mitre_technique": event.mitre_technique,
                "mitre_tactic": event.mitre_tactic,
                "risk_score": event.risk_score,
                "timestamp": str(event.created_at),
            })

        return chain

    def calculate_case_risk(self, events):
        base = max([e.risk_score for e in events], default=0)
        bonus = min(len(events) * 8, 30)

        zero_bonus = 0
        if any(e.zero_day_suspicion == "true" for e in events):
            zero_bonus = 15

        return min(base + bonus + zero_bonus, 100)

    def calculate_severity(self, score: int):
        if score >= 85:
            return "CRITICAL"
        if score >= 70:
            return "HIGH"
        if score >= 50:
            return "MEDIUM"
        return "LOW"

    def generate_case_id(self, source_ip: str):
        safe_ip = source_ip.replace(".", "-").replace(":", "-")
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"CORR-{safe_ip}-{timestamp}"

    def generate_ai_summary(self, source_ip, events, risk_score):
        event_types = list(set([e.event_type for e in events]))
        mitre = list(set([e.mitre_technique for e in events if e.mitre_technique]))

        return (
            f"SpectraSOC correlated {len(events)} events from {source_ip}. "
            f"The observed activity includes {', '.join(event_types)} and maps to "
            f"MITRE techniques {', '.join(mitre)}. The correlated risk score is "
            f"{risk_score}, indicating possible coordinated malicious activity."
        )

    def format_event(self, event):
        return {
            "id": event.id,
            "event_type": event.event_type,
            "source_ip": event.source_ip,
            "destination_ip": event.destination_ip,
            "username": event.username,
            "severity": event.severity,
            "risk_score": event.risk_score,
            "mitre_technique": event.mitre_technique,
            "mitre_tactic": event.mitre_tactic,
            "message": event.message,
            "created_at": str(event.created_at),
        }