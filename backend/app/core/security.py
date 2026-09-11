from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _safe_password(password: str) -> str:
    return password.strip()[:72]


def hash_password(password: str) -> str:
    return password_context.hash(_safe_password(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(_safe_password(plain_password), hashed_password)


def create_token(
    subject: str,
    token_type: str,
    expires_minutes: int,
    extra_data: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)

    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }

    if extra_data:
        payload.update(extra_data)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str, extra_data: dict[str, Any] | None = None) -> str:
    return create_token(
        subject=subject,
        token_type="access",
        expires_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        extra_data=extra_data,
    )


def create_refresh_token(subject: str) -> str:
    return create_token(
        subject=subject,
        token_type="refresh",
        expires_minutes=60 * 24 * 7,
    )


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        return None