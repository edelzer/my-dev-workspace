"""Authentication dependencies for FastAPI routes."""

from typing import Optional
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.jwt_handler import JWTHandler

security = HTTPBearer()
jwt_handler = JWTHandler()


class AuthDependency:
    """Authentication dependency injection for FastAPI routes."""
    
    @staticmethod
    async def get_current_user(
        request: Request,
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> dict:
        """Get current authenticated user from JWT token."""
        if hasattr(request.state, "user"):
            return request.state.user
        
        # Fallback token validation
        payload = await jwt_handler.decode_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Mock user data - replace with actual user service
        return {
            "id": payload.get("sub"),
            "email": "user@example.com",
            "roles": ["user"],
            "is_active": True,
        }
    
    @staticmethod
    async def require_roles(required_roles: list):
        """Dependency factory for role-based access control."""
        async def check_roles(user: dict = Depends(AuthDependency.get_current_user)):
            user_roles = user.get("roles", [])
            if not any(role in user_roles for role in required_roles):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return user
        return check_roles