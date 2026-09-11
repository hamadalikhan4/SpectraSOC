from datetime import datetime

from app.detection.rule_engine import RuleEngine
from app.ai.analyzer import analyze_detection


class DetectionEngine:

    def __init__(self):
        self.rule_engine = RuleEngine()

    def analyze(self, log: dict):

        start_time = datetime.utcnow()

        result = self.rule_engine.match(log.get("raw_log", ""))

        if not result["detected"]:
            return {
                "attack_type": None,
                "severity": "Low",
                "risk_score": 0,
                "confidence": 0,
                "recommendations": ["No threat detected"],
                "processing_time_ms": 0
            }

        ai_result = analyze_detection(
            attack_type=result["attack_type"],
            risk_score=result["risk_score"],
            matched_rule=result["rule_name"],
            source_ip=log.get("source_ip"),
            target_ip=log.get("target_ip"),
        )

        ai_result["recommendations"] = result["recommendations"]

        end_time = datetime.utcnow()

        ai_result["processing_time_ms"] = round(
            (end_time - start_time).total_seconds() * 1000,
            2
        )

        return ai_result