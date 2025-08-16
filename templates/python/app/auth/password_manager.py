"""Password management with secure hashing and validation."""

import bcrypt
from typing import Optional

from app.config.settings import get_security_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
security_settings = get_security_settings()


class PasswordManager:
    """Secure password hashing and validation."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            return False
    
    @staticmethod
    def validate_password_strength(password: str) -> dict:
        """Validate password meets security requirements."""
        errors = []
        
        if len(password) < security_settings.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {security_settings.MIN_PASSWORD_LENGTH} characters")
        
        if security_settings.REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if security_settings.REQUIRE_LOWERCASE and not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if security_settings.REQUIRE_NUMBERS and not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if security_settings.REQUIRE_SPECIAL_CHARS and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }