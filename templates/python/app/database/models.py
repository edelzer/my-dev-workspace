"""
Database Models

SQLAlchemy models with comprehensive auditing and security features.
Implements base model with timestamps, soft deletes, and audit logging.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Create base class for all models
Base = declarative_base()


class BaseModel(Base):
    """
    Base model with common fields and functionality.
    
    Features:
    - UUID primary keys
    - Created/updated timestamps
    - Soft delete support
    - Audit logging integration
    - JSON serialization
    """
    
    __abstract__ = True
    
    # Primary key using UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Timestamp fields
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True
    )
    
    # Soft delete support
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True
    )
    
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True
    )
    
    def to_dict(self, exclude_fields: Optional[set] = None) -> Dict[str, Any]:
        """Convert model to dictionary."""
        exclude_fields = exclude_fields or set()
        
        result = {}
        for column in self.__table__.columns:
            if column.name not in exclude_fields:
                value = getattr(self, column.name)
                if isinstance(value, datetime):
                    value = value.isoformat()
                elif isinstance(value, uuid.UUID):
                    value = str(value)
                result[column.name] = value
        
        return result
    
    def soft_delete(self) -> None:
        """Perform soft delete."""
        self.deleted_at = datetime.utcnow()
        self.is_active = False
    
    def restore(self) -> None:
        """Restore soft-deleted record."""
        self.deleted_at = None
        self.is_active = True
    
    @property
    def is_deleted(self) -> bool:
        """Check if record is soft-deleted."""
        return self.deleted_at is not None


class User(BaseModel):
    """
    User model with comprehensive security features.
    
    Features:
    - Secure password storage
    - Email verification
    - Role-based access control
    - Account security tracking
    - Login attempt monitoring
    """
    
    __tablename__ = "users"
    
    # User identification
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    
    # Authentication
    password_hash = Column(String(255), nullable=False)
    password_salt = Column(String(255), nullable=True)
    
    # Profile information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    display_name = Column(String(200), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Account status
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_staff = Column(Boolean, default=False, nullable=False)
    
    # Security fields
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_password_change = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    account_locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Verification tokens
    email_verification_token = Column(String(255), nullable=True, index=True)
    password_reset_token = Column(String(255), nullable=True, index=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)
    
    # User preferences and metadata
    timezone = Column(String(50), default="UTC")
    language = Column(String(10), default="en")
    settings = Column(JSON, default=dict)
    
    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),
        Index('idx_user_verification', 'email_verification_token'),
        Index('idx_user_password_reset', 'password_reset_token'),
        Index('idx_user_last_login', 'last_login'),
    )
    
    def to_dict(self, exclude_fields: Optional[set] = None) -> Dict[str, Any]:
        """Convert user to dictionary, excluding sensitive fields."""
        default_exclude = {
            'password_hash', 'password_salt', 'email_verification_token',
            'password_reset_token', 'failed_login_attempts'
        }
        exclude_fields = (exclude_fields or set()) | default_exclude
        return super().to_dict(exclude_fields)
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.display_name or self.username or self.email
    
    @property
    def is_account_locked(self) -> bool:
        """Check if account is locked."""
        if not self.account_locked_until:
            return False
        return datetime.utcnow() < self.account_locked_until
    
    def lock_account(self, duration_minutes: int = 15) -> None:
        """Lock account for specified duration."""
        from datetime import timedelta
        self.account_locked_until = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.failed_login_attempts += 1
    
    def unlock_account(self) -> None:
        """Unlock account and reset failed attempts."""
        self.account_locked_until = None
        self.failed_login_attempts = 0
    
    def record_successful_login(self) -> None:
        """Record successful login."""
        self.last_login = datetime.utcnow()
        self.failed_login_attempts = 0
        self.account_locked_until = None


class AuditLog(BaseModel):
    """
    Comprehensive audit logging for security and compliance.
    
    Features:
    - User action tracking
    - Security event logging
    - Data change auditing
    - IP address and user agent tracking
    - Compliance reporting support
    """
    
    __tablename__ = "audit_logs"
    
    # User and session information
    user_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True
    )
    session_id = Column(String(255), nullable=True, index=True)
    
    # Action details
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=True, index=True)
    resource_id = Column(String(255), nullable=True, index=True)
    
    # Request information
    ip_address = Column(String(45), nullable=True, index=True)  # IPv6 support
    user_agent = Column(Text, nullable=True)
    request_method = Column(String(10), nullable=True)
    request_path = Column(String(500), nullable=True)
    
    # Event details
    event_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), default="info", index=True)
    description = Column(Text, nullable=True)
    
    # Data changes (before/after for auditing)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Additional metadata
    metadata = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    
    # Success/failure tracking
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    # Indexes for performance and querying
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action'),
        Index('idx_audit_timestamp', 'created_at'),
        Index('idx_audit_event_type', 'event_type', 'created_at'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_ip_action', 'ip_address', 'action'),
        Index('idx_audit_severity', 'severity', 'created_at'),
    )
    
    @classmethod
    def create_log(
        cls,
        action: str,
        event_type: str = "user_action",
        user_id: Optional[uuid.UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        description: Optional[str] = None,
        old_values: Optional[Dict] = None,
        new_values: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        severity: str = "info",
        success: bool = True,
        error_message: Optional[str] = None,
    ) -> "AuditLog":
        """Create audit log entry."""
        return cls(
            user_id=user_id,
            action=action,
            event_type=event_type,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            description=description,
            old_values=old_values or {},
            new_values=new_values or {},
            metadata=metadata or {},
            severity=severity,
            success=success,
            error_message=error_message,
        )


class UserRole(BaseModel):
    """
    User roles for role-based access control.
    
    Features:
    - Hierarchical role system
    - Permission management
    - Role inheritance
    - Audit logging integration
    """
    
    __tablename__ = "user_roles"
    
    user_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True
    )
    
    role = Column(String(50), nullable=False, index=True)
    granted_by = Column(UUID(as_uuid=True), nullable=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Role metadata
    scope = Column(String(100), nullable=True)  # e.g., 'organization:123'
    permissions = Column(JSON, default=list)
    
    __table_args__ = (
        Index('idx_user_role', 'user_id', 'role'),
        Index('idx_role_scope', 'role', 'scope'),
        Index('idx_role_expiry', 'expires_at'),
    )
    
    @property
    def is_expired(self) -> bool:
        """Check if role assignment is expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at