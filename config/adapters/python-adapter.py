"""
Python/FastAPI Configuration Adapter

Converts the unified configuration schema to Python/FastAPI compatible format
Supports Pydantic settings, environment variables, and type validation
"""

import json
import os
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseSettings, validator
import yaml


class PythonConfigAdapter:
    """Adapter for converting unified config to Python/FastAPI format."""
    
    def __init__(self, options: Optional[Dict[str, Any]] = None):
        self.options = options or {}
        self.env_prefix = self.options.get('env_prefix', 'APP_')
        self.env_file = self.options.get('env_file', '.env')
        self.validate_schema = self.options.get('validate_schema', True)
    
    def generate_config_class(self, unified_config: Dict[str, Any], environment: str = 'development') -> str:
        """Generate Pydantic Settings class from unified config."""
        
        class_content = self._generate_imports()
        class_content += self._generate_main_settings_class(unified_config, environment)
        class_content += self._generate_specialized_classes(unified_config)
        class_content += self._generate_factory_functions()
        
        return class_content
    
    def _generate_imports(self) -> str:
        """Generate import statements."""
        return '''"""
Application Configuration Settings

Auto-generated from unified configuration schema.
Supports environment-based configuration with validation and type safety.
"""

import os
import secrets
from functools import lru_cache
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseSettings, validator, Field, AnyHttpUrl


'''
    
    def _generate_main_settings_class(self, config: Dict[str, Any], environment: str) -> str:
        """Generate the main Settings class."""
        
        settings_class = '''class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
'''
        
        # Application settings
        app_config = config.get('application', {})
        settings_class += f'''    # Application settings
    PROJECT_NAME: str = "{app_config.get('name', 'My Application')}"
    VERSION: str = "{app_config.get('version', '1.0.0')}"
    ENVIRONMENT: str = "{environment}"
    DEBUG: bool = {str(app_config.get('debug', environment == 'development')).lower()}
    DESCRIPTION: str = "{app_config.get('description', '')}"
    
'''
        
        # Server settings
        server_config = config.get('server', {})
        settings_class += f'''    # Server settings
    HOST: str = "{server_config.get('host', '0.0.0.0')}"
    PORT: int = {server_config.get('port', 8000)}
    CONTEXT_PATH: str = "{server_config.get('contextPath', '')}"
    
'''
        
        # Database settings
        db_config = config.get('database', {})
        settings_class += f'''    # Database settings
    DATABASE_URL: str = "{db_config.get('url', 'postgresql://user:password@localhost/dbname')}"
    DATABASE_POOL_SIZE: int = {db_config.get('pool', {}).get('size', 20)}
    DATABASE_MAX_OVERFLOW: int = {db_config.get('pool', {}).get('maxIdle', 10)}
    DATABASE_POOL_TIMEOUT: int = {db_config.get('pool', {}).get('timeout', 30)}
    DATABASE_POOL_RECYCLE: int = {db_config.get('pool', {}).get('maxLifetime', 1800)}
    
'''
        
        # Cache/Redis settings
        cache_config = config.get('cache', {})
        if cache_config.get('type') == 'redis':
            settings_class += f'''    # Redis settings
    REDIS_HOST: str = "{cache_config.get('host', 'localhost')}"
    REDIS_PORT: int = {cache_config.get('port', 6379)}
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DATABASE: int = {cache_config.get('database', 0)}
    REDIS_TTL: int = {cache_config.get('ttl', 3600)}
    
'''
        
        # Security settings
        security_config = config.get('security', {})
        jwt_config = security_config.get('jwt', {})
        settings_class += f'''    # Security settings
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_SECRET: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "{jwt_config.get('algorithm', 'HS256')}"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = {jwt_config.get('accessTokenExpiry', 3600) // 60}
    REFRESH_TOKEN_EXPIRE_DAYS: int = {jwt_config.get('refreshTokenExpiry', 604800) // 86400}
    
'''
        
        # CORS settings
        cors_config = config.get('cors', {})
        allowed_origins = cors_config.get('allowedOrigins', ['http://localhost:3000'])
        settings_class += f'''    # CORS settings
    ALLOWED_HOSTS: List[str] = {self._format_list(allowed_origins)}
    ALLOWED_ORIGINS: List[Union[str, AnyHttpUrl]] = {self._format_list(allowed_origins)}
    ALLOWED_METHODS: List[str] = {self._format_list(cors_config.get('allowedMethods', ['GET', 'POST', 'PUT', 'DELETE']))}
    ALLOWED_HEADERS: List[str] = {self._format_list(cors_config.get('allowedHeaders', ['*']))}
    ALLOW_CREDENTIALS: bool = {str(cors_config.get('allowCredentials', True)).lower()}
    
'''
        
        # Rate limiting settings
        rate_config = config.get('rateLimiting', {})
        if rate_config.get('enabled'):
            global_config = rate_config.get('global', {})
            settings_class += f'''    # Rate limiting settings
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = {global_config.get('requests', 100)}
    RATE_LIMIT_PERIOD: int = {global_config.get('window', 60)}
    
'''
        
        # Logging settings
        log_config = config.get('logging', {})
        settings_class += f'''    # Logging settings
    LOG_LEVEL: str = "{log_config.get('level', 'INFO')}"
    LOG_FORMAT: str = "{log_config.get('format', 'json')}"
    LOG_FILE: Optional[str] = "{log_config.get('file', {}).get('path', 'logs/application.log')}" if {str(log_config.get('file', {}).get('enabled', True)).lower()} else None
    
'''
        
        # Monitoring settings
        monitoring_config = config.get('monitoring', {})
        settings_class += f'''    # Monitoring settings
    ENABLE_METRICS: bool = {str(monitoring_config.get('metrics', {}).get('enabled', True)).lower()}
    METRICS_PATH: str = "{monitoring_config.get('metrics', {}).get('endpoint', '/metrics')}"
    HEALTH_CHECK_PATH: str = "{monitoring_config.get('healthCheck', {}).get('endpoint', '/health')}"
    
'''
        
        # External services
        email_config = config.get('external', {}).get('email', {})
        if email_config.get('enabled'):
            smtp_config = email_config.get('smtp', {})
            settings_class += f'''    # Email settings
    EMAIL_ENABLED: bool = True
    EMAIL_FROM: str = "{email_config.get('from', 'noreply@example.com')}"
    SMTP_HOST: str = "{smtp_config.get('host', 'localhost')}"
    SMTP_PORT: int = {smtp_config.get('port', 587)}
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = {str(smtp_config.get('startTLS', True)).lower()}
    
'''
        
        # Feature flags
        features_config = config.get('features', {})
        if features_config:
            settings_class += f'''    # Feature flags
'''
            for feature, enabled in features_config.items():
                feature_name = feature.replace('_', ' ').title().replace(' ', '_').upper()
                settings_class += f'''    FEATURE_{feature_name}: bool = {str(enabled).lower()}
'''
        
        # Validation methods
        settings_class += '''
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
        if not any(v.startswith(scheme) for scheme in ["postgresql://", "sqlite://", "mysql://", "asyncpg://"]):
            raise ValueError("Database URL must use a supported scheme")
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
        env_prefix = ""


'''
        
        return settings_class
    
    def _generate_specialized_classes(self, config: Dict[str, Any]) -> str:
        """Generate specialized configuration classes."""
        
        specialized_classes = ''
        
        # Security settings class
        security_config = config.get('security', {})
        password_config = security_config.get('password', {})
        
        specialized_classes += f'''class SecuritySettings(BaseSettings):
    """Security-specific settings with enhanced validation."""
    
    # Password requirements
    MIN_PASSWORD_LENGTH: int = {password_config.get('minLength', 8)}
    REQUIRE_UPPERCASE: bool = {str(password_config.get('requireUppercase', True)).lower()}
    REQUIRE_LOWERCASE: bool = {str(password_config.get('requireLowercase', True)).lower()}
    REQUIRE_NUMBERS: bool = {str(password_config.get('requireNumbers', True)).lower()}
    REQUIRE_SPECIAL_CHARS: bool = {str(password_config.get('requireSpecialChars', True)).lower()}
    BCRYPT_ROUNDS: int = {password_config.get('hashRounds', 12)}
    
    # Session security
    SESSION_TIMEOUT: int = {security_config.get('session', {}).get('timeout', 1800)}
    MAX_CONCURRENT_SESSIONS: int = {security_config.get('session', {}).get('maxConcurrent', 1)}
    
    class Config:
        """Pydantic configuration."""
        env_prefix = "SECURITY_"
        env_file = ".env"


'''
        
        # Testing settings class
        testing_overrides = {
            'ENVIRONMENT': 'testing',
            'DATABASE_URL': 'sqlite:///./test.db',
            'DEBUG': True,
            'ACCESS_TOKEN_EXPIRE_MINUTES': 5,
            'BCRYPT_ROUNDS': 4
        }
        
        specialized_classes += '''class TestingSettings(Settings):
    """Settings override for testing environment."""
    
'''
        
        for key, value in testing_overrides.items():
            if isinstance(value, str):
                specialized_classes += f'''    {key}: str = "{value}"
'''
            else:
                specialized_classes += f'''    {key}: {type(value).__name__} = {value}
'''
        
        specialized_classes += '''

'''
        
        return specialized_classes
    
    def _generate_factory_functions(self) -> str:
        """Generate factory functions for configuration instances."""
        
        return '''@lru_cache()
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


# Environment-specific getters
def get_settings_for_environment(environment: str = None) -> Settings:
    """Get settings for specific environment."""
    if environment == "testing":
        return get_test_settings()
    return get_settings()
'''
    
    def generate_env_file(self, unified_config: Dict[str, Any], environment: str = 'development') -> str:
        """Generate .env file content."""
        
        env_lines = []
        
        # Application
        env_lines.extend([
            "# Application Configuration",
            f"ENVIRONMENT={environment}",
            f"DEBUG={'true' if environment == 'development' else 'false'}",
            ""
        ])
        
        # Database
        env_lines.extend([
            "# Database Configuration",
            f"DATABASE_URL={unified_config.get('database', {}).get('url', 'postgresql://user:password@localhost/dbname')}",
            ""
        ])
        
        # Security
        env_lines.extend([
            "# Security Configuration", 
            f"SECRET_KEY={self._generate_secret_key()}",
            f"JWT_SECRET={self._generate_secret_key()}",
            ""
        ])
        
        # Redis (if enabled)
        cache_config = unified_config.get('cache', {})
        if cache_config.get('type') == 'redis':
            env_lines.extend([
                "# Redis Configuration",
                f"REDIS_HOST={cache_config.get('host', 'localhost')}",
                f"REDIS_PORT={cache_config.get('port', 6379)}",
                "REDIS_PASSWORD=",
                f"REDIS_DATABASE={cache_config.get('database', 0)}",
                ""
            ])
        
        # Email (if enabled)
        email_config = unified_config.get('external', {}).get('email', {})
        if email_config.get('enabled'):
            env_lines.extend([
                "# Email Configuration",
                "SMTP_HOST=",
                "SMTP_PORT=587",
                "SMTP_USERNAME=",
                "SMTP_PASSWORD=",
                ""
            ])
        
        return "\n".join(env_lines)
    
    def generate_requirements_txt(self) -> str:
        """Generate requirements.txt with necessary dependencies."""
        
        requirements = [
            "# Core framework",
            "fastapi>=0.68.0",
            "uvicorn[standard]>=0.15.0",
            "pydantic[email]>=1.8.0",
            "",
            "# Database",
            "sqlalchemy>=1.4.0",
            "alembic>=1.7.0",
            "asyncpg>=0.24.0",  # For PostgreSQL
            "",
            "# Security",
            "python-jose[cryptography]>=3.3.0",
            "passlib[bcrypt]>=1.7.4",
            "python-multipart>=0.0.5",
            "",
            "# Environment and configuration",
            "python-dotenv>=0.19.0",
            "",
            "# HTTP and middleware",
            "httpx>=0.24.0",
            "python-cors>=1.0.0",
            "",
            "# Caching (optional)",
            "redis>=4.0.0",
            "aioredis>=2.0.0",
            "",
            "# Monitoring and logging",
            "prometheus-client>=0.11.0",
            "structlog>=21.1.0",
            "",
            "# Development dependencies",
            "pytest>=6.2.0",
            "pytest-asyncio>=0.15.0",
            "pytest-cov>=2.12.0",
            "black>=21.0.0",
            "isort>=5.9.0",
            "flake8>=3.9.0",
            "mypy>=0.910"
        ]
        
        return "\n".join(requirements)
    
    def _format_list(self, items: List[str]) -> str:
        """Format a list for Python code generation."""
        formatted_items = [f'"{item}"' for item in items]
        return f"[{', '.join(formatted_items)}]"
    
    def _generate_secret_key(self, length: int = 32) -> str:
        """Generate a secure secret key."""
        return secrets.token_urlsafe(length)


# Usage example
if __name__ == "__main__":
    adapter = PythonConfigAdapter()
    
    # Example unified config
    unified_config = {
        "application": {
            "name": "my-fastapi-app",
            "version": "1.0.0",
            "environment": "development"
        },
        "server": {
            "host": "0.0.0.0",
            "port": 8000
        },
        "database": {
            "url": "postgresql://user:pass@localhost:5432/myapp"
        }
    }
    
    # Generate Python settings class
    settings_code = adapter.generate_config_class(unified_config)
    print(settings_code)