def calculate_severity(risk_score: float) -> str:
    if risk_score >= 85:
        return "Critical"
    if risk_score >= 65:
        return "High"
    if risk_score >= 40:
        return "Medium"
    if risk_score > 0:
        return "Low"
    return "Informational"


def calculate_confidence(risk_score: float, matched_rule: str | None) -> int:
    if matched_rule and risk_score >= 80:
        return 95
    if matched_rule and risk_score >= 60:
        return 85
    if matched_rule:
        return 70
    return 0