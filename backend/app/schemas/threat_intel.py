from typing import Optional
from pydantic import BaseModel


class ThreatIntelRequest(BaseModel):
    indicator: Optional[str] = None
    indicator_type: str = "ip"

    # Backward compatibility with old request: {"ip": "..."}
    ip: Optional[str] = None