"""User management endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.dependencies import AuthDependency

router = APIRouter()


class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: str
    first_name: str
    last_name: str
    is_active: bool


@router.get("/me", response_model=UserResponse)
async def get_current_user(user: dict = Depends(AuthDependency.get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=user["id"],
        email=user["email"],
        first_name="John",
        last_name="Doe",
        is_active=user["is_active"]
    )


@router.get("/", response_model=List[UserResponse])
async def list_users(
    user: dict = Depends(AuthDependency.require_roles(["admin"]))
):
    """List all users (admin only)."""
    # TODO: Implement actual user listing
    return []


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user: dict = Depends(AuthDependency.get_current_user)
):
    """Get user by ID."""
    # TODO: Implement actual user retrieval
    if user_id != user["id"] and "admin" not in user.get("roles", []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return UserResponse(
        id=user_id,
        email="user@example.com",
        first_name="John",
        last_name="Doe",
        is_active=True
    )