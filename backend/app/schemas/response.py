from typing import Any

from pydantic import BaseModel


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Any | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Any | None = None