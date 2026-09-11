import ipaddress
import hashlib
import re
from urllib.parse import urlparse


EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


def detect_ioc_type(value: str):

    value = value.strip()

    # -------------------
    # IP Address
    # -------------------

    try:
        ipaddress.ip_address(value)
        return "ip"
    except ValueError:
        pass

    # -------------------
    # Email
    # -------------------

    if re.match(EMAIL_REGEX, value):
        return "email"

    # -------------------
    # URL
    # -------------------

    if value.startswith("http://") or value.startswith("https://"):
        return "url"

    # -------------------
    # Domain
    # -------------------

    if "." in value and " " not in value:
        parsed = urlparse(f"http://{value}")

        if parsed.hostname:
            return "domain"

    # -------------------
    # Hash
    # -------------------

    if len(value) in [32, 40, 64]:

        try:

            int(value, 16)

            if len(value) == 32:
                return "md5"

            if len(value) == 40:
                return "sha1"

            if len(value) == 64:
                return "sha256"

        except ValueError:
            pass

    return "unknown"