"""
FastAPI Main Application

Security-first FastAPI application with comprehensive middleware,
authentication, and monitoring capabilities.

This module implements:
- OWASP security best practices
- JWT authentication and RBAC authorization
- Request/response logging and monitoring
- Rate limiting and CORS protection
- Database session management
- Error handling and validation
- API documentation with OpenAPI
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from app.auth.dependencies import AuthDependency
from app.config.settings import get_settings
from app.database.connection import DatabaseManager
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitingMiddleware
from app.middleware.security import SecurityMiddleware
from app.routes import auth, health, users
from app.utils.logger import get_logger

# Configure logger
logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan events for startup and shutdown.
    
    Handles database connections, background tasks, and resource cleanup.
    """
    logger.info("Starting FastAPI application...")
    
    try:
        # Initialize database
        await DatabaseManager.initialize()
        logger.info("Database initialized successfully")
        
        # Perform startup tasks
        await startup_tasks()
        logger.info("Startup tasks completed")
        
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        sys.exit(1)
    finally:
        # Cleanup resources
        await shutdown_tasks()
        logger.info("Application shutdown completed")


async def startup_tasks() -> None:
    """Execute application startup tasks."""
    # Run database migrations if needed
    # Initialize caching
    # Start background tasks
    pass


async def shutdown_tasks() -> None:
    """Execute application shutdown tasks."""
    # Close database connections
    await DatabaseManager.close_connections()
    # Stop background tasks
    # Cleanup resources
    pass


def create_application() -> FastAPI:
    """
    Create and configure FastAPI application with all middleware and routes.
    
    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Professional FastAPI template with security-first architecture",
        version="1.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )
    
    # Add middleware in correct order (last added = first executed)
    configure_middleware(app)
    
    # Include routers
    configure_routes(app)
    
    # Add exception handlers
    configure_exception_handlers(app)
    
    return app


def configure_middleware(app: FastAPI) -> None:
    """Configure application middleware stack."""
    
    # Session middleware (should be added first)
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY,
        max_age=settings.SESSION_EXPIRE_SECONDS,
        same_site="strict",
        https_only=settings.ENVIRONMENT == "production",
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        max_age=86400,  # 24 hours
    )
    
    # Custom middleware stack
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RateLimitingMiddleware)
    app.add_middleware(AuthMiddleware)
    app.add_middleware(SecurityMiddleware)


def configure_routes(app: FastAPI) -> None:
    """Configure application routes."""
    
    # Include API routers
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])


def configure_exception_handlers(app: FastAPI) -> None:
    """Configure global exception handlers."""
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle unexpected exceptions."""
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred",
                "request_id": getattr(request.state, "request_id", None),
            },
        )


# Create application instance
app = create_application()


@app.get("/", include_in_schema=False)
async def root() -> dict:
    """Root endpoint for basic health check."""
    return {
        "message": "FastAPI Professional Template",
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    # Run with uvicorn for development
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )