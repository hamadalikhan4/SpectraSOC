from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import (
    count_alerts_by_severity,
    count_alerts_by_status,
    count_total_alerts,
    get_recent_alerts,
    get_top_source_ips,
    get_top_target_ips,
)


def get_dashboard_summary(db: Session):
    severity_rows = count_alerts_by_severity(db)
    status_rows = count_alerts_by_status(db)

    severity_counts = {
        severity: count for severity, count in severity_rows
    }

    status_counts = {
        status: count for status, count in status_rows
    }

    return {
        "total_alerts": count_total_alerts(db),
        "severity_counts": severity_counts,
        "status_counts": status_counts,
        "critical_alerts": severity_counts.get("Critical", 0),
        "high_alerts": severity_counts.get("High", 0),
        "open_alerts": status_counts.get("Open", 0),
        "closed_alerts": status_counts.get("Closed", 0),
    }


def get_dashboard_threats(db: Session):
    return {
        "top_source_ips": [
            {"source_ip": ip, "count": count}
            for ip, count in get_top_source_ips(db)
        ],
        "top_target_ips": [
            {"target_ip": ip, "count": count}
            for ip, count in get_top_target_ips(db)
        ],
    }


def get_dashboard_recent_alerts(db: Session):
    return get_recent_alerts(db)