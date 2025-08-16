"""
Database Connection Management

Async SQLAlchemy setup with connection pooling, health checks, and monitoring.
Implements security-first database practices with audit logging.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import OperationalError, DisconnectionError

from app.config.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class DatabaseManager:
    """
    Async database connection manager with health monitoring.
    
    Features:
    - Async SQLAlchemy with connection pooling
    - Health checks and automatic reconnection
    - Query logging and performance monitoring
    - Connection lifecycle management
    - Security audit logging
    """
    
    _engine = None
    _session_factory = None
    _initialized = False
    
    @classmethod
    async def initialize(cls) -> None:
        """Initialize database engine and session factory."""
        if cls._initialized:
            return
        
        try:
            # Create async engine with proper configuration
            cls._engine = create_async_engine(
                cls._get_database_url(),
                echo=settings.is_development,  # Log SQL in development
                pool_size=settings.DATABASE_POOL_SIZE,
                max_overflow=settings.DATABASE_MAX_OVERFLOW,
                pool_timeout=settings.DATABASE_POOL_TIMEOUT,
                pool_recycle=settings.DATABASE_POOL_RECYCLE,
                pool_pre_ping=True,  # Validate connections before use
                poolclass=StaticPool if "sqlite" in settings.DATABASE_URL else None,
                connect_args=cls._get_connect_args(),
            )
            
            # Create session factory
            cls._session_factory = async_sessionmaker(
                cls._engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=True,
                autocommit=False,
            )
            
            # Set up event listeners
            cls._setup_event_listeners()
            
            # Test connection
            await cls._test_connection()
            
            cls._initialized = True
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise
    
    @classmethod
    def _get_database_url(cls) -> str:
        """Get database URL with proper async driver."""
        url = settings.DATABASE_URL
        
        # Convert sync PostgreSQL URL to async
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("mysql://"):
            url = url.replace("mysql://", "mysql+aiomysql://", 1)
        elif url.startswith("sqlite:///"):
            url = url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        
        return url
    
    @classmethod
    def _get_connect_args(cls) -> dict:
        """Get database-specific connection arguments."""
        connect_args = {}
        
        if "sqlite" in settings.DATABASE_URL:
            connect_args["check_same_thread"] = False
        elif "postgresql" in settings.DATABASE_URL:
            connect_args["server_settings"] = {
                "application_name": settings.PROJECT_NAME,
                "jit": "off",  # Disable JIT for better compatibility
            }
        
        return connect_args
    
    @classmethod
    def _setup_event_listeners(cls) -> None:
        """Set up SQLAlchemy event listeners for monitoring."""
        
        @event.listens_for(cls._engine.sync_engine, "connect")
        def on_connect(dbapi_connection, connection_record):
            """Log database connections."""
            logger.info("Database connection established")
        
        @event.listens_for(cls._engine.sync_engine, "checkout")
        def on_checkout(dbapi_connection, connection_record, connection_proxy):
            """Log connection checkout from pool."""
            logger.debug("Database connection checked out from pool")
        
        @event.listens_for(cls._engine.sync_engine, "checkin")
        def on_checkin(dbapi_connection, connection_record):
            """Log connection checkin to pool."""
            logger.debug("Database connection checked in to pool")
        
        @event.listens_for(cls._engine.sync_engine, "invalidate")
        def on_invalidate(dbapi_connection, connection_record, exception):
            """Log connection invalidation."""
            logger.warning(f"Database connection invalidated: {exception}")
    
    @classmethod
    async def _test_connection(cls) -> None:
        """Test database connection."""
        try:
            async with cls._engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            raise
    
    @classmethod
    async def get_session(cls) -> AsyncSession:
        """Get database session."""
        if not cls._initialized:
            await cls.initialize()
        
        return cls._session_factory()
    
    @classmethod
    async def close_connections(cls) -> None:
        """Close all database connections."""
        if cls._engine:
            await cls._engine.dispose()
            logger.info("Database connections closed")
    
    @classmethod
    async def health_check(cls) -> dict:
        """Perform database health check."""
        health_data = {
            "status": "unknown",
            "response_time_ms": None,
            "pool_status": None,
            "error": None,
        }
        
        try:
            import time
            start_time = time.time()
            
            async with cls.get_session() as session:
                await session.execute(text("SELECT 1"))
                await session.commit()
            
            response_time = (time.time() - start_time) * 1000
            health_data.update({
                "status": "healthy",
                "response_time_ms": round(response_time, 2),
                "pool_status": cls._get_pool_status(),
            })
            
        except Exception as e:
            health_data.update({
                "status": "unhealthy",
                "error": str(e),
            })
            logger.error(f"Database health check failed: {str(e)}")
        
        return health_data
    
    @classmethod
    def _get_pool_status(cls) -> dict:
        """Get connection pool status."""
        if not cls._engine:
            return {"error": "Engine not initialized"}
        
        pool = cls._engine.pool
        return {
            "size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid(),
        }


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session context manager.
    
    Yields:
        AsyncSession: Database session with automatic commit/rollback
    """
    session = await DatabaseManager.get_session()
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        await session.close()


class DatabaseHealthMonitor:
    """Monitor database health and performance."""
    
    def __init__(self):
        self.alert_thresholds = {
            "response_time_ms": 1000,  # 1 second
            "pool_utilization": 0.8,   # 80%
        }
    
    async def monitor_health(self) -> dict:
        """Monitor database health and trigger alerts if needed."""
        health_data = await DatabaseManager.health_check()
        
        # Check for alert conditions
        alerts = []
        
        if health_data["status"] == "unhealthy":
            alerts.append({
                "type": "database_unhealthy",
                "message": health_data.get("error", "Unknown error"),
            })
        
        if health_data.get("response_time_ms", 0) > self.alert_thresholds["response_time_ms"]:
            alerts.append({
                "type": "slow_database_response",
                "response_time": health_data["response_time_ms"],
            })
        
        pool_status = health_data.get("pool_status", {})
        if isinstance(pool_status, dict):
            pool_size = pool_status.get("size", 1)
            checked_out = pool_status.get("checked_out", 0)
            if pool_size > 0 and (checked_out / pool_size) > self.alert_thresholds["pool_utilization"]:
                alerts.append({
                    "type": "high_pool_utilization",
                    "utilization": checked_out / pool_size,
                })
        
        # Log alerts
        for alert in alerts:
            logger.warning(f"Database alert: {alert['type']}", extra={"alert": alert})
        
        return {
            **health_data,
            "alerts": alerts,
        }