import uuid
from datetime import datetime

from app.scoring.threat_score import calculate_threat_score


class IncidentEngine:

    def create_incident(self, enrichment_result: dict):
        score = calculate_threat_score(enrichment_result)
        severity = score["severity"]

        incident = {
            "incident_id": str(uuid.uuid4()),
            "title": f"{severity} Threat Detected",
            "indicator": score["indicator"],
            "indicator_type": score["type"],
            "severity": severity,
            "risk_score": score["risk_score"],
            "status": "OPEN",
            "providers": score["providers"],
            "reasons": score["reasons"],
            "created_at": datetime.utcnow().isoformat(),
            "assigned_to": None,
            "source": "Threat Intelligence"
        }

        return incident

    def should_create_incident(self, enrichment_result: dict, threshold: int = 35) -> bool:
        score = calculate_threat_score(enrichment_result)
        return score["risk_score"] >= threshold

    def build_cache_payload(self, enrichment_result: dict) -> dict:
        score = calculate_threat_score(enrichment_result)

        return {
            "indicator": score["indicator"],
            "indicator_type": score["type"],
            "risk_score": score["risk_score"],
            "risk_level": score["severity"],
            "data": {
                "providers": score["providers"],
                "provider_scores": score.get("provider_scores", {}),
                "reasons": score["reasons"],
                "raw_enrichment": enrichment_result,
                "mitre_mapping": [],
                "recommendations": []
            }
        }