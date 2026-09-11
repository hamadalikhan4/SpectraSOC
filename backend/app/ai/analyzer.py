from app.ai.mitre_mapper import map_to_mitre
from app.ai.recommendation_engine import get_recommendations
from app.ai.risk_engine import calculate_confidence, calculate_severity


def generate_soc_summary(
    attack_type: str | None,
    severity: str,
    risk_score: float,
    source_ip: str | None,
    target_ip: str | None,
) -> str:
    if attack_type is None:
        return "No suspicious security pattern was detected in this log event."

    return (
        f"{attack_type} activity was detected with {severity} severity. "
        f"The calculated risk score is {risk_score}. "
        f"Source IP: {source_ip or 'unknown'}, Target IP: {target_ip or 'unknown'}."
    )


def analyze_detection(
    attack_type: str | None,
    risk_score: float,
    matched_rule: str | None,
    source_ip: str | None = None,
    target_ip: str | None = None,
) -> dict:
    severity = calculate_severity(risk_score)
    confidence = calculate_confidence(risk_score, matched_rule)
    mitre = map_to_mitre(attack_type)
    recommendations = get_recommendations(attack_type)

    summary = generate_soc_summary(
        attack_type=attack_type,
        severity=severity,
        risk_score=risk_score,
        source_ip=source_ip,
        target_ip=target_ip,
    )

    return {
        "attack_type": attack_type,
        "severity": severity,
        "risk_score": risk_score,
        "confidence": confidence,
        "mitre": mitre,
        "recommendations": recommendations,
        "summary": summary,
    }