# app/services/memory_service.py

import json
from .redis_service import redis_client

CHAT_TTL = 60 * 60 * 24   # 24 hours
SUMMARY_TTL = 60 * 60 * 24 * 60  # 60 days

# ---------------------------
# CHAT HISTORY
# ---------------------------

def save_chat_message(room_id: str, role: str, content: str):
    key = f"chat:room:{room_id}:messages"

    message = {
        "role": role,
        "content": content
    }

    redis_client.rpush(key, json.dumps(message))
    redis_client.expire(key, CHAT_TTL)


def get_recent_chat(room_id: str, limit: int = 6):
    key = f"chat:room:{room_id}:messages"

    raw = redis_client.lrange(key, -limit, -1)
    return [json.loads(m) for m in raw]


# ---------------------------
# SESSION SUMMARY
# ---------------------------

def save_session_summary(user_id: str, room_id: str, summary: dict):
    key = f"session:summary:{user_id}:{room_id}"
    redis_client.set(key, json.dumps(summary), ex=SUMMARY_TTL)

    redis_client.sadd(f"user:{user_id}:sessions", room_id)


def get_session_summary(user_id: str, room_id: str):
    key = f"session:summary:{user_id}:{room_id}"
    val = redis_client.get(key)
    return json.loads(val) if val else None
