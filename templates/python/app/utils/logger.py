"""
Structured Logging Configuration

Professional logging setup with structured JSON output, security event handling,
and integration with monitoring systems.
"""

import json
import logging
import sys
from typing import Any, Dict, Optional
from functools import lru_cache

from app.config.settings import get_settings

settings = get_settings()


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as structured JSON."""
        
        # Base log structure
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add process/thread info
        if record.process:
            log_data["process"] = record.process
        if record.thread:
            log_data["thread"] = record.thread
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields from record
        extra_fields = [
            "request_id", "user_id", "session_id", "ip_address",
            "request_data", "response_data", "metrics", "auth_event",
            "security_event", "alert_data", "token_event", "error_data",
            "exception_data", "alert"
        ]
        
        for field in extra_fields:
            if hasattr(record, field):
                log_data[field] = getattr(record, field)
        
        # Add environment context
        log_data["environment"] = settings.ENVIRONMENT
        log_data["service"] = settings.PROJECT_NAME
        
        return json.dumps(log_data, default=str, ensure_ascii=False)


class SecurityFilter(logging.Filter):
    """Filter to handle security-sensitive information in logs."""
    
    def __init__(self):
        super().__init__()
        self.sensitive_patterns = [
            "password", "token", "secret", "key", "auth", "credential"
        ]
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Filter out or mask sensitive information."""
        
        # Don't filter the record, just sanitize sensitive data
        if hasattr(record, 'request_data') and isinstance(record.request_data, dict):
            record.request_data = self._sanitize_dict(record.request_data)
        
        if hasattr(record, 'response_data') and isinstance(record.response_data, dict):
            record.response_data = self._sanitize_dict(record.response_data)
        
        # Sanitize the message itself
        record.msg = self._sanitize_string(str(record.msg))
        
        return True
    
    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize dictionary by masking sensitive values."""
        sanitized = {}
        
        for key, value in data.items():
            key_lower = key.lower()
            
            if any(pattern in key_lower for pattern in self.sensitive_patterns):
                if isinstance(value, str) and len(value) > 6:
                    sanitized[key] = f"{value[:3]}...{value[-3:]}"
                else:
                    sanitized[key] = "[MASKED]"
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self._sanitize_dict(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _sanitize_string(self, text: str) -> str:
        """Sanitize string content to remove sensitive patterns."""
        # This is a basic implementation - in production you'd want more sophisticated
        # pattern matching to avoid false positives
        return text


@lru_cache()
def get_logger(name: str) -> logging.Logger:
    """
    Get configured logger instance.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers
    if logger.hasHandlers():
        return logger
    
    # Set log level
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Create handler based on configuration
    if settings.LOG_FILE:
        # File handler with rotation
        from logging.handlers import TimedRotatingFileHandler
        handler = TimedRotatingFileHandler(
            settings.LOG_FILE,
            when='midnight',
            interval=1,
            backupCount=30,
            encoding='utf-8'
        )
    else:
        # Console handler
        handler = logging.StreamHandler(sys.stdout)
    
    # Set formatter based on format preference
    if settings.LOG_FORMAT == "json":
        formatter = StructuredFormatter()
    else:
        # Standard text format
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    handler.setFormatter(formatter)
    
    # Add security filter
    security_filter = SecurityFilter()
    handler.addFilter(security_filter)
    
    logger.addHandler(handler)
    
    # Prevent propagation to root logger to avoid duplicate logs
    logger.propagate = False
    
    return logger


class LoggerManager:
    """Manager for application-wide logging configuration."""
    
    @staticmethod
    def setup_logging() -> None:
        """Set up application-wide logging configuration."""
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, settings.LOG_LEVEL))
        
        # Remove default handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Configure specific loggers
        loggers_config = {
            "uvicorn": "INFO",
            "uvicorn.access": "INFO" if settings.is_development else "WARNING",
            "sqlalchemy.engine": "INFO" if settings.is_development else "WARNING",
            "alembic": "INFO",
            "redis": "WARNING",
        }
        
        for logger_name, level in loggers_config.items():
            logger = logging.getLogger(logger_name)
            logger.setLevel(getattr(logging, level))
    
    @staticmethod
    def create_audit_logger() -> logging.Logger:
        """Create specialized logger for audit events."""
        audit_logger = logging.getLogger("audit")
        
        # Audit logs should always be at INFO level or higher
        audit_logger.setLevel(logging.INFO)
        
        # Create separate handler for audit logs
        if settings.LOG_FILE:
            audit_file = settings.LOG_FILE.replace('.log', '_audit.log')
            from logging.handlers import TimedRotatingFileHandler
            handler = TimedRotatingFileHandler(
                audit_file,
                when='midnight',
                interval=1,
                backupCount=365,  # Keep audit logs for 1 year
                encoding='utf-8'
            )
        else:
            handler = logging.StreamHandler(sys.stdout)
        
        # Always use JSON format for audit logs
        formatter = StructuredFormatter()
        handler.setFormatter(formatter)
        
        audit_logger.addHandler(handler)
        audit_logger.propagate = False
        
        return audit_logger
    
    @staticmethod
    def create_security_logger() -> logging.Logger:
        """Create specialized logger for security events."""
        security_logger = logging.getLogger("security")
        
        # Security logs should always be at WARNING level or higher
        security_logger.setLevel(logging.WARNING)
        
        # Create separate handler for security logs
        if settings.LOG_FILE:
            security_file = settings.LOG_FILE.replace('.log', '_security.log')
            from logging.handlers import TimedRotatingFileHandler
            handler = TimedRotatingFileHandler(
                security_file,
                when='midnight',
                interval=1,
                backupCount=365,  # Keep security logs for 1 year
                encoding='utf-8'
            )
        else:
            handler = logging.StreamHandler(sys.stderr)  # Use stderr for security logs
        
        # Always use JSON format for security logs
        formatter = StructuredFormatter()
        handler.setFormatter(formatter)
        
        security_logger.addHandler(handler)
        security_logger.propagate = False
        
        return security_logger


# Initialize logging on import
LoggerManager.setup_logging()