"""
JWT Token Handler

Secure JWT token creation, validation, and management with comprehensive security features.
Implements token blacklisting, refresh tokens, and security event logging.
"""

import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Union

import jwt
from jwt.exceptions import DecodeError, ExpiredSignatureError, InvalidTokenError

from app.config.settings import get_settings, get_security_settings
from app.utils.logger import get_logger
from app.utils.redis_client import get_redis_client

logger = get_logger(__name__)
settings = get_settings()
security_settings = get_security_settings()


class JWTHandler:
    """
    Secure JWT token handler with blacklisting and refresh token support.
    
    Features:
    - Access and refresh token generation
    - Token validation and decoding
    - Token blacklisting for logout/revocation
    - Security event logging
    - Token fingerprinting for additional security
    """
    
    def __init__(self):
        self.algorithm = settings.ALGORITHM
        self.secret_key = settings.SECRET_KEY
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
        self.redis_client = None
    
    async def _get_redis_client(self):
        """Get Redis client for token blacklisting."""
        if not self.redis_client:
            self.redis_client = await get_redis_client()
        return self.redis_client
    
    async def create_access_token(
        self, 
        subject: str, 
        extra_data: Optional[Dict] = None,
        fingerprint: Optional[str] = None
    ) -> str:
        """
        Create JWT access token.
        
        Args:
            subject: User identifier (typically user ID)
            extra_data: Additional claims to include in token
            fingerprint: Device/browser fingerprint for additional security
            
        Returns:
            str: Encoded JWT token
        """
        now = datetime.utcnow()
        expire = now + timedelta(minutes=self.access_token_expire_minutes)
        
        # Create token payload
        payload = {
            "sub": subject,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "type": "access",
            "jti": self._generate_token_id(),  # Unique token ID for blacklisting
        }
        
        # Add extra data if provided
        if extra_data:
            payload.update(extra_data)
        
        # Add fingerprint for additional security
        if fingerprint:
            payload["fp"] = hashlib.sha256(fingerprint.encode()).hexdigest()[:16]
        
        try:
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            # Log token creation
            await self._log_token_event("token_created", {
                "subject": subject,
                "token_id": payload["jti"],
                "token_type": "access",
                "expires_at": expire.isoformat(),
            })
            
            return token
            
        except Exception as e:
            logger.error(f"Error creating access token: {str(e)}")
            raise ValueError("Failed to create access token")
    
    async def create_refresh_token(
        self, 
        subject: str, 
        extra_data: Optional[Dict] = None,
        fingerprint: Optional[str] = None
    ) -> str:
        """
        Create JWT refresh token.
        
        Args:
            subject: User identifier
            extra_data: Additional claims to include in token
            fingerprint: Device/browser fingerprint
            
        Returns:
            str: Encoded JWT refresh token
        """
        now = datetime.utcnow()
        expire = now + timedelta(days=self.refresh_token_expire_days)
        
        payload = {
            "sub": subject,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "type": "refresh",
            "jti": self._generate_token_id(),
        }
        
        if extra_data:
            payload.update(extra_data)
        
        if fingerprint:
            payload["fp"] = hashlib.sha256(fingerprint.encode()).hexdigest()[:16]
        
        try:
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            # Store refresh token in Redis for validation
            redis_client = await self._get_redis_client()
            token_key = f"refresh_token:{payload['jti']}"
            expire_seconds = int(expire.timestamp() - now.timestamp())
            
            await redis_client.setex(
                token_key,
                expire_seconds,
                subject
            )
            
            # Log token creation
            await self._log_token_event("refresh_token_created", {
                "subject": subject,
                "token_id": payload["jti"],
                "token_type": "refresh",
                "expires_at": expire.isoformat(),
            })
            
            return token
            
        except Exception as e:
            logger.error(f"Error creating refresh token: {str(e)}")
            raise ValueError("Failed to create refresh token")
    
    async def decode_token(self, token: str, verify_fingerprint: Optional[str] = None) -> Optional[Dict]:
        """
        Decode and validate JWT token.
        
        Args:
            token: JWT token to decode
            verify_fingerprint: Expected device fingerprint to verify
            
        Returns:
            Dict: Token payload if valid, None if invalid
        """
        try:
            # Decode token
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            
            # Check if token is blacklisted
            if await self.is_token_blacklisted(token):
                logger.warning(f"Attempted use of blacklisted token: {payload.get('jti', 'unknown')}")
                return None
            
            # Verify fingerprint if provided
            if verify_fingerprint:
                token_fingerprint = payload.get("fp")
                expected_fingerprint = hashlib.sha256(verify_fingerprint.encode()).hexdigest()[:16]
                
                if token_fingerprint != expected_fingerprint:
                    logger.warning(f"Token fingerprint mismatch for token: {payload.get('jti', 'unknown')}")
                    await self._log_security_event("fingerprint_mismatch", {
                        "token_id": payload.get("jti"),
                        "subject": payload.get("sub"),
                    })
                    return None
            
            # Validate refresh token in Redis if it's a refresh token
            if payload.get("type") == "refresh":
                if not await self._validate_refresh_token(payload.get("jti"), payload.get("sub")):
                    return None
            
            return payload
            
        except ExpiredSignatureError:
            logger.info("Token expired")
            return None
        except DecodeError:
            logger.warning("Invalid token format")
            return None
        except InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error decoding token: {str(e)}")
            return None
    
    async def refresh_access_token(self, refresh_token: str, fingerprint: Optional[str] = None) -> Optional[Dict]:
        """
        Create new access token using refresh token.
        
        Args:
            refresh_token: Valid refresh token
            fingerprint: Device fingerprint for validation
            
        Returns:
            Dict: New access token and refresh token if successful
        """
        # Validate refresh token
        payload = await self.decode_token(refresh_token, fingerprint)
        
        if not payload or payload.get("type") != "refresh":
            return None
        
        subject = payload.get("sub")
        if not subject:
            return None
        
        try:
            # Create new tokens
            new_access_token = await self.create_access_token(
                subject=subject,
                extra_data={"roles": payload.get("roles", [])},
                fingerprint=fingerprint
            )
            
            new_refresh_token = await self.create_refresh_token(
                subject=subject,
                extra_data={"roles": payload.get("roles", [])},
                fingerprint=fingerprint
            )
            
            # Invalidate old refresh token
            await self.blacklist_token(refresh_token)
            
            # Log token refresh
            await self._log_token_event("token_refreshed", {
                "subject": subject,
                "old_token_id": payload.get("jti"),
            })
            
            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
            }
            
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return None
    
    async def blacklist_token(self, token: str) -> bool:
        """
        Add token to blacklist.
        
        Args:
            token: JWT token to blacklist
            
        Returns:
            bool: True if successful
        """
        try:
            # Decode token to get expiration and ID
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={"verify_exp": False}  # Don't verify expiration for blacklisting
            )
            
            token_id = payload.get("jti")
            if not token_id:
                return False
            
            # Calculate TTL (time until token would naturally expire)
            exp = payload.get("exp")
            if exp:
                ttl = max(0, exp - int(time.time()))
            else:
                # Default to 24 hours if no expiration
                ttl = 86400
            
            # Add to blacklist in Redis
            redis_client = await self._get_redis_client()
            blacklist_key = f"blacklist:{token_id}"
            
            await redis_client.setex(blacklist_key, ttl, "1")
            
            # Log blacklisting
            await self._log_token_event("token_blacklisted", {
                "token_id": token_id,
                "subject": payload.get("sub"),
                "reason": "manual_blacklist",
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Error blacklisting token: {str(e)}")
            return False
    
    async def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if token is blacklisted.
        
        Args:
            token: JWT token to check
            
        Returns:
            bool: True if blacklisted
        """
        try:
            # Decode token to get ID
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={"verify_exp": False}
            )
            
            token_id = payload.get("jti")
            if not token_id:
                return False
            
            # Check blacklist in Redis
            redis_client = await self._get_redis_client()
            blacklist_key = f"blacklist:{token_id}"
            
            result = await redis_client.get(blacklist_key)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error checking token blacklist: {str(e)}")
            return False
    
    async def revoke_all_user_tokens(self, user_id: str) -> bool:
        """
        Revoke all tokens for a specific user.
        
        Args:
            user_id: User identifier
            
        Returns:
            bool: True if successful
        """
        try:
            redis_client = await self._get_redis_client()
            
            # Add user to global revocation list
            revocation_key = f"user_revoked:{user_id}"
            # Set with long expiration (longer than any possible token)
            await redis_client.setex(revocation_key, 86400 * 30, str(int(time.time())))
            
            # Log revocation
            await self._log_security_event("all_tokens_revoked", {
                "user_id": user_id,
                "revoked_at": time.time(),
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Error revoking user tokens: {str(e)}")
            return False
    
    def _generate_token_id(self) -> str:
        """Generate unique token ID."""
        import uuid
        return str(uuid.uuid4())
    
    async def _validate_refresh_token(self, token_id: str, subject: str) -> bool:
        """Validate refresh token exists in Redis."""
        try:
            redis_client = await self._get_redis_client()
            token_key = f"refresh_token:{token_id}"
            
            stored_subject = await redis_client.get(token_key)
            return stored_subject == subject
            
        except Exception as e:
            logger.error(f"Error validating refresh token: {str(e)}")
            return False
    
    async def _log_token_event(self, event_type: str, event_data: Dict) -> None:
        """Log token-related events."""
        log_data = {
            "event_type": event_type,
            "timestamp": time.time(),
            **event_data
        }
        logger.info(f"Token event: {event_type}", extra={"token_event": log_data})
    
    async def _log_security_event(self, event_type: str, event_data: Dict) -> None:
        """Log security-related events."""
        log_data = {
            "event_type": event_type,
            "timestamp": time.time(),
            **event_data
        }
        logger.warning(f"Security event: {event_type}", extra={"security_event": log_data})