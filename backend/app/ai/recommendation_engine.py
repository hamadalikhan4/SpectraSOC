RECOMMENDATIONS = {
    "SSH Brute Force": [
        "Block the source IP at firewall level.",
        "Enable multi-factor authentication.",
        "Disable direct root login.",
        "Review authentication logs for successful logins.",
    ],
    "SQL Injection": [
        "Use parameterized SQL queries.",
        "Enable web application firewall rules.",
        "Review application input validation.",
        "Patch vulnerable web components.",
    ],
    "Cross Site Scripting (XSS)": [
        "Sanitize and encode user input.",
        "Enable Content Security Policy headers.",
        "Review frontend input handling.",
        "Patch vulnerable web application code.",
    ],
}


def get_recommendations(attack_type: str | None) -> list[str]:
    if attack_type is None:
        return ["No malicious behavior detected. Continue monitoring."]

    return RECOMMENDATIONS.get(
        attack_type,
        ["Investigate the event manually and review related logs."],
    )

def get_ip_recommendations(
    risk_score: int,
    vt_data: dict,
    abuse_data: dict
) -> list[str]:
    recommendations = []

    if risk_score >= 80:
        recommendations.extend([
            "Immediately block this IP at firewall or WAF level.",
            "Create a critical incident for SOC investigation.",
            "Search SIEM logs for communication with this IP.",
            "Check authentication logs for failed or successful login attempts.",
            "Review affected systems for suspicious processes and persistence."
        ])

    elif risk_score >= 60:
        recommendations.extend([
            "Block or closely monitor this IP.",
            "Add this IP to the SOC watchlist.",
            "Review firewall, proxy, and authentication logs.",
            "Correlate this IOC with recent alerts."
        ])

    elif risk_score >= 40:
        recommendations.extend([
            "Monitor this IP for suspicious activity.",
            "Correlate with internal logs before blocking.",
            "Keep this IOC in threat intelligence history."
        ])

    else:
        recommendations.extend([
            "No immediate blocking required.",
            "Store this IOC for future correlation."
        ])

    if abuse_data.get("tor") is True:
        recommendations.append(
            "Tor traffic detected. Verify whether Tor communication is allowed in the organization."
        )

    if vt_data.get("malicious", 0) >= 10:
        recommendations.append(
            "High VirusTotal malicious count detected. Treat this IP as hostile."
        )

    return recommendations