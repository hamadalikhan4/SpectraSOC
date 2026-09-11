from app.utils.ioc_enrichment import enrich_ioc
from app.scoring.threat_score import calculate_threat_score
from app.services.incident_engine import IncidentEngine


class ThreatAnalysisEngine:

    def __init__(self):
        self.incident_engine = IncidentEngine()

    def analyze(self, indicator: str):

        # Step 1: IOC Enrichment
        enrichment = enrich_ioc(indicator)

        # Step 2: Threat Scoring
        score = calculate_threat_score(enrichment)

        # Step 3: Incident Decision
        should_create = self.incident_engine.should_create_incident(enrichment)

        cache_payload = self.incident_engine.build_cache_payload(enrichment)

        return {
            "indicator": indicator,
            "enrichment": enrichment,
            "score": score,
            "should_create_incident": should_create,
            "cache_payload": cache_payload
        }