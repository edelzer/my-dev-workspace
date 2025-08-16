"""
Integration tests for API endpoints.

Tests complete request/response cycles with middleware,
authentication, and database integration.
"""

import pytest
from httpx import AsyncClient


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test main health check endpoint."""
        response = await client.get("/health/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "version" in data
        assert "environment" in data
        assert "database" in data
        assert "redis" in data
    
    @pytest.mark.asyncio
    async def test_readiness_probe(self, client: AsyncClient):
        """Test Kubernetes readiness probe."""
        response = await client.get("/health/readiness")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
    
    @pytest.mark.asyncio
    async def test_liveness_probe(self, client: AsyncClient):
        """Test Kubernetes liveness probe."""
        response = await client.get("/health/liveness")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"


class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    @pytest.mark.asyncio
    async def test_login_valid_credentials(self, client: AsyncClient):
        """Test login with valid credentials."""
        login_data = {
            "email": "admin@example.com",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials."""
        login_data = {
            "email": "admin@example.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "error" in data or "detail" in data
    
    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client: AsyncClient):
        """Test login with missing fields."""
        login_data = {
            "email": "admin@example.com"
            # Missing password
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_login_invalid_email_format(self, client: AsyncClient):
        """Test login with invalid email format."""
        login_data = {
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_register_valid_data(self, client: AsyncClient):
        """Test user registration with valid data."""
        register_data = {
            "email": "newuser@example.com",
            "password": "ValidPassword123!",
            "first_name": "New",
            "last_name": "User"
        }
        
        response = await client.post("/api/v1/auth/register", json=register_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password."""
        register_data = {
            "email": "newuser@example.com",
            "password": "weak",  # Too weak
            "first_name": "New",
            "last_name": "User"
        }
        
        response = await client.post("/api/v1/auth/register", json=register_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.asyncio
    async def test_logout(self, authenticated_client: AsyncClient):
        """Test user logout."""
        response = await authenticated_client.post("/api/v1/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestUserEndpoints:
    """Test user management endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_current_user(self, authenticated_client: AsyncClient):
        """Test getting current user profile."""
        response = await authenticated_client.get("/api/v1/users/me")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "first_name" in data
        assert "last_name" in data
        assert "is_active" in data
    
    @pytest.mark.asyncio
    async def test_get_current_user_unauthenticated(self, client: AsyncClient):
        """Test getting current user without authentication."""
        response = await client.get("/api/v1/users/me")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_list_users_admin(self, admin_client: AsyncClient):
        """Test listing users as admin."""
        response = await admin_client.get("/api/v1/users/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_list_users_non_admin(self, authenticated_client: AsyncClient):
        """Test listing users as non-admin user."""
        response = await authenticated_client.get("/api/v1/users/")
        
        assert response.status_code == 403  # Forbidden
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_self(self, authenticated_client: AsyncClient):
        """Test getting user by ID (own profile)."""
        user_id = "test-user-id"
        
        response = await authenticated_client.get(f"/api/v1/users/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_other_user(self, authenticated_client: AsyncClient):
        """Test getting other user by ID (should be forbidden)."""
        other_user_id = "other-user-id"
        
        response = await authenticated_client.get(f"/api/v1/users/{other_user_id}")
        
        assert response.status_code == 403  # Forbidden


class TestMiddlewareIntegration:
    """Test middleware integration in request flow."""
    
    @pytest.mark.asyncio
    async def test_request_id_header(self, client: AsyncClient):
        """Test that request ID is added to response headers."""
        response = await client.get("/health/")
        
        assert "X-Request-ID" in response.headers
        assert len(response.headers["X-Request-ID"]) > 0
    
    @pytest.mark.asyncio
    async def test_security_headers(self, client: AsyncClient):
        """Test that security headers are added."""
        response = await client.get("/health/")
        
        # Check for security headers
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
    
    @pytest.mark.asyncio
    async def test_cors_headers(self, client: AsyncClient):
        """Test CORS headers on OPTIONS request."""
        response = await client.options("/api/v1/auth/login")
        
        assert response.status_code == 200
        # CORS headers should be present for preflight requests
    
    @pytest.mark.asyncio
    async def test_rate_limiting_headers(self, client: AsyncClient):
        """Test rate limiting headers."""
        response = await client.get("/health/")
        
        # Rate limiting headers should be present
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert "X-RateLimit-Reset" in response.headers
    
    @pytest.mark.asyncio
    async def test_error_handling_validation(self, client: AsyncClient):
        """Test error handling for validation errors."""
        # Send invalid JSON
        response = await client.post("/api/v1/auth/login", json={"invalid": "data"})
        
        assert response.status_code == 422
        data = response.json()
        
        assert "error" in data
        assert "validation_errors" in data
        assert "request_id" in data
    
    @pytest.mark.asyncio
    async def test_error_handling_not_found(self, client: AsyncClient):
        """Test error handling for 404 errors."""
        response = await client.get("/nonexistent/endpoint")
        
        assert response.status_code == 404


class TestSecurityFeatures:
    """Test security features integration."""
    
    @pytest.mark.asyncio
    async def test_sql_injection_protection(self, client: AsyncClient):
        """Test protection against SQL injection attempts."""
        malicious_data = {
            "email": "admin@example.com'; DROP TABLE users; --",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/login", json=malicious_data)
        
        # Should handle gracefully, not crash
        assert response.status_code in [400, 401, 422]
    
    @pytest.mark.asyncio
    async def test_xss_protection(self, client: AsyncClient):
        """Test protection against XSS attempts."""
        malicious_data = {
            "email": "<script>alert('xss')</script>",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/login", json=malicious_data)
        
        # Should handle gracefully
        assert response.status_code in [400, 401, 422]
    
    @pytest.mark.asyncio
    async def test_request_size_limit(self, client: AsyncClient):
        """Test request size limiting."""
        # Create very large payload
        large_data = {
            "email": "test@example.com",
            "password": "x" * 1000000,  # 1MB password
            "data": "x" * 10000000  # 10MB additional data
        }
        
        response = await client.post("/api/v1/auth/login", json=large_data)
        
        # Should be rejected due to size
        assert response.status_code in [400, 413, 422]