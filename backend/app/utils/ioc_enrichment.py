from app.utils.ioc_parser import detect_ioc_type
from app.enrichers.loader import load_enrichers


ENRICHERS = load_enrichers()


def enrich_ioc(indicator: str):
    """
    Run all automatically discovered enrichment plugins.
    """

    ioc_type = detect_ioc_type(indicator)

    result = {
        "indicator": indicator,
        "type": ioc_type,
        "enrichments": []
    }

    for enricher in ENRICHERS:
        if enricher.supports(ioc_type):
            result["enrichments"].append(enricher.enrich(indicator))

    return result