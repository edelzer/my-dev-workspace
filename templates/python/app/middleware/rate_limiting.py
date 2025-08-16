"""
Rate Limiting Middleware

Implements comprehensive rate limiting to protect against abuse and DDoS attacks.
Uses Redis for distributed rate limiting with multiple strategies.
"""

import asyncio
import time
from typing import Callable, Dict, Optional, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config.settings import get_settings, get_security_settings
from app.utils.logger import get_logger
from app.utils.redis_client import get_redis_client

logger = get_logger(__name__)
settings = get_settings()
security_settings = get_security_settings()


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """
    Advanced rate limiting middleware with multiple strategies.
    
    Features:
    - IP-based rate limiting
    - User-based rate limiting
    - Endpoint-specific limits
    - Sliding window algorithm
    - Burst protection
    - Progressive penalties
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.redis_client = None
        
        # Rate limiting rules (requests per time window)
        self.rate_limits = {
            # Global limits
            "global": {"requests": 1000, "window": 60},  # 1000 req/min per IP
            
            # Authentication endpoints
            "/api/v1/auth/login": {"requests": 5, "window": 60},  # 5 login attempts per minute
            "/api/v1/auth/register": {"requests": 3, "window": 300},  # 3 registrations per 5 min
            "/api/v1/auth/forgot-password": {"requests": 3, "window": 900},  # 3 per 15 min
            
            # API endpoints
            "/api/v1/users": {"requests": 100, "window": 60},
            "/api/v1/admin": {"requests": 50, "window": 60},
            
            # Public endpoints (more lenient)
            "/health": {"requests": 1000, "window": 60},
            "/docs": {"requests": 100, "window": 60},
        }
        
        # Burst protection (short-term limits)
        self.burst_limits = {
            "global": {"requests": 50, "window": 10},  # 50 req per 10 seconds
            "/api/v1/auth/login": {"requests": 3, "window": 30},  # 3 per 30 seconds
        }
        
        # Progressive penalty multipliers
        self.penalty_multipliers = [1, 2, 4, 8, 16]  # Exponential backoff
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply rate limiting to incoming requests."""
        
        try:
            # Initialize Redis client if not done
            if not self.redis_client:
                self.redis_client = await get_redis_client()
            
            # Check rate limits
            rate_limit_result = await self._check_rate_limits(request)
            
            if rate_limit_result["blocked"]:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": rate_limit_result["message"],
                        "retry_after": rate_limit_result["retry_after"]
                    },
                    headers={
                        "Retry-After": str(rate_limit_result["retry_after"]),
                        "X-RateLimit-Limit": str(rate_limit_result["limit"]),
                        "X-RateLimit-Remaining": str(rate_limit_result["remaining"]),
                        "X-RateLimit-Reset": str(rate_limit_result["reset_time"])
                    }
                )
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers to response
            self._add_rate_limit_headers(response, rate_limit_result)
            
            # Update rate limit counters
            await self._update_rate_limit_counters(request)
            
            return response
            
        except Exception as e:
            logger.error(f"Rate limiting middleware error: {str(e)}", exc_info=True)
            # Don't block requests if rate limiting fails
            return await call_next(request)
    
    async def _check_rate_limits(self, request: Request) -> Dict:
        """Check if request should be rate limited."""
        
        ip_address = self._get_client_ip(request)
        path = request.url.path
        user_id = getattr(request.state, "user_id", None)
        
        # Get applicable rate limits
        limits = self._get_applicable_limits(path)
        
        # Check each limit type
        for limit_name, limit_config in limits.items():
            # Check IP-based limits
            ip_result = await self._check_ip_rate_limit(
                ip_address, limit_name, limit_config
            )
            
            if ip_result["blocked"]:
                return ip_result
            
            # Check user-based limits (if authenticated)
            if user_id:
                user_result = await self._check_user_rate_limit(
                    user_id, limit_name, limit_config
                )
                
                if user_result["blocked"]:
                    return user_result
            
            # Check burst protection
            burst_result = await self._check_burst_protection(
                ip_address, path
            )
            
            if burst_result["blocked"]:
                return burst_result
        
        return {
            "blocked": False,
            "limit": limits.get("global", {}).get("requests", 0),
            "remaining": 100,  # Calculate actual remaining
            "reset_time": int(time.time() + 60),
            "retry_after": 0
        }
    
    def _get_applicable_limits(self, path: str) -> Dict:
        """Get rate limits applicable to the given path."""
        applicable_limits = {"global": self.rate_limits["global"]}
        
        # Find specific endpoint limits
        for limit_path, limit_config in self.rate_limits.items():
            if limit_path != "global" and path.startswith(limit_path):
                applicable_limits[limit_path] = limit_config
                break
        
        return applicable_limits
    
    async def _check_ip_rate_limit(
        self, ip_address: str, limit_name: str, limit_config: Dict
    ) -> Dict:
        """Check rate limit for IP address."""
        
        key = f"rate_limit:ip:{ip_address}:{limit_name}"
        window = limit_config["window"]
        max_requests = limit_config["requests"]
        
        current_time = int(time.time())
        window_start = current_time - window
        
        try:
            # Use sliding window algorithm with Redis
            pipe = self.redis_client.pipeline()
            
            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiration
            pipe.expire(key, window * 2)
            
            results = await pipe.execute()
            current_requests = results[1]
            
            # Check if limit exceeded
            if current_requests >= max_requests:
                # Check for progressive penalties
                penalty_key = f"rate_limit:penalty:{ip_address}"
                penalty_count = await self.redis_client.get(penalty_key) or 0
                penalty_count = int(penalty_count)
                
                # Apply progressive penalty
                penalty_multiplier = self.penalty_multipliers[
                    min(penalty_count, len(self.penalty_multipliers) - 1)
                ]
                
                retry_after = window * penalty_multiplier
                
                # Increment penalty counter
                await self.redis_client.setex(
                    penalty_key, retry_after, penalty_count + 1
                )
                
                return {
                    "blocked": True,
                    "message": f"IP rate limit exceeded for {limit_name}",
                    "limit": max_requests,
                    "remaining": 0,
                    "reset_time": current_time + window,
                    "retry_after": retry_after
                }
            
            return {
                "blocked": False,
                "limit": max_requests,
                "remaining": max_requests - current_requests,
                "reset_time": current_time + window,
                "retry_after": 0
            }
            
        except Exception as e:
            logger.error(f"Error checking IP rate limit: {str(e)}")
            return {"blocked": False, "limit": 0, "remaining": 0, "reset_time": 0, "retry_after": 0}
    
    async def _check_user_rate_limit(
        self, user_id: str, limit_name: str, limit_config: Dict
    ) -> Dict:
        """Check rate limit for authenticated user."""
        
        key = f"rate_limit:user:{user_id}:{limit_name}"
        window = limit_config["window"]
        max_requests = limit_config["requests"] * 2  # Users get higher limits
        
        current_time = int(time.time())
        window_start = current_time - window
        
        try:
            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, window * 2)
            
            results = await pipe.execute()
            current_requests = results[1]
            
            if current_requests >= max_requests:
                return {
                    "blocked": True,
                    "message": f"User rate limit exceeded for {limit_name}",
                    "limit": max_requests,
                    "remaining": 0,
                    "reset_time": current_time + window,
                    "retry_after": window
                }
            
            return {
                "blocked": False,
                "limit": max_requests,
                "remaining": max_requests - current_requests,
                "reset_time": current_time + window,
                "retry_after": 0
            }
            
        except Exception as e:
            logger.error(f"Error checking user rate limit: {str(e)}")
            return {"blocked": False, "limit": 0, "remaining": 0, "reset_time": 0, "retry_after": 0}
    
    async def _check_burst_protection(self, ip_address: str, path: str) -> Dict:
        """Check burst protection limits."""
        
        burst_limit = self.burst_limits.get(path) or self.burst_limits.get("global")
        if not burst_limit:
            return {"blocked": False}
        
        key = f"burst:ip:{ip_address}"
        window = burst_limit["window"]
        max_requests = burst_limit["requests"]
        
        current_time = int(time.time())
        window_start = current_time - window
        
        try:
            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, window * 2)
            
            results = await pipe.execute()
            current_requests = results[1]
            
            if current_requests >= max_requests:
                return {
                    "blocked": True,
                    "message": "Burst protection triggered",
                    "limit": max_requests,
                    "remaining": 0,
                    "reset_time": current_time + window,
                    "retry_after": window
                }
            
            return {"blocked": False}
            
        except Exception as e:
            logger.error(f"Error checking burst protection: {str(e)}")
            return {"blocked": False}
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        # Check forwarded headers
        forwarded_headers = [
            "X-Forwarded-For",
            "X-Real-IP",
            "CF-Connecting-IP",
        ]
        
        for header in forwarded_headers:
            if header in request.headers:
                ip = request.headers[header].split(",")[0].strip()
                return ip
        
        return request.client.host if request.client else "unknown"
    
    def _add_rate_limit_headers(self, response: Response, rate_limit_info: Dict) -> None:
        """Add rate limiting headers to response."""
        response.headers["X-RateLimit-Limit"] = str(rate_limit_info.get("limit", 0))
        response.headers["X-RateLimit-Remaining"] = str(rate_limit_info.get("remaining", 0))
        response.headers["X-RateLimit-Reset"] = str(rate_limit_info.get("reset_time", 0))
    
    async def _update_rate_limit_counters(self, request: Request) -> None:
        """Update rate limit counters after successful request."""
        # This is handled in the check methods above
        # Additional metrics can be recorded here
        pass