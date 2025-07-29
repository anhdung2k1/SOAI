import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from fastapi.staticfiles import StaticFiles

# Import nội bộ
from routers import router
from config.constants import *
from config.database import DeclarativeBase, engine
from config.service_registration import ServiceRegistration
from config.log_config import LoggingConfig, AppLogger
from metrics.otel_setup import setup_otel
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Model để SQLAlchemy detect và tạo bảng
import models.job_description
import models.cv_application
import models.interview_schedule
import models.interview_question

# === Logging setup ===
logger = AppLogger(__name__)
LoggingConfig.setup_logging(json_format=True)

# === Tạo bảng DB ===
DeclarativeBase.metadata.create_all(bind=engine)

# === Khởi tạo app ===
app = FastAPI(
    title="Recruitment ATS",
    version="1.0.0",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json"
)

# === Mount static folder (cho file ảnh minh chứng) ===
app.mount(f"{API_PREFIX}/static", StaticFiles(directory="cv_uploads"), name="static")

# === OpenTelemetry ===
setup_otel(app=app, service_name=SERVICE_NAME, engine=engine)

# === CORS setup ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Prometheus metrics ===
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# === Register routers ===
app.include_router(router, prefix=API_PREFIX, tags=["Recruitment"])

# === Health check ===
ServiceRegistration.register_service()

# === Ensure upload folder on startup ===
@app.on_event("startup")
def create_upload_root_folder():
    upload_path = "cv_uploads"
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
        logger.info(f"[Startup] Created upload folder: {upload_path}")
    else:
        logger.debug(f"[Startup] Upload folder already exists: {upload_path}")

# === Run app ===
if __name__ == "__main__":
    if TLS_ENABLED:
        logger.info(f"Starting Recruitment API over HTTPS on port {SERVICE_PORT}")
        if not CERT_PATH or not KEY_PATH:
            logger.error("TLS is enabled but CERT_PATH or KEY_PATH is not set.")
            raise RuntimeError("TLS configuration is incomplete.")
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=SERVICE_PORT,
            ssl_certfile=CERT_PATH,
            ssl_keyfile=KEY_PATH,
            reload=True
        )
    else:
        logger.info(f"Starting Recruitment API over HTTP on port {SERVICE_PORT}")
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=SERVICE_PORT,
            reload=True
        )