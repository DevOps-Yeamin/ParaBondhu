import json
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "ParaBondhu (পাড়াবন্ধু)"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "parabondhu-super-secure-production-secret-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # Database: SQLite fallback for instant zero-dependency run, PostgreSQL for full PostGIS
    DATABASE_URL: str = "sqlite:///./parabondhu.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    # Default Geo Location (Dhaka, Bangladesh)
    DEFAULT_LATITUDE: float = 23.8103
    DEFAULT_LONGITUDE: float = 90.4125

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
