def detect_brute_force(log: dict):

    message = log.get("raw_log", "").lower()

    keywords = [
        "failed login",
        "invalid password",
        "authentication failure",
        "ssh login failed",
        "brute force"
    ]

    if any(keyword in message for keyword in keywords):

        return {
            "detected": True,
            "attack_type": "SSH Brute Force",
            "severity": "Critical",
            "risk_score": 90,
            "confidence": 95,
            "rule": "brute_force_rule",
            "recommendations": [
                "Block source IP",
                "Enable MFA",
                "Rate limit SSH",
                "Check auth logs"
            ]
        }

    return {"detected": False}