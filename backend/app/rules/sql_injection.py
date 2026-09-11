def detect_sql_injection(log: dict):

    message = log.get("raw_log", "").lower()

    patterns = [
        "select * from",
        "' or '1'='1",
        "drop table",
        "union select",
        "--",
        " or 1=1"
    ]

    if any(p in message for p in patterns):

        return {
            "detected": True,
            "attack_type": "SQL Injection",
            "severity": "High",
            "risk_score": 85,
            "confidence": 92,
            "rule": "sql_injection_rule",
            "recommendations": [
                "Use parameterized queries",
                "Enable WAF",
                "Sanitize inputs"
            ]
        }

    return {"detected": False}