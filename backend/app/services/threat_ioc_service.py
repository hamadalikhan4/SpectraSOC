from sqlalchemy.orm import Session

from app.models.threat_ioc import ThreatIOC
from app.repositories.threat_ioc_repository import ThreatIOCRepository
from app.services.threat_enrichment_service import ThreatEnrichmentService


class ThreatIOCService:

    @staticmethod
    def list_iocs(db: Session):
        return ThreatIOCRepository.get_all(db)

    @staticmethod
    def search(db: Session, value: str):
        existing = ThreatIOCRepository.get_by_value(db, value)

        if existing:
            return existing

        enriched = ThreatEnrichmentService.enrich(value)

        ioc = ThreatIOC(
            ioc_type=enriched.get("ioc_type", "unknown"),
            ioc_value=value,
            country=enriched.get("country"),
            city=enriched.get("city"),
            provider=enriched.get("isp"),
            risk_score=enriched.get("risk_score", 0),
            severity=enriched.get("severity", "LOW"),
            confidence=50,
            source="geoip",
            ai_summary=f"SpectraSOC analyzed {value}. Initial enrichment completed using GeoIP intelligence.",
        )

        return ThreatIOCRepository.create(db, ioc)

    @staticmethod
    def create(db: Session, data):
        existing = ThreatIOCRepository.get_by_value(db, data.ioc_value)

        if existing:
            return existing

        enriched = ThreatEnrichmentService.enrich(data.ioc_value)

        ioc = ThreatIOC(
            ioc_type=enriched.get("ioc_type", data.ioc_type),
            ioc_value=data.ioc_value,
            source=data.source,
            notes=data.notes,
            country=enriched.get("country"),
            city=enriched.get("city"),
            provider=enriched.get("isp"),
            risk_score=enriched.get("risk_score", 0),
            severity=enriched.get("severity", "LOW"),
            confidence=50,
            ai_summary=f"SpectraSOC enriched {data.ioc_value} and stored it in the IOC database.",
        )

        return ThreatIOCRepository.create(db, ioc)

    @staticmethod
    def delete(db: Session, ioc_id: int):
        ioc = ThreatIOCRepository.get_by_id(db, ioc_id)

        if not ioc:
            return False

        ThreatIOCRepository.delete(db, ioc)
        return True