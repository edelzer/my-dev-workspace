"""
Logging Middleware

Comprehensive request/response logging with structured data for monitoring and analysis.
Implements security event logging and performance monitoring.
"""

import json
import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Request/Response logging middleware with structured data.
    
    Features:
    - Request/response logging with correlation IDs
    - Performance metrics tracking
    - Security event logging
    - Error tracking and alerting
    - Configurable log levels and filtering
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        # Paths to exclude from logging (reduce noise)
        self.excluded_paths = {
            "/health", "/metrics", "/favicon.ico"
        }
        
        # Sensitive headers to mask in logs
        self.sensitive_headers = {
            "authorization", "cookie", "x-api-key", "x-auth-token"
        }
        
        # Status codes that should trigger alerts
        self.alert_status_codes = {500, 502, 503, 504}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request/response with comprehensive metrics."""
        
        # Generate correlation ID for request tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Skip logging for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        start_time = time.time()
        
        # Log incoming request
        await self._log_request(request, request_id)
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Log response
            await self._log_response(request, response, request_id, processing_time)
            
            # Check for alert conditions
            await self._check_alert_conditions(request, response, processing_time)
            
            return response
            
        except Exception as e:
            # Log exception
            processing_time = time.time() - start_time
            await self._log_exception(request, e, request_id, processing_time)
            raise
    
    async def _log_request(self, request: Request, request_id: str) -> None:
        """Log incoming request details."""
        
        request_data = {
            "event_type": "request",
            "request_id": request_id,
            "timestamp": time.time(),
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": self._sanitize_headers(dict(request.headers)),
            "client_ip": self._get_client_ip(request),
            "user_agent": request.headers.get("user-agent", ""),
            "content_type": request.headers.get("content-type", ""),
            "content_length": request.headers.get("content-length", 0),
        }
        
        # Add user context if available
        if hasattr(request.state, "user") and request.state.user:
            request_data["user_id"] = request.state.user.get("id")
            request_data["user_roles"] = request.state.user.get("roles", [])
        
        logger.info("Incoming request", extra={"request_data": request_data})
    
    async def _log_response(
        self, request: Request, response: Response, request_id: str, processing_time: float
    ) -> None:
        """Log response details and metrics."""
        
        response_data = {
            "event_type": "response",
            "request_id": request_id,
            "timestamp": time.time(),
            "status_code": response.status_code,
            "processing_time": round(processing_time, 4),
            "response_headers": self._sanitize_headers(dict(response.headers)),
            "method": request.method,
            "path": request.url.path,
            "client_ip": self._get_client_ip(request),
        }
        
        # Add user context if available
        if hasattr(request.state, "user") and request.state.user:
            response_data["user_id"] = request.state.user.get("id")
        
        # Determine log level based on status code
        if response.status_code >= 500:
            logger.error("Response error", extra={"response_data": response_data})
        elif response.status_code >= 400:
            logger.warning("Response client error", extra={"response_data": response_data})
        else:
            logger.info("Response success", extra={"response_data": response_data})
        
        # Log performance metrics
        await self._log_performance_metrics(request, response, processing_time)
    
    async def _log_exception(
        self, request: Request, exception: Exception, request_id: str, processing_time: float
    ) -> None:
        """Log unhandled exceptions."""
        
        exception_data = {
            "event_type": "exception",
            "request_id": request_id,
            "timestamp": time.time(),
            "exception_type": type(exception).__name__,
            "exception_message": str(exception),
            "processing_time": round(processing_time, 4),
            "method": request.method,
            "path": request.url.path,
            "client_ip": self._get_client_ip(request),
        }
        
        # Add user context if available
        if hasattr(request.state, "user") and request.state.user:
            exception_data["user_id"] = request.state.user.get("id")
        
        logger.error("Unhandled exception", extra={"exception_data": exception_data}, exc_info=True)
    
    async def _log_performance_metrics(
        self, request: Request, response: Response, processing_time: float
    ) -> None:
        """Log performance metrics for monitoring."""
        
        metrics = {
            "event_type": "performance",
            "request_id": getattr(request.state, "request_id", "unknown"),
            "timestamp": time.time(),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "processing_time": round(processing_time, 4),
            "response_size": response.headers.get("content-length", 0),
        }
        
        # Add performance alerts for slow requests
        if processing_time > 5.0:  # 5 seconds threshold
            metrics["alert"] = "slow_request"
            logger.warning("Slow request detected", extra={"metrics": metrics})
        elif processing_time > 1.0:  # 1 second threshold
            logger.info("Performance metrics", extra={"metrics": metrics})
    
    async def _check_alert_conditions(
        self, request: Request, response: Response, processing_time: float
    ) -> None:
        """Check for conditions that should trigger alerts."""
        
        alerts = []
        
        # Status code alerts
        if response.status_code in self.alert_status_codes:
            alerts.append({
                "type": "error_status_code",
                "status_code": response.status_code,
                "path": request.url.path
            })
        
        # Performance alerts
        if processing_time > 10.0:
            alerts.append({
                "type": "very_slow_request",
                "processing_time": processing_time,
                "path": request.url.path
            })
        
        # Security alerts
        if response.status_code == 401:
            alerts.append({
                "type": "authentication_failure",
                "path": request.url.path,
                "ip": self._get_client_ip(request)
            })
        elif response.status_code == 403:
            alerts.append({
                "type": "authorization_failure", 
                "path": request.url.path,
                "ip": self._get_client_ip(request)
            })
        
        # Log alerts
        for alert in alerts:
            alert_data = {
                "event_type": "alert",
                "request_id": getattr(request.state, "request_id", "unknown"),
                "timestamp": time.time(),
                **alert
            }
            logger.error("Alert triggered", extra={"alert_data": alert_data})
    
    def _sanitize_headers(self, headers: dict) -> dict:
        """Remove or mask sensitive header values."""
        sanitized = {}
        
        for key, value in headers.items():
            key_lower = key.lower()
            if key_lower in self.sensitive_headers:
                sanitized[key] = "[MASKED]"
            elif key_lower == "authorization" and value.startswith("Bearer "):
                # Show only the first few characters of the token
                sanitized[key] = f"Bearer {value[7:13]}..."
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
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