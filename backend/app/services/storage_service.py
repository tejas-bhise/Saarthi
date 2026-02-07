# app/services/storage_service.py

import json
from typing import Optional, List
from datetime import datetime

from .redis_service import redis_client
from ..models.session_summary import SessionSummary
from .gemini_service import call_gemini


def store_session_summary(summary: SessionSummary) -> None:
    """
    Store session summary in Redis.
    Key: session:summary:{userId}:{roomId}
    TTL: 90 days
    """
    key = f"session:summary:{summary.user_id}:{summary.room_id}"
    redis_client.set(key, summary.model_dump_json(), ex=90 * 24 * 60 * 60)

    # Add to user's session index
    index_key = f"user:{summary.user_id}:sessions"
    redis_client.sadd(index_key, key)
    redis_client.expire(index_key, 90 * 24 * 60 * 60)


def get_session_summary(user_id: str, room_id: str) -> Optional[SessionSummary]:
    """Retrieve session summary from Redis."""
    key = f"session:summary:{user_id}:{room_id}"
    data = redis_client.get(key)
    if not data:
        return None
    return SessionSummary.model_validate_json(data)


def get_user_sessions(user_id: str) -> List[SessionSummary]:
    """Get all session summaries for a user."""
    index_key = f"user:{user_id}:sessions"
    summary_keys = redis_client.smembers(index_key)

    summaries = []
    for key in summary_keys:
        data = redis_client.get(key)
        if data:
            summaries.append(SessionSummary.model_validate_json(data))

    return sorted(summaries, key=lambda s: s.created_at, reverse=True)


def generate_session_summary(
    user_id: str, room_id: str, tutor_id: str, subject: str
) -> SessionSummary:
    """
    Generate session summary using AI by analyzing conversation history.
    """
    # Fetch full conversation history
    history_key = f"room:{room_id}:history"
    raw_history = redis_client.lrange(history_key, 0, -1)

    if not raw_history:
        # Empty session, return minimal summary
        return SessionSummary(
            user_id=user_id,
            room_id=room_id,
            tutor_id=tutor_id,
            subject=subject,
            topics_covered=[],
            questions_asked=[],
            learning_style="unknown",
            knowledge_gaps=[],
            recommended_next_topics=[],
            created_at=datetime.utcnow(),
        )

    # Build conversation text for AI analysis
    conversation_lines = []
    for msg in raw_history:
        try:
            msg_dict = eval(msg)
            role = msg_dict.get("role", "unknown")
            content = msg_dict.get("content", "")
            label = "Student" if role == "user" else "Tutor"
            conversation_lines.append(f"{label}: {content}")
        except Exception:
            continue

    conversation_text = "\n".join(conversation_lines)

    # Ask Gemini to analyze and summarize
    prompt = f"""
Analyze this tutoring session and create a structured summary.

Subject: {subject}

Conversation:
{conversation_text}

Provide a JSON response with:
- topics_covered: list of main topics discussed (max 5)
- questions_asked: list of student's key questions (max 5)
- learning_style: one of ["visual", "example-based", "theoretical", "hands-on"]
- knowledge_gaps: list of concepts student struggled with (max 3)
- recommended_next_topics: list of what to study next (max 3)

Return only valid JSON, no markdown.
"""

    try:
        response = call_gemini(prompt)
        # Try to parse JSON from response
        # Sometimes Gemini wraps JSON in ```json ... ```
        if "```json" in response:
            json_str = response.split("```json").split("```").strip()[1]
        elif "```" in response:
            json_str = response.split("```")[1].split("```")[0].strip()
        else:
            json_str = response.strip()

        summary_data = json.loads(json_str)

        return SessionSummary(
            user_id=user_id,
            room_id=room_id,
            tutor_id=tutor_id,
            subject=subject,
            topics_covered=summary_data.get("topics_covered", []),
            questions_asked=summary_data.get("questions_asked", []),
            learning_style=summary_data.get("learning_style", "unknown"),
            knowledge_gaps=summary_data.get("knowledge_gaps", []),
            recommended_next_topics=summary_data.get("recommended_next_topics", []),
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        print(f"Summary generation error: {e}")
        # Return minimal summary on error
        return SessionSummary(
            user_id=user_id,
            room_id=room_id,
            tutor_id=tutor_id,
            subject=subject,
            topics_covered=["Session analysis failed"],
            questions_asked=[],
            learning_style="unknown",
            knowledge_gaps=[],
            recommended_next_topics=[],
            created_at=datetime.utcnow(),
        )
