"""Redis client configuration and utilities."""

import asyncio
from typing import Optional
from functools import lru_cache

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.config.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class RedisManager:
    """Redis connection manager with health monitoring."""
    
    _client: Optional[Redis] = None
    _initialized = False
    
    @classmethod
    async def initialize(cls) -> None:
        """Initialize Redis connection."""
        if cls._initialized:
            return
        
        try:
            cls._client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={},
            )
            
            # Test connection
            await cls._client.ping()
            cls._initialized = True
            logger.info("Redis initialized successfully")
            
        except Exception as e:
            logger.error(f"Redis initialization failed: {str(e)}")
            cls._client = None
            raise
    
    @classmethod
    async def get_client(cls) -> Redis:
        """Get Redis client."""
        if not cls._initialized:
            await cls.initialize()
        
        if not cls._client:
            raise RuntimeError("Redis client not initialized")
        
        return cls._client
    
    @classmethod
    async def close(cls) -> None:
        """Close Redis connection."""
        if cls._client:
            await cls._client.close()
            cls._initialized = False
            logger.info("Redis connection closed")


@lru_cache()
async def get_redis_client() -> Redis:
    """Get Redis client instance."""
    return await RedisManager.get_client()