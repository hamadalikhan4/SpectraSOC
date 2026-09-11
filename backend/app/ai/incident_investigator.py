class IncidentInvestigator:

    def explain_incident(self, incident):

        severity = incident.severity

        if severity == "CRITICAL":

            threat_summary = (
                "This incident is classified as CRITICAL. "
                "The IOC has a very high confidence malicious score."
            )

            containment = [

                "Immediately isolate affected hosts.",

                "Block IOC at firewall and EDR.",

                "Search SIEM for related activity.",

                "Perform endpoint malware scan."
            ]

            recovery = [

                "Remove malicious files.",

                "Reset compromised credentials.",

                "Patch vulnerable systems.",

                "Continue monitoring."
            ]

        elif severity == "HIGH":

            threat_summary = (
                "This incident requires immediate investigation."
            )

            containment = [

                "Block IOC.",

                "Investigate endpoint activity.",

                "Review authentication logs."
            ]

            recovery = [

                "Remove persistence mechanisms.",

                "Review accounts.",

                "Continue monitoring."
            ]

        else:

            threat_summary = (
                "This incident appears suspicious "
                "and requires analyst validation."
            )

            containment = [

                "Monitor activity.",

                "Investigate suspicious behavior."
            ]

            recovery = [

                "Continue monitoring."
            ]

        return {

            "incident_id": incident.incident_id,

            "severity": incident.severity,

            "status": incident.status,

            "threat_summary": threat_summary,

            "business_impact": incident.business_impact,

            "mitre_mapping": incident.mitre_mapping,

            "timeline_available": True,

            "containment": containment,

            "recovery": recovery,

            "recommendations": incident.recommendations
        }