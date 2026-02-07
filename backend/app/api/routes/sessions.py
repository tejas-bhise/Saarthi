from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.security import get_current_user
from app.services.database_service import get_user_sessions, get_session_messages as db_get_session_messages

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for current user"""
    try:
        # Get user_id from token (not email!)
        user_id = current_user.get("user_id")
        
        if not user_id:
            return []
        
        sessions = await get_user_sessions(user_id)
        return sessions
    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        return []


@router.get("/{session_id}/messages")
async def get_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for a session"""
    try:
        messages = await db_get_session_messages(session_id)
        return messages
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        return []
