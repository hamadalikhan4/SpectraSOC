import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logger import logger


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = round(time.time() - start_time, 4)

        logger.info(
            f"{request.client.host if request.client else 'unknown'} | "
            f"{request.method} {request.url.path} | "
            f"{response.status_code} | "
            f"{process_time}s"
        )

        return response