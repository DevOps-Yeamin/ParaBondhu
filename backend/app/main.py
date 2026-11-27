import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.seeder import seed_database
import backend.app.models.models

# Import API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.traffic import router as traffic_router
from backend.app.api.neighbor import router as neighbor_router
from backend.app.api.khunje import router as khunje_router
from backend.app.api.lineless import router as lineless_router
from backend.app.api.easyaccess import router as easyaccess_router
from backend.app.api.probashi import router as probashi_router
from backend.app.api.workhub import router as workhub_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.stats import router as stats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default demo data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ParaBondhu (পাড়াবন্ধু): Bangladesh-first Community & Opportunity Platform API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Flexible for local dev & containers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(traffic_router, prefix=api_v1)
app.include_router(neighbor_router, prefix=api_v1)
app.include_router(khunje_router, prefix=api_v1)
app.include_router(lineless_router, prefix=api_v1)
app.include_router(easyaccess_router, prefix=api_v1)
app.include_router(probashi_router, prefix=api_v1)
app.include_router(workhub_router, prefix=api_v1)
app.include_router(notifications_router, prefix=api_v1)
app.include_router(stats_router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "description": "Production-ready Bangladesh Community & Opportunity Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
        "modules": [
            "TrafficAlert",
            "NeighborShare",
            "KhunjeDao",
            "LineLess",
            "EasyAccess",
            "ProbashiConnect",
            "Skill & Work Hub"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
