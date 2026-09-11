from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

from app.database.database import SessionLocal
from app.services.audit_log_service import log_action


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        response = await call_next(request)

        try:
            db = SessionLocal()

            user_id = None
            if hasattr(request.state, "user"):
                user_id = request.state.user.id

            log_action(
                db=db,
                user_id=user_id,
                action=f"{request.method} {request.url.path}",
                ip_address=request.client.host if request.client else None,
            )

            db.close()

        except Exception:
            pass  # never break API because of logging

        return response