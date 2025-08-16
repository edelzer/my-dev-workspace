"""Session management for cookie-based authentication."""

import json
import time
import uuid
from typing import Dict, Optional

from app.config.settings import get_settings
from app.utils.logger import get_logger
from app.utils.redis_client import get_redis_client

logger = get_logger(__name__)
settings = get_settings()


class SessionManager:
    """Redis-based session management."""
    
    def __init__(self):
        self.redis_client = None
        self.session_expire = settings.SESSION_EXPIRE_SECONDS
    
    async def _get_redis_client(self):
        """Get Redis client."""
        if not self.redis_client:
            self.redis_client = await get_redis_client()
        return self.redis_client
    
    async def create_session(self, user_id: str, extra_data: Optional[Dict] = None) -> str:
        """Create new session."""
        session_id = str(uuid.uuid4())
        session_data = {
            "user_id": user_id,
            "created_at": time.time(),
            "last_activity": time.time(),
            **(extra_data or {})
        }
        
        try:
            redis_client = await self._get_redis_client()
            await redis_client.setex(
                f"session:{session_id}",
                self.session_expire,
                json.dumps(session_data)
            )
            return session_id
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data."""
        try:
            redis_client = await self._get_redis_client()
            data = await redis_client.get(f"session:{session_id}")
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Error getting session: {str(e)}")
            return None
    
    async def update_session_activity(self, session_id: str) -> bool:
        """Update session last activity."""
        try:
            session_data = await self.get_session(session_id)
            if not session_data:
                return False
            
            session_data["last_activity"] = time.time()
            
            redis_client = await self._get_redis_client()
            await redis_client.setex(
                f"session:{session_id}",
                self.session_expire,
                json.dumps(session_data)
            )
            return True
        except Exception as e:
            logger.error(f"Error updating session: {str(e)}")
            return False
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session."""
        try:
            redis_client = await self._get_redis_client()
            result = await redis_client.delete(f"session:{session_id}")
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting session: {str(e)}")
            return False