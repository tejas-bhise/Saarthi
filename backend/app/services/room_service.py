# app/services/room_service.py

from datetime import datetime, timedelta
from typing import Optional

from .redis_service import redis_client
from ..models.room import Room
from ..utils.id_generator import generate_room_id


ROOM_TTL_HOURS = 24


def create_room(user_id: str, tutor_id: str, subject: str) -> Room:
    """
    Create a new room, store metadata in Redis, and return the Room model.
    """
    now = datetime.utcnow()
    expires_at = now + timedelta(hours=ROOM_TTL_HOURS)

    room_id = generate_room_id(subject)

    room = Room(
        room_id=room_id,
        subject=subject,
        tutor_id=tutor_id,
        created_by=user_id,
        created_at=now,
        expires_at=expires_at,
        participant_count=1,
    )

    key = f"room:{room_id}:meta"

    redis_client.hset(
        key,
        mapping={
            "subject": room.subject,
            "tutor_id": room.tutor_id,
            "created_by": room.created_by,
            "created_at": room.created_at.isoformat(),
            "expires_at": room.expires_at.isoformat(),
            "participant_count": str(room.participant_count),
        },
    )
    redis_client.expire(key, ROOM_TTL_HOURS * 60 * 60)

    return room


def get_room(room_id: str) -> Optional[Room]:
    """
    Fetch room metadata from Redis. Returns None if not found.
    """
    key = f"room:{room_id}:meta"
    data = redis_client.hgetall(key)
    if not data:
        return None

    try:
        room = Room(
            room_id=room_id,
            subject=data.get("subject", ""),
            tutor_id=data.get("tutor_id", ""),
            created_by=data.get("created_by", ""),
            created_at=datetime.fromisoformat(data["created_at"]),
            expires_at=datetime.fromisoformat(data["expires_at"]),
            participant_count=int(data.get("participant_count", "1")),
        )
        return room
    except Exception:
        return None
