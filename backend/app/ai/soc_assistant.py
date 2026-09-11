class SocAssistant:

    def explain_ioc(
        self,
        indicator: str,
        risk_score: int,
        risk_level: str,
        mitre_mapping: list,
        recommendations: list
    ):

        if risk_level == "CRITICAL":

            summary = (
                f"{indicator} is considered highly malicious "
                "and should be treated as an active threat."
            )

            business_impact = (
                "Potential compromise, malware delivery, "
                "credential theft, or command and control activity."
            )

        elif risk_level == "HIGH":

            summary = (
                f"{indicator} shows multiple malicious indicators "
                "and requires immediate investigation."
            )

            business_impact = (
                "High risk of unauthorized access "
                "or malicious communications."
            )

        elif risk_level == "MEDIUM":

            summary = (
                f"{indicator} appears suspicious and "
                "should be monitored carefully."
            )

            business_impact = (
                "Possible security risk requiring further investigation."
            )

        else:

            summary = (
                f"{indicator} currently appears low risk."
            )

            business_impact = (
                "No immediate business impact identified."
            )

        return {

            "indicator": indicator,

            "risk_score": risk_score,

            "risk_level": risk_level,

            "threat_summary": summary,

            "business_impact": business_impact,

            "mitre_mapping": mitre_mapping,

            "recommendations": recommendations
        }