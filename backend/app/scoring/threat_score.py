class ThreatScorer:

    def calculate_vt_score(self, vt: dict) -> int:
        if not vt or "error" in vt:
            return 0

        score = 0

        malicious = vt.get("malicious", 0)
        suspicious = vt.get("suspicious", 0)
        reputation = vt.get("reputation", 0)

        if malicious >= 20:
            score += 40
        elif malicious >= 10:
            score += 30
        elif malicious >= 5:
            score += 20
        elif malicious > 0:
            score += 10

        if suspicious > 5:
            score += 10

        if reputation < 0:
            score += 10

        return min(score, 50)

    def calculate_abuse_score(self, abuse: dict) -> int:
        if not abuse or "error" in abuse:
            return 0

        score = 0

        abuse_score = abuse.get("abuse_score", 0)
        total_reports = abuse.get("total_reports", 0)
        tor = abuse.get("tor", False)

        if abuse_score >= 90:
            score += 35
        elif abuse_score >= 70:
            score += 25
        elif abuse_score >= 50:
            score += 15
        elif abuse_score > 0:
            score += 10

        if total_reports >= 100:
            score += 15
        elif total_reports >= 50:
            score += 10
        elif total_reports >= 20:
            score += 5

        if tor:
            score += 15

        return min(score, 40)

    def calculate_geo_score(self, geo: dict) -> int:
        if not geo:
            return 0

        score = 0
        country = geo.get("country", "")

        risky_countries = ["Russia", "China", "North Korea"]

        if country in risky_countries:
            score += 10

        if country in ["Unknown", None, ""]:
            score += 3

        return min(score, 10)

    def get_severity(self, score: int) -> str:
        if score >= 85:
            return "CRITICAL"
        elif score >= 65:
            return "HIGH"
        elif score >= 35:
            return "MEDIUM"
        else:
            return "LOW"

    def calculate_final_score(self, vt: dict, abuse: dict, geo: dict):
        vt_score = self.calculate_vt_score(vt)
        abuse_score = self.calculate_abuse_score(abuse)
        geo_score = self.calculate_geo_score(geo)

        final = min(vt_score + abuse_score + geo_score, 100)

        return {
            "risk_score": final,
            "severity": self.get_severity(final),
            "vt_score": vt_score,
            "abuse_score": abuse_score,
            "geo_score": geo_score
        }


def calculate_threat_score(enrichment_result: dict) -> dict:
    scorer = ThreatScorer()

    vt_data = {}
    geo_data = {}
    abuse_data = {}
    providers = []
    reasons = []

    for item in enrichment_result.get("enrichments", []):
        provider = item.get("provider")
        status = item.get("status")

        if provider:
            providers.append(provider)

        if status != "success":
            reasons.append(f"{provider} enrichment failed")
            continue

        data = item.get("data", {})

        if provider == "VirusTotal":
            vt_data = data

            if data.get("malicious", 0) > 0:
                reasons.append(f"VirusTotal malicious detections: {data.get('malicious')}")

            if data.get("suspicious", 0) > 0:
                reasons.append(f"VirusTotal suspicious detections: {data.get('suspicious')}")

            if data.get("malicious", 0) == 0 and data.get("suspicious", 0) == 0:
                reasons.append("VirusTotal shows no malicious detections")

        elif provider == "GeoIP":
            geo_data = data

            if data.get("country") in ["Unknown", None, ""]:
                reasons.append("GeoIP location unknown")

        elif provider == "AbuseIPDB":
            abuse_data = data

            if data.get("abuse_score", 0) > 0:
                reasons.append(f"AbuseIPDB confidence score: {data.get('abuse_score')}")

            if data.get("total_reports", 0) > 0:
                reasons.append(f"AbuseIPDB total reports: {data.get('total_reports')}")

            if data.get("tor", False):
                reasons.append("AbuseIPDB indicates TOR exit node")

    score = scorer.calculate_final_score(vt_data, abuse_data, geo_data)

    return {
        "indicator": enrichment_result.get("indicator"),
        "type": enrichment_result.get("type"),
        "risk_score": score["risk_score"],
        "severity": score["severity"],
        "provider_scores": {
            "VirusTotal": score["vt_score"],
            "AbuseIPDB": score["abuse_score"],
            "GeoIP": score["geo_score"]
        },
        "providers": list(set(providers)),
        "reasons": reasons
    }