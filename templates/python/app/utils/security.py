"""Security utilities and helper functions."""

import re
import hashlib
import secrets
from typing import Optional


class SecurityUtils:
    """Security utility functions for validation and sanitization."""
    
    @staticmethod
    def matches_pattern(pattern: str, text: str) -> bool:
        """Check if text matches a security pattern."""
        try:
            return bool(re.search(pattern, text, re.IGNORECASE))
        except re.error:
            return False
    
    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generate secure random token."""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_string(text: str, salt: Optional[str] = None) -> str:
        """Hash string with optional salt."""
        if salt:
            text = text + salt
        return hashlib.sha256(text.encode()).hexdigest()
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitize user input."""
        # Basic sanitization - expand as needed
        return text.strip()[:1000]  # Limit length and trim