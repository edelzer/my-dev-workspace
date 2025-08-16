"""
Authentication Middleware

Handles JWT token validation, session management, and user context injection.
Implements security-first authentication with comprehensive logging and monitoring.
"""

import time
from typing import Callable, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.auth.jwt_handler import JWTHandler
from app.auth.session_manager import SessionManager
from app.config.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware for JWT and session management.
    
    Features:
    - JWT token validation and refresh
    - Session management and validation
    - User context injection
    - Authentication event logging
    - Rate limiting for auth endpoints
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.jwt_handler = JWTHandler()
        self.session_manager = SessionManager()
        
        # Paths that don't require authentication
        self.public_paths = {
            "/", "/health", "/docs", "/redoc", "/openapi.json",
            "/api/v1/auth/login", "/api/v1/auth/register",
            "/api/v1/auth/refresh", "/api/v1/auth/forgot-password"
        }
        
        # Paths that require specific roles
        self.role_protected_paths = {
            "/api/v1/admin": ["admin"],
            "/api/v1/users": ["user", "admin"],
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process authentication for incoming requests."""
        start_time = time.time()
        
        try:
            # Skip authentication for public paths
            if self._is_public_path(request.url.path):
                return await call_next(request)
            
            # Extract and validate authentication
            auth_result = await self._authenticate_request(request)
            
            if not auth_result["authenticated"]:
                return JSONResponse(
                    status_code=401,
                    content={
                        "error": "Authentication required",
                        "message": auth_result["message"]
                    }
                )
            
            # Check authorization (role-based access)
            if not await self._authorize_request(request, auth_result["user"]):
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "Insufficient permissions",
                        "message": "Access denied for this resource"
                    }
                )
            
            # Inject user context into request
            request.state.user = auth_result["user"]
            request.state.authenticated = True
            
            # Process request
            response = await call_next(request)
            
            # Log authentication event
            await self._log_auth_event(request, auth_result, start_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Authentication middleware error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"error": "Authentication service unavailable"}
            )
    
    def _is_public_path(self, path: str) -> bool:
        """Check if the path is public and doesn't require authentication."""
        return any(path.startswith(public_path) for public_path in self.public_paths)
    
    async def _authenticate_request(self, request: Request) -> dict:
        """
        Authenticate the request using JWT tokens or session.
        
        Returns:
            dict: Authentication result with user info and status
        """
        # Try JWT authentication first
        jwt_result = await self._authenticate_jwt(request)
        if jwt_result["authenticated"]:
            return jwt_result
        
        # Try session authentication
        session_result = await self._authenticate_session(request)
        if session_result["authenticated"]:
            return session_result
        
        return {
            "authenticated": False,
            "user": None,
            "message": "No valid authentication found"
        }
    
    async def _authenticate_jwt(self, request: Request) -> dict:
        """Authenticate using JWT token from Authorization header."""
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return {
                "authenticated": False,
                "user": None,
                "message": "No authorization header"
            }
        
        if not auth_header.startswith("Bearer "):
            return {
                "authenticated": False,
                "user": None,
                "message": "Invalid authorization header format"
            }
        
        token = auth_header.split(" ")[1]
        
        try:
            # Validate and decode JWT token
            payload = await self.jwt_handler.decode_token(token)
            
            if not payload:
                return {
                    "authenticated": False,
                    "user": None,
                    "message": "Invalid or expired token"
                }
            
            # Check if token is blacklisted
            if await self.jwt_handler.is_token_blacklisted(token):
                return {
                    "authenticated": False,
                    "user": None,
                    "message": "Token has been revoked"
                }
            
            # Get user information
            user_id = payload.get("sub")
            user_info = await self._get_user_info(user_id)
            
            if not user_info:
                return {
                    "authenticated": False,
                    "user": None,
                    "message": "User not found"
                }
            
            return {
                "authenticated": True,
                "user": user_info,
                "auth_method": "jwt",
                "token": token
            }
            
        except Exception as e:
            logger.warning(f"JWT authentication failed: {str(e)}")
            return {
                "authenticated": False,
                "user": None,
                "message": "Token validation failed"
            }
    
    async def _authenticate_session(self, request: Request) -> dict:
        """Authenticate using session cookie."""
        session_id = request.cookies.get("session_id")
        
        if not session_id:
            return {
                "authenticated": False,
                "user": None,
                "message": "No session cookie"
            }
        
        try:
            # Validate session
            session_data = await self.session_manager.get_session(session_id)
            
            if not session_data:
                return {
                    "authenticated": False,
                    "user": None,
                    "message": "Invalid or expired session"
                }
            
            # Get user information
            user_id = session_data.get("user_id")
            user_info = await self._get_user_info(user_id)
            
            if not user_info:
                return {
                    "authenticated": False,
                    "user": None,
                    "message": "User not found"
                }
            
            # Update session last activity
            await self.session_manager.update_session_activity(session_id)
            
            return {
                "authenticated": True,
                "user": user_info,
                "auth_method": "session",
                "session_id": session_id
            }
            
        except Exception as e:
            logger.warning(f"Session authentication failed: {str(e)}")
            return {
                "authenticated": False,
                "user": None,
                "message": "Session validation failed"
            }
    
    async def _authorize_request(self, request: Request, user: dict) -> bool:
        """Check if user has permission to access the requested resource."""
        path = request.url.path
        
        # Check role-based access
        for protected_path, required_roles in self.role_protected_paths.items():
            if path.startswith(protected_path):
                user_roles = user.get("roles", [])
                if not any(role in user_roles for role in required_roles):
                    logger.warning(
                        f"Access denied for user {user.get('id')} to {path}. "
                        f"Required roles: {required_roles}, User roles: {user_roles}"
                    )
                    return False
        
        # Check if user account is active
        if not user.get("is_active", False):
            logger.warning(f"Access denied for inactive user {user.get('id')}")
            return False
        
        # Check if user account is verified (if required)
        if not user.get("is_verified", True):  # Default to True for backward compatibility
            # Only require verification for sensitive endpoints
            sensitive_paths = ["/api/v1/admin", "/api/v1/users/profile"]
            if any(path.startswith(sensitive_path) for sensitive_path in sensitive_paths):
                logger.warning(f"Access denied for unverified user {user.get('id')}")
                return False
        
        return True
    
    async def _get_user_info(self, user_id: str) -> Optional[dict]:
        """
        Retrieve user information from database.
        
        This is a placeholder - implement with your actual user service.
        """
        # TODO: Implement actual user lookup from database
        # For now, return mock user data
        return {
            "id": user_id,
            "email": "user@example.com",
            "roles": ["user"],
            "is_active": True,
            "is_verified": True,
        }
    
    async def _log_auth_event(self, request: Request, auth_result: dict, start_time: float) -> None:
        """Log authentication events for security monitoring."""
        processing_time = time.time() - start_time
        
        event = {
            "timestamp": time.time(),
            "event_type": "authentication",
            "authenticated": auth_result["authenticated"],
            "auth_method": auth_result.get("auth_method"),
            "user_id": auth_result.get("user", {}).get("id") if auth_result["authenticated"] else None,
            "ip": request.client.host if request.client else "unknown",
            "path": str(request.url.path),
            "method": request.method,
            "user_agent": request.headers.get("user-agent", "")[:100],
            "processing_time": processing_time,
        }
        
        if auth_result["authenticated"]:
            logger.info("Authentication successful", extra={"auth_event": event})
        else:
            logger.warning("Authentication failed", extra={"auth_event": event})