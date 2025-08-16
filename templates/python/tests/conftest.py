"""
Pytest configuration and shared fixtures.

Provides test setup, database fixtures, authentication helpers,
and other testing utilities following TDD methodology.
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.models import Base
from app.database.connection import DatabaseManager
from app.config.settings import get_test_settings


# Test database configuration
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for the entire test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create database session for each test."""
    Session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with Session() as session:
        # Start transaction
        transaction = await session.begin()
        
        yield session
        
        # Rollback transaction after test
        await transaction.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def test_user_data():
    """Test user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
    }


@pytest.fixture
def admin_user_data():
    """Admin user data."""
    return {
        "email": "admin@example.com", 
        "password": "AdminPassword123!",
        "first_name": "Admin",
        "last_name": "User",
        "roles": ["admin"],
    }


@pytest_asyncio.fixture
async def authenticated_client(client: AsyncClient, test_user_data) -> AsyncClient:
    """Create authenticated test client."""
    # Mock login for testing
    # In real implementation, this would create a proper test user and token
    client.headers.update({
        "Authorization": "Bearer test-token"
    })
    return client


@pytest_asyncio.fixture
async def admin_client(client: AsyncClient, admin_user_data) -> AsyncClient:
    """Create admin authenticated test client."""
    client.headers.update({
        "Authorization": "Bearer admin-test-token"
    })
    return client


class TestFactory:
    """Factory for creating test data objects."""
    
    @staticmethod
    def create_user_dict(**kwargs):
        """Create user dictionary with default values."""
        defaults = {
            "id": "test-user-id",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User", 
            "is_active": True,
            "is_verified": True,
            "roles": ["user"],
        }
        defaults.update(kwargs)
        return defaults
    
    @staticmethod
    def create_admin_dict(**kwargs):
        """Create admin user dictionary."""
        defaults = {
            "id": "admin-user-id",
            "email": "admin@example.com",
            "first_name": "Admin",
            "last_name": "User",
            "is_active": True,
            "is_verified": True,
            "roles": ["admin", "user"],
        }
        defaults.update(kwargs)
        return defaults


@pytest.fixture
def test_factory():
    """Provide test factory."""
    return TestFactory


# Markers for test categorization
pytest.fixture(autouse=True)
def setup_test_markers(request):
    """Automatically setup test markers."""
    # Add markers based on test file location
    if "unit" in request.fspath.basename:
        request.node.add_marker(pytest.mark.unit)
    elif "integration" in request.fspath.basename:
        request.node.add_marker(pytest.mark.integration)
    elif "e2e" in request.fspath.basename:
        request.node.add_marker(pytest.mark.e2e)


# Mock settings for testing
@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """Mock settings for testing."""
    test_settings = get_test_settings()
    monkeypatch.setattr("app.config.settings.get_settings", lambda: test_settings)
    return test_settings