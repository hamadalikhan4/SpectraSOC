from sqlalchemy.orm import Session

from app.schemas.alert import AlertCreate
from app.schemas.log_event import DetectionResponse, LogEventCreate
from app.services.alert_service import create_alert


def analyze_log_event(db: Session, event: LogEventCreate) -> DetectionResponse:
    message = event.message.lower()

    if "failed password" in message or "failed login" in message:
        alert = AlertCreate(
            title="Failed Login Attempt Detected",
            description=event.message,
            severity="Medium",
            source_ip=event.source_ip,
            target_ip=event.target_ip,
        )
        create_alert(db, alert)

        return DetectionResponse(
            alert_created=True,
            title=alert.title,
            severity=alert.severity,
            reason="Failed login pattern matched",
        )

    if "brute force" in message or "multiple failed" in message:
        alert = AlertCreate(
            title="Possible Brute Force Attack",
            description=event.message,
            severity="Critical",
            source_ip=event.source_ip,
            target_ip=event.target_ip,
        )
        create_alert(db, alert)

        return DetectionResponse(
            alert_created=True,
            title=alert.title,
            severity=alert.severity,
            reason="Brute force pattern matched",
        )

    if "malware" in message or "trojan" in message or "ransomware" in message:
        alert = AlertCreate(
            title="Malware Activity Detected",
            description=event.message,
            severity="Critical",
            source_ip=event.source_ip,
            target_ip=event.target_ip,
        )
        create_alert(db, alert)

        return DetectionResponse(
            alert_created=True,
            title=alert.title,
            severity=alert.severity,
            reason="Malware keyword matched",
        )

    if "powershell" in message and ("encodedcommand" in message or "-enc" in message):
        alert = AlertCreate(
            title="Suspicious PowerShell Execution",
            description=event.message,
            severity="High",
            source_ip=event.source_ip,
            target_ip=event.target_ip,
        )
        create_alert(db, alert)

        return DetectionResponse(
            alert_created=True,
            title=alert.title,
            severity=alert.severity,
            reason="Suspicious PowerShell pattern matched",
        )

    return DetectionResponse(
        alert_created=False,
        reason="No threat pattern matched",
    )