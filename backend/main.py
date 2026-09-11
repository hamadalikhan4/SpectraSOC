from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import (
    app_exception_handler,
    global_exception_handler,
    AppException,
)

from app.middleware.request_logger import RequestLoggerMiddleware
from app.middleware.validation import ValidationMiddleware

# Routers
from app.api.v1.threat_intelligence import router as threat_router
from app.api.v1.logs import router as logs_router
from app.api.alert import router as alert_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as user_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.audit_logs import router as audit_router
from app.api.v1.detection import router as detection_router
from app.api.v1.ai import router as ai_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.reports import router as reports_router
from app.api.v1.siem import router as siem_router
from app.api.v1.correlation import router as correlation_router

from app.routers import threat_ioc
from app.routers import incident_management
from app.routers import soar


# ----------------------------
# APP INIT
# ----------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)


# ----------------------------
# CUSTOM MIDDLEWARE
# ----------------------------
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(ValidationMiddleware)


# ----------------------------
# CORS
# IMPORTANT:
# Add CORS AFTER custom middleware so it
# becomes the outer middleware layer.
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://hamadalikhan4.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# EXCEPTION HANDLERS
# ----------------------------
app.add_exception_handler(
    AppException,
    app_exception_handler,
)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)


# ----------------------------
# ROUTERS
# ----------------------------
app.include_router(
    threat_router,
    prefix="/api/v1",
)

app.include_router(alert_router)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    user_router,
    prefix="/api/v1",
)

app.include_router(
    dashboard_router,
    prefix="/api/v1",
)

app.include_router(
    audit_router,
    prefix="/api/v1",
)

app.include_router(
    detection_router,
    prefix="/api/v1",
)

app.include_router(
    logs_router,
    prefix="/api/v1",
)

app.include_router(ai_router)

app.include_router(incidents_router)

app.include_router(reports_router)

app.include_router(
    siem_router,
    prefix="/api/v1",
)

app.include_router(
    correlation_router,
    prefix="/api/v1",
)

app.include_router(threat_ioc.router)

app.include_router(incident_management.router)

app.include_router(soar.router)


# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/")
def home():
    return {
        "success": True,
        "message": "SpectraSOC Backend Running",
        "version": settings.VERSION,
    }