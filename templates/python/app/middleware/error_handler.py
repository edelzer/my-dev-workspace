"""
Error Handler Middleware

Comprehensive error handling with structured error responses, logging, and monitoring.
Implements security-conscious error handling to prevent information disclosure.
"""

import traceback
from typing import Callable

from fastapi import Request, Response, HTTPException
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from pydantic import ValidationError

from app.config.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware with security-conscious error responses.
    
    Features:
    - Structured error responses
    - Security-conscious error information filtering
    - Error logging and monitoring
    - Different error handling for dev vs production
    - Error categorization and alerting
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        # Error categories for monitoring and alerting
        self.error_categories = {
            "validation": [RequestValidationError, ValidationError],
            "http": [HTTPException],
            "database": ["IntegrityError", "OperationalError", "DatabaseError"],
            "authentication": ["AuthenticationError", "PermissionError"],
            "external": ["ConnectionError", "TimeoutError", "HTTPError"],
            "system": [MemoryError, SystemError, OSError],
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Handle errors in request processing."""
        
        try:
            response = await call_next(request)
            return response
            
        except HTTPException as e:
            return await self._handle_http_exception(request, e)
            
        except RequestValidationError as e:
            return await self._handle_validation_error(request, e)
            
        except ValidationError as e:
            return await self._handle_pydantic_validation_error(request, e)
            
        except Exception as e:
            return await self._handle_unexpected_error(request, e)
    
    async def _handle_http_exception(self, request: Request, exc: HTTPException) -> JSONResponse:
        """Handle FastAPI HTTP exceptions."""
        
        error_data = {
            "error_type": "http_exception",
            "status_code": exc.status_code,
            "detail": exc.detail,
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": request.url.path,
            "method": request.method,
        }
        
        # Log based on severity
        if exc.status_code >= 500:
            logger.error("HTTP server error", extra={"error_data": error_data})
        elif exc.status_code >= 400:
            logger.warning("HTTP client error", extra={"error_data": error_data})
        
        # Prepare response
        response_data = {
            "error": "HTTP error",
            "message": exc.detail if settings.is_development else self._get_safe_error_message(exc.status_code),
            "status_code": exc.status_code,
            "request_id": error_data["request_id"],
        }
        
        # Add debug info in development
        if settings.is_development:
            response_data["debug"] = {
                "path": request.url.path,
                "method": request.method,
                "headers": exc.headers if hasattr(exc, "headers") else None,
            }
        
        return JSONResponse(
            status_code=exc.status_code,
            content=response_data,
            headers=getattr(exc, "headers", None),
        )
    
    async def _handle_validation_error(self, request: Request, exc: RequestValidationError) -> JSONResponse:
        """Handle FastAPI request validation errors."""
        
        error_data = {
            "error_type": "validation_error",
            "errors": exc.errors(),
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": request.url.path,
            "method": request.method,
        }
        
        logger.warning("Request validation error", extra={"error_data": error_data})
        
        # Format validation errors for client
        formatted_errors = []
        for error in exc.errors():
            formatted_errors.append({
                "field": " -> ".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
                "input": error.get("input") if settings.is_development else None,
            })
        
        response_data = {
            "error": "Validation error",
            "message": "The request contains invalid data",
            "validation_errors": formatted_errors,
            "request_id": error_data["request_id"],
        }
        
        if settings.is_development:
            response_data["debug"] = {
                "raw_errors": exc.errors(),
                "body": exc.body,
            }
        
        return JSONResponse(
            status_code=422,
            content=response_data,
        )
    
    async def _handle_pydantic_validation_error(self, request: Request, exc: ValidationError) -> JSONResponse:
        """Handle Pydantic model validation errors."""
        
        error_data = {
            "error_type": "pydantic_validation_error",
            "errors": exc.errors(),
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": request.url.path,
            "method": request.method,
        }
        
        logger.warning("Pydantic validation error", extra={"error_data": error_data})
        
        response_data = {
            "error": "Data validation error",
            "message": "The provided data is invalid",
            "validation_errors": exc.errors() if settings.is_development else "Invalid data format",
            "request_id": error_data["request_id"],
        }
        
        return JSONResponse(
            status_code=400,
            content=response_data,
        )
    
    async def _handle_unexpected_error(self, request: Request, exc: Exception) -> JSONResponse:
        """Handle unexpected system errors."""
        
        error_category = self._categorize_error(exc)
        
        error_data = {
            "error_type": "unexpected_error",
            "error_category": error_category,
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc() if settings.is_development else None,
        }
        
        # Add user context if available
        if hasattr(request.state, "user") and request.state.user:
            error_data["user_id"] = request.state.user.get("id")
        
        logger.error("Unexpected error", extra={"error_data": error_data}, exc_info=True)
        
        # Send alert for critical errors
        await self._send_error_alert(error_data)
        
        # Determine response based on error category and environment
        status_code = self._get_status_code_for_error(exc, error_category)
        
        response_data = {
            "error": "Internal server error",
            "message": self._get_safe_error_message(status_code),
            "request_id": error_data["request_id"],
        }
        
        # Add debug info in development
        if settings.is_development:
            response_data["debug"] = {
                "exception_type": type(exc).__name__,
                "exception_message": str(exc),
                "traceback": traceback.format_exc(),
                "error_category": error_category,
            }
        
        return JSONResponse(
            status_code=status_code,
            content=response_data,
        )
    
    def _categorize_error(self, exc: Exception) -> str:
        """Categorize error for monitoring and alerting."""
        
        exception_name = type(exc).__name__
        
        for category, exception_types in self.error_categories.items():
            for exc_type in exception_types:
                if isinstance(exc_type, str):
                    if exception_name == exc_type:
                        return category
                else:
                    if isinstance(exc, exc_type):
                        return category
        
        return "unknown"
    
    def _get_status_code_for_error(self, exc: Exception, category: str) -> int:
        """Determine appropriate HTTP status code for error."""
        
        status_code_map = {
            "validation": 400,
            "authentication": 401,
            "authorization": 403,
            "database": 500,
            "external": 502,
            "system": 503,
            "unknown": 500,
        }
        
        # Check for specific exceptions
        if "ConnectionError" in str(type(exc)):
            return 503
        elif "TimeoutError" in str(type(exc)):
            return 504
        elif "PermissionError" in str(type(exc)):
            return 403
        
        return status_code_map.get(category, 500)
    
    def _get_safe_error_message(self, status_code: int) -> str:
        """Get safe error message that doesn't leak system information."""
        
        safe_messages = {
            400: "The request was invalid",
            401: "Authentication is required",
            403: "Access is forbidden",
            404: "The requested resource was not found",
            405: "The request method is not allowed",
            422: "The request data is invalid",
            429: "Too many requests",
            500: "An internal server error occurred",
            502: "Bad gateway",
            503: "Service temporarily unavailable",
            504: "Gateway timeout",
        }
        
        return safe_messages.get(status_code, "An error occurred")
    
    async def _send_error_alert(self, error_data: dict) -> None:
        """Send alert for critical errors."""
        
        # Only send alerts for severe errors
        critical_categories = ["system", "database", "unknown"]
        critical_exceptions = ["MemoryError", "SystemError", "DatabaseError"]
        
        if (error_data["error_category"] in critical_categories or 
            error_data["exception_type"] in critical_exceptions):
            
            alert_data = {
                "alert_type": "critical_error",
                "timestamp": error_data.get("timestamp"),
                "error_category": error_data["error_category"],
                "exception_type": error_data["exception_type"],
                "path": error_data["path"],
                "request_id": error_data["request_id"],
                "environment": settings.ENVIRONMENT,
            }
            
            logger.critical("Critical error alert", extra={"alert_data": alert_data})
            
            # In production, this would integrate with alerting systems
            # like PagerDuty, Slack, or email notifications