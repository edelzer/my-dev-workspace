"""Authentication endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from app.auth.dependencies import AuthDependency
from app.auth.jwt_handler import JWTHandler
from app.auth.password_manager import PasswordManager

router = APIRouter()
jwt_handler = JWTHandler()
password_manager = PasswordManager()


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RegisterRequest(BaseModel):
    """Registration request model."""
    email: EmailStr
    password: str
    first_name: str
    last_name: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login endpoint."""
    
    # TODO: Implement actual user authentication
    # This is a simplified example
    
    if request.email == "admin@example.com" and request.password == "password123":
        user_data = {
            "id": "user-123",
            "email": request.email,
            "roles": ["admin"],
            "is_active": True
        }
        
        access_token = await jwt_handler.create_access_token(
            subject=user_data["id"],
            extra_data={"roles": user_data["roles"]}
        )
        
        refresh_token = await jwt_handler.create_refresh_token(
            subject=user_data["id"],
            extra_data={"roles": user_data["roles"]}
        )
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_data
        )
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/register")
async def register(request: RegisterRequest):
    """User registration endpoint."""
    
    # Validate password strength
    password_validation = password_manager.validate_password_strength(request.password)
    if not password_validation["valid"]:
        raise HTTPException(status_code=400, detail=password_validation["errors"])
    
    # TODO: Implement actual user registration
    return {"message": "Registration successful"}


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token."""
    
    result = await jwt_handler.refresh_access_token(refresh_token)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    return result


@router.post("/logout")
async def logout(user: dict = Depends(AuthDependency.get_current_user)):
    """User logout endpoint."""
    
    # TODO: Implement token blacklisting
    return {"message": "Logged out successfully"}