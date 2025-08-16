"""
Unit tests for authentication functionality.

Tests JWT token handling, password management, and security features
following TDD methodology with comprehensive coverage.
"""

import pytest
import time
from unittest.mock import Mock, patch

from app.auth.jwt_handler import JWTHandler
from app.auth.password_manager import PasswordManager
from app.auth.session_manager import SessionManager


class TestJWTHandler:
    """Test JWT token handling functionality."""
    
    @pytest.fixture
    def jwt_handler(self):
        """Create JWT handler instance."""
        return JWTHandler()
    
    @pytest.mark.asyncio
    async def test_create_access_token(self, jwt_handler):
        """Test access token creation."""
        subject = "user-123"
        extra_data = {"roles": ["user"]}
        
        token = await jwt_handler.create_access_token(
            subject=subject,
            extra_data=extra_data
        )
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token can be decoded
        payload = await jwt_handler.decode_token(token)
        assert payload is not None
        assert payload["sub"] == subject
        assert payload["type"] == "access"
        assert payload["roles"] == ["user"]
    
    @pytest.mark.asyncio
    async def test_create_refresh_token(self, jwt_handler):
        """Test refresh token creation."""
        subject = "user-123"
        
        with patch.object(jwt_handler, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            
            token = await jwt_handler.create_refresh_token(subject=subject)
            
            assert isinstance(token, str)
            assert len(token) > 0
            
            # Verify Redis interaction
            mock_redis_client.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_decode_valid_token(self, jwt_handler):
        """Test decoding valid token."""
        subject = "user-123"
        token = await jwt_handler.create_access_token(subject=subject)
        
        payload = await jwt_handler.decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == subject
        assert payload["type"] == "access"
        assert "exp" in payload
        assert "iat" in payload
        assert "jti" in payload
    
    @pytest.mark.asyncio
    async def test_decode_invalid_token(self, jwt_handler):
        """Test decoding invalid token."""
        invalid_token = "invalid.token.here"
        
        payload = await jwt_handler.decode_token(invalid_token)
        
        assert payload is None
    
    @pytest.mark.asyncio
    async def test_decode_expired_token(self, jwt_handler):
        """Test decoding expired token."""
        # Create token with very short expiration
        jwt_handler.access_token_expire_minutes = -1  # Already expired
        
        subject = "user-123"
        token = await jwt_handler.create_access_token(subject=subject)
        
        payload = await jwt_handler.decode_token(token)
        
        assert payload is None
    
    @pytest.mark.asyncio
    async def test_blacklist_token(self, jwt_handler):
        """Test token blacklisting."""
        subject = "user-123"
        token = await jwt_handler.create_access_token(subject=subject)
        
        with patch.object(jwt_handler, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            
            result = await jwt_handler.blacklist_token(token)
            
            assert result is True
            mock_redis_client.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_is_token_blacklisted(self, jwt_handler):
        """Test checking if token is blacklisted."""
        subject = "user-123"
        token = await jwt_handler.create_access_token(subject=subject)
        
        with patch.object(jwt_handler, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            
            # Test not blacklisted
            mock_redis_client.get.return_value = None
            result = await jwt_handler.is_token_blacklisted(token)
            assert result is False
            
            # Test blacklisted
            mock_redis_client.get.return_value = "1"
            result = await jwt_handler.is_token_blacklisted(token)
            assert result is True
    
    @pytest.mark.asyncio
    async def test_refresh_access_token(self, jwt_handler):
        """Test refreshing access token."""
        subject = "user-123"
        
        with patch.object(jwt_handler, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            mock_redis_client.get.return_value = subject  # Valid refresh token
            
            refresh_token = await jwt_handler.create_refresh_token(subject=subject)
            
            # Mock decode to return valid refresh token payload
            with patch.object(jwt_handler, 'decode_token') as mock_decode:
                mock_decode.side_effect = [
                    {"sub": subject, "type": "refresh", "jti": "token-id"},  # First call for validation
                    {"sub": subject, "type": "refresh", "jti": "token-id"},  # Second call for blacklisting
                ]
                
                result = await jwt_handler.refresh_access_token(refresh_token)
                
                assert result is not None
                assert "access_token" in result
                assert "refresh_token" in result
                assert "token_type" in result
                assert result["token_type"] == "bearer"


class TestPasswordManager:
    """Test password management functionality."""
    
    def test_hash_password(self):
        """Test password hashing."""
        password = "TestPassword123!"
        
        hashed = PasswordManager.hash_password(password)
        
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        assert hashed != password  # Should be different from original
        assert hashed.startswith("$2b$")  # bcrypt format
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "TestPassword123!"
        hashed = PasswordManager.hash_password(password)
        
        result = PasswordManager.verify_password(password, hashed)
        
        assert result is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = PasswordManager.hash_password(password)
        
        result = PasswordManager.verify_password(wrong_password, hashed)
        
        assert result is False
    
    def test_validate_password_strength_valid(self):
        """Test password strength validation with valid password."""
        password = "ValidPassword123!"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is True
        assert len(result["errors"]) == 0
    
    def test_validate_password_strength_too_short(self):
        """Test password strength validation with short password."""
        password = "Short1!"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is False
        assert any("at least" in error for error in result["errors"])
    
    def test_validate_password_strength_no_uppercase(self):
        """Test password strength validation without uppercase."""
        password = "lowercase123!"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is False
        assert any("uppercase" in error for error in result["errors"])
    
    def test_validate_password_strength_no_lowercase(self):
        """Test password strength validation without lowercase."""
        password = "UPPERCASE123!"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is False
        assert any("lowercase" in error for error in result["errors"])
    
    def test_validate_password_strength_no_numbers(self):
        """Test password strength validation without numbers."""
        password = "NoNumbers!"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is False
        assert any("number" in error for error in result["errors"])
    
    def test_validate_password_strength_no_special_chars(self):
        """Test password strength validation without special characters."""
        password = "NoSpecialChars123"
        
        result = PasswordManager.validate_password_strength(password)
        
        assert result["valid"] is False
        assert any("special character" in error for error in result["errors"])


class TestSessionManager:
    """Test session management functionality."""
    
    @pytest.fixture
    def session_manager(self):
        """Create session manager instance."""
        return SessionManager()
    
    @pytest.mark.asyncio
    async def test_create_session(self, session_manager):
        """Test session creation."""
        user_id = "user-123"
        extra_data = {"role": "user"}
        
        with patch.object(session_manager, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            
            session_id = await session_manager.create_session(
                user_id=user_id,
                extra_data=extra_data
            )
            
            assert isinstance(session_id, str)
            assert len(session_id) > 0
            mock_redis_client.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_session_valid(self, session_manager):
        """Test getting valid session."""
        session_id = "session-123"
        session_data = {
            "user_id": "user-123",
            "created_at": time.time(),
            "last_activity": time.time(),
        }
        
        with patch.object(session_manager, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            mock_redis_client.get.return_value = '{"user_id": "user-123", "created_at": 1234567890, "last_activity": 1234567890}'
            
            result = await session_manager.get_session(session_id)
            
            assert result is not None
            assert result["user_id"] == "user-123"
            mock_redis_client.get.assert_called_once_with(f"session:{session_id}")
    
    @pytest.mark.asyncio
    async def test_get_session_invalid(self, session_manager):
        """Test getting invalid session."""
        session_id = "invalid-session"
        
        with patch.object(session_manager, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            mock_redis_client.get.return_value = None
            
            result = await session_manager.get_session(session_id)
            
            assert result is None
    
    @pytest.mark.asyncio
    async def test_delete_session(self, session_manager):
        """Test session deletion."""
        session_id = "session-123"
        
        with patch.object(session_manager, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            mock_redis_client.delete.return_value = 1  # Successful deletion
            
            result = await session_manager.delete_session(session_id)
            
            assert result is True
            mock_redis_client.delete.assert_called_once_with(f"session:{session_id}")
    
    @pytest.mark.asyncio
    async def test_update_session_activity(self, session_manager):
        """Test updating session activity."""
        session_id = "session-123"
        session_data = {
            "user_id": "user-123",
            "created_at": time.time(),
            "last_activity": time.time(),
        }
        
        with patch.object(session_manager, '_get_redis_client') as mock_redis:
            mock_redis_client = Mock()
            mock_redis.return_value = mock_redis_client
            
            # Mock get_session to return existing session
            with patch.object(session_manager, 'get_session') as mock_get:
                mock_get.return_value = session_data
                
                result = await session_manager.update_session_activity(session_id)
                
                assert result is True
                mock_redis_client.setex.assert_called_once()