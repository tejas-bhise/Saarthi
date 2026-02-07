from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import base64
from datetime import datetime

from app.services.ai_router import route_question
from app.services.elevenlabs_service import generate_speech
from app.config import get_settings
from app.services.memory_service import save_chat_message, get_recent_chat
from app.services.database_service import (  # ✅ NEW
    save_message_to_db,
    get_or_create_session,
    get_user_by_email
)
from app.core.security import get_current_user  # ✅ NEW

settings = get_settings()
router = APIRouter(prefix="/api")


# ========================================
# Request/Response Models
# ========================================

class ChatRequest(BaseModel):
    message: str
    companion_id: str
    room_id: str
    subject: str = "General"
    retry_count: int = 0
    user_email: Optional[str] = None  # ✅ NEW (for DB save)


class ChatResponse(BaseModel):
    text: str
    source: str
    audioUrl: Optional[str] = None


# ========================================
# Tutor Prompts
# ========================================

TUTOR_PROMPTS = {
    "omkar_ai": """You are Omkar, a friendly and enthusiastic AI tutor specializing in Artificial Intelligence and Machine Learning.
Explain simply. Be supportive. Short answers.""",

    "priya_biology": """You are Priya, a warm and passionate Biology tutor.
Explain simply. Be supportive. Short answers.""",
}


# ========================================
# Chat Endpoint
# ========================================

@router.post("/chat/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Main chat endpoint
    
    Flow:
    1. Save user message to Redis
    2. Get conversation history
    3. Call AI (Gemini/Grok)
    4. Save AI response to Redis
    5. Save both messages to PostgreSQL ✅ NEW
    6. Generate audio (optional)
    7. Return response
    """
    
    try:
        print(f"📩 Received: {request.companion_id} - {request.message}")
        
        # ---------------------------------
        # SAVE USER MESSAGE TO REDIS (Fast)
        # ---------------------------------
        
        save_chat_message(
            request.room_id,
            "user",
            request.message
        )
        
        # ---------------------------------
        # FETCH HISTORY FROM REDIS
        # ---------------------------------
        
        conversation_history = get_recent_chat(
            request.room_id,
            limit=6
        )
        
        tutor_prompt = TUTOR_PROMPTS.get(
            request.companion_id,
            "You are a helpful AI tutor."
        )
        
        # ---------------------------------
        # ASK AI
        # ---------------------------------
        
        ai_answer, source = route_question(
            question=request.message,
            subject=request.subject,
            retry_count=request.retry_count,
            conversation_history=conversation_history,
            tutor_prompt_template=tutor_prompt,
            user_id=None,
            room_id=request.room_id
        )
        
        print(f"✅ AI ({source}): {ai_answer[:80]}...")
        
        # ---------------------------------
        # SAVE AI MESSAGE TO REDIS
        # ---------------------------------
        
        save_chat_message(
            request.room_id,
            "assistant",
            ai_answer
        )
        
        # ---------------------------------
        # ✅ SAVE TO POSTGRESQL (Permanent)
        # ---------------------------------
        
        try:
            # Get user_id from email (if provided)
            user_id = None
            if request.user_email:
                user = await get_user_by_email(request.user_email)
                if user:
                    user_id = user['id']
            
            # Get or create session
            session_id = await get_or_create_session(
                room_id=request.room_id,
                user_id=user_id,
                tutor_id=request.companion_id,
                subject=request.subject
            )
            
            # Save user message
            await save_message_to_db(
                session_id=session_id,
                user_id=user_id,
                role="user",
                content=request.message
            )
            
            # Save AI response
            await save_message_to_db(
                session_id=session_id,
                user_id=user_id,
                role="assistant",
                content=ai_answer
            )
            
            print(f"✅ Messages saved to PostgreSQL (session: {session_id})")
            
        except Exception as db_error:
            print(f"⚠️ PostgreSQL save failed (non-critical): {db_error}")
            # Don't fail the request if DB save fails
        
        # ---------------------------------
        # AUDIO GENERATION (Optional)
        # ---------------------------------
        
        audio_url = None
        if settings.elevenlabs_api_key:
            try:
                audio_bytes = generate_speech(
                    text=ai_answer,
                    voice_key=request.companion_id,
                )
                audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
                audio_url = f"data:audio/mpeg;base64,{audio_base64}"
            except Exception as e:
                print(f"⚠️ ElevenLabs error: {e}")
        
        return ChatResponse(
            text=ai_answer,
            source=source,
            audioUrl=audio_url,
        )
    
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# Health Check
# ========================================

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "chat"}
