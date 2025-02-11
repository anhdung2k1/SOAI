from fastapi import FastAPI
from routers import router
from fastapi.middleware.cors import CORSMiddleware
from config.service_registration import ServiceRegistration
app = FastAPI(
    title="Endava Knowledge Base API",
    version="1.0.0",
    docs_url="/api/v1/knowledge-base/docs",  # New Swagger UI endpoint
    redoc_url="/api/v1/knowledge-base/redoc",
    openapi_url="/api/v1/knowledge-base/openapi.json"
)


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(router, prefix="/api/v1/knowledge-base", tags=["Knowledge Base"])
ServiceRegistration.register_service()


