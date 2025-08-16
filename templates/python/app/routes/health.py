"""Health check endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database.connection import DatabaseManager
from app.utils.redis_client import RedisManager

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    version: str
    environment: str
    database: dict
    redis: dict


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check."""
    
    # Check database health
    db_health = await DatabaseManager.health_check()
    
    # Check Redis health
    redis_health = {"status": "unknown"}
    try:
        redis_client = await RedisManager.get_client()
        await redis_client.ping()
        redis_health = {"status": "healthy"}
    except Exception as e:
        redis_health = {"status": "unhealthy", "error": str(e)}
    
    return HealthResponse(
        status="healthy" if db_health["status"] == "healthy" and redis_health["status"] == "healthy" else "degraded",
        version="1.0.0",
        environment="development",
        database=db_health,
        redis=redis_health
    )


@router.get("/readiness")
async def readiness_check():
    """Kubernetes readiness probe."""
    return {"status": "ready"}


@router.get("/liveness")
async def liveness_check():
    """Kubernetes liveness probe."""
    return {"status": "alive"}