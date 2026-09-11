MITRE_MAP = {
    "SSH Brute Force": {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic": "Credential Access",
    },
    "SQL Injection": {
        "technique_id": "T1190",
        "technique_name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
    },
    "Cross Site Scripting (XSS)": {
        "technique_id": "T1059",
        "technique_name": "Command and Scripting Interpreter",
        "tactic": "Execution",
    },
}


def map_to_mitre(attack_type: str | None) -> dict:
    if attack_type is None:
        return {
            "technique_id": None,
            "technique_name": None,
            "tactic": None,
        }

    return MITRE_MAP.get(
        attack_type,
        {
            "technique_id": "Unknown",
            "technique_name": "Unknown",
            "tactic": "Unknown",
        },
    )

def map_ip_threat_to_mitre(vt_data: dict, abuse_data: dict) -> list[dict]:
    techniques = []

    if abuse_data.get("tor") is True:
        techniques.append({
            "technique_id": "T1090",
            "technique_name": "Proxy",
            "tactic": "Command and Control",
            "reason": "IP is identified as Tor exit traffic."
        })

    if vt_data.get("malicious", 0) >= 5:
        techniques.append({
            "technique_id": "T1071",
            "technique_name": "Application Layer Protocol",
            "tactic": "Command and Control",
            "reason": "Multiple security vendors flagged this IP as malicious."
        })

    if abuse_data.get("total_reports", 0) >= 20:
        techniques.append({
            "technique_id": "T1110",
            "technique_name": "Brute Force",
            "tactic": "Credential Access",
            "reason": "High abuse reports may indicate repeated malicious activity."
        })

    if not techniques:
        techniques.append({
            "technique_id": None,
            "technique_name": "No clear MITRE mapping",
            "tactic": None,
            "reason": "Threat intelligence data is not enough for confident mapping."
        })

    return techniques