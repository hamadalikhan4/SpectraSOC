def detect_xss(log: dict):

    message = log.get("raw_log", "").lower()

    patterns = [
        "<script>",
        "javascript:",
        "onerror=",
        "onload="
    ]

    if any(p in message for p in patterns):

        return {
            "detected": True,
            "attack_type": "Cross Site Scripting (XSS)",
            "severity": "High",
            "risk_score": 80,
            "confidence": 90,
            "rule": "xss_rule",
            "recommendations": [
                "Escape HTML output",
                "Use CSP headers",
                "Sanitize input"
            ]
        }

    return {"detected": False}