from sqlalchemy.orm import Session

from app.models.siem_log import SIEMLog
from app.schemas.siem import SIEMLogCreate
from app.repositories.siem_repository import SIEMRepository


class SIEMService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SIEMRepository(db)

    def ingest_log(self, data: SIEMLogCreate):
        risk_score = self.calculate_risk_score(data)
        mitre = self.map_mitre(data.event_type)
        zero_day = self.zero_day_score(data, risk_score)

        log = SIEMLog(
            timestamp=data.timestamp,
            source_type=data.source_type,
            source_name=data.source_name,
            source_ip=data.source_ip,
            destination_ip=data.destination_ip,
            username=data.username,
            event_type=data.event_type,
            severity=self.calculate_severity(risk_score),
            message=data.message,
            raw_log=data.raw_log,
            normalized_data=data.normalized_data,
            mitre_technique=mitre["technique"],
            mitre_tactic=mitre["tactic"],
            risk_score=risk_score,
            zero_day_score=zero_day,
            zero_day_suspicion="true" if zero_day >= 70 else "false",
        )

        return self.repo.create_log(log)

    def list_logs(self, limit: int = 100):
        return self.repo.list_logs(limit)

    def high_risk_logs(self, limit: int = 50):
        return self.repo.get_high_risk_logs(limit)

    def calculate_risk_score(self, data: SIEMLogCreate):
        score = 10

        event = data.event_type.lower()
        msg = data.message.lower()

        if "failed_login" in event or "failed password" in msg:
            score += 35

        if "brute" in msg:
            score += 35

        if "powershell" in msg or "encodedcommand" in msg:
            score += 50

        if "sql injection" in msg or "' or 1=1" in msg:
            score += 50

        if "honeypot" in data.source_type.lower():
            score += 25

        if data.source_ip:
            score += 10

        return min(score, 100)

    def calculate_severity(self, score: int):
        if score >= 80:
            return "CRITICAL"
        if score >= 60:
            return "HIGH"
        if score >= 40:
            return "MEDIUM"
        return "LOW"

    def map_mitre(self, event_type: str):
        event = event_type.lower()

        if "failed_login" in event or "brute" in event:
            return {
                "technique": "T1110",
                "tactic": "Credential Access",
            }

        if "powershell" in event:
            return {
                "technique": "T1059",
                "tactic": "Execution",
            }

        if "sql" in event:
            return {
                "technique": "T1190",
                "tactic": "Initial Access",
            }

        if "command" in event:
            return {
                "technique": "T1059",
                "tactic": "Execution",
            }

        return {
            "technique": "Unknown",
            "tactic": "Unknown",
        }

    def zero_day_score(self, data: SIEMLogCreate, risk_score: int):
        score = 0

        msg = data.message.lower()

        if data.source_ip:
            score += 15

        if data.normalized_data and data.normalized_data.get("unknown_ioc") is True:
            score += 30

        if "rare command" in msg:
            score += 25

        if "unknown" in msg:
            score += 20

        if "abnormal" in msg:
            score += 30

        if risk_score >= 70:
            score += 20

        return min(score, 100)