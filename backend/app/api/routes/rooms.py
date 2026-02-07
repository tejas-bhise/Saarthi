# app/api/routes/rooms.py

from fastapi import APIRouter, HTTPException

from ...schemas.requests import CreateRoomRequest
from ...schemas.responses import RoomResponse
from ...services.room_service import create_room, get_room

router = APIRouter()


@router.post("/rooms", response_model=RoomResponse)
async def create_room_endpoint(payload: CreateRoomRequest) -> RoomResponse:
    room = create_room(
        user_id=payload.userId,
        tutor_id=payload.companionId,
        subject=payload.subject,
    )

    return RoomResponse(
        roomId=room.room_id,
        companionId=room.tutor_id,
        subject=room.subject,
        participantCount=room.participant_count,
        createdAt=room.created_at.isoformat() + "Z",
        expiresAt=room.expires_at.isoformat() + "Z",
    )


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room_endpoint(room_id: str) -> RoomResponse:
    room = get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found or expired")

    return RoomResponse(
        roomId=room.room_id,
        companionId=room.tutor_id,
        subject=room.subject,
        participantCount=room.participant_count,
        createdAt=room.created_at.isoformat() + "Z",
        expiresAt=room.expires_at.isoformat() + "Z",
    )
@router.post("/rooms/{room_id}/summary")
async def generate_summary(room_id: str, user_id: str):
    """
    Generate and store session summary for a room.
    Usually called when user leaves.
    """
    from ...services.storage_service import generate_session_summary, store_session_summary

    room = get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    summary = generate_session_summary(
        user_id=user_id,
        room_id=room_id,
        tutor_id=room.tutor_id,
        subject=room.subject,
    )

    store_session_summary(summary)

    return {
        "summary": summary.model_dump(),
        "message": "Session summary generated",
    }


@router.get("/users/{user_id}/sessions")
async def get_user_session_history(user_id: str):
    """Get all session summaries for a user."""
    from ...services.storage_service import get_user_sessions

    summaries = get_user_sessions(user_id)
    return {"sessions": [s.model_dump() for s in summaries]}
