"""
Application Configuration Settings

Comprehensive configuration management using Pydantic Settings.
Supports environment-based configuration with validation and type safety.

Configuration categories:
- Database settings
- Security settings  
- Authentication settings
- Logging configuration
- Rate limiting settings
- CORS and middleware settings
"""

import secrets
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, BaseSettings, validator


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application settings
    PROJECT_NAME: str = "FastAPI Professional Template"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SESSION_EXPIRE_SECONDS: int = 3600
    ALGORITHM: str = "HS256"
    
    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 3600
    
    # Redis settings (for caching and sessions)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_DB: int = 1
    REDIS_CACHE_DB: int = 2
    
    # CORS settings
    ALLOWED_HOSTS: List[str] = ["*"]
    ALLOWED_ORIGINS: List[AnyHttpUrl] = []
    
    # Rate limiting settings
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    RATE_LIMIT_STORAGE_URL: str = "redis://localhost:6379/3"
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE: Optional[str] = None
    LOG_ROTATION: str = "1 day"
    LOG_RETENTION: str = "30 days"
    
    # Email settings (for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_PATH: str = "uploads"
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".pdf", ".txt"]
    
    # Security headers
    SECURITY_HEADERS: dict = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    }
    
    # Monitoring and observability
    ENABLE_METRICS: bool = True
    METRICS_PATH: str = "/metrics"
    HEALTH_CHECK_PATH: str = "/health"
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment value."""
        allowed = ["development", "testing", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of: {allowed}")
        return v
    
    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        """Validate log level."""
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"Log level must be one of: {allowed}")
        return v.upper()
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v):
        """Validate database URL format."""
        if not v.startswith(("postgresql://", "sqlite://", "mysql://")):
            raise ValueError("Database URL must use postgresql://, sqlite://, or mysql:// scheme")
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.ENVIRONMENT == "testing"
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


class SecuritySettings(BaseSettings):
    """Security-specific settings with enhanced validation."""
    
    # Password requirements
    MIN_PASSWORD_LENGTH: int = 8
    REQUIRE_UPPERCASE: bool = True
    REQUIRE_LOWERCASE: bool = True
    REQUIRE_NUMBERS: bool = True
    REQUIRE_SPECIAL_CHARS: bool = True
    
    # Account security
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_DURATION: int = 900  # 15 minutes
    PASSWORD_RESET_TOKEN_EXPIRE: int = 3600  # 1 hour
    
    # API security
    API_KEY_HEADER: str = "X-API-Key"
    API_KEY_LENGTH: int = 32
    REQUIRE_API_KEY: bool = False
    
    # Input validation
    MAX_REQUEST_SIZE: int = 1024 * 1024  # 1MB
    MAX_JSON_DEPTH: int = 10
    SANITIZE_INPUT: bool = True
    
    class Config:
        """Pydantic configuration."""
        env_prefix = "SECURITY_"
        env_file = ".env"


class TestingSettings(Settings):
    """Settings override for testing environment."""
    
    ENVIRONMENT: str = "testing"
    DATABASE_URL: str = "sqlite:///./test.db"
    SECRET_KEY: str = "test-secret-key-not-for-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 5
    REDIS_URL: str = "redis://localhost:6379/15"  # Use different DB for tests
    
    # Disable rate limiting in tests
    RATE_LIMIT_REQUESTS: int = 1000
    RATE_LIMIT_PERIOD: int = 1
    
    # Fast password hashing for tests
    BCRYPT_ROUNDS: int = 4


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Returns:
        Settings: Application configuration instance
    """
    return Settings()


@lru_cache()
def get_security_settings() -> SecuritySettings:
    """
    Get cached security settings.
    
    Returns:
        SecuritySettings: Security configuration instance
    """
    return SecuritySettings()


@lru_cache()
def get_test_settings() -> TestingSettings:
    """
    Get cached testing settings.
    
    Returns:
        TestingSettings: Testing configuration instance
    """
    return TestingSettings()