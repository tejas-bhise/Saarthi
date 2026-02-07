# app/api/websocket/signaling.py

import socketio
from typing import Dict, Set

from . import events

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",  # In production, restrict to your frontend domain
    logger=True,
    engineio_logger=False,
)

# Track active rooms and users
# room_id -> set of session_ids
active_rooms: Dict[str, Set[str]] = {}


@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")
    # Clean up user from all rooms
    for room_id, users in list(active_rooms.items()):
        if sid in users:
            users.remove(sid)
            await sio.leave_room(sid, room_id)
            # Notify others in room
            await sio.emit(
                events.USER_LEFT,
                {"userId": sid},
                room=room_id,
                skip_sid=sid,
            )
            if not users:
                del active_rooms[room_id]


@sio.event
async def join_room(sid, data):
    """
    User joins a room.
    Expected data: { roomId, userId }
    """
    room_id = data.get("roomId")
    user_id = data.get("userId")

    if not room_id:
        return {"error": "roomId required"}

    # Add user to room
    await sio.enter_room(sid, room_id)

    if room_id not in active_rooms:
        active_rooms[room_id] = set()
    active_rooms[room_id].add(sid)

    # Notify others in the room
    await sio.emit(
        events.USER_JOINED,
        {"userId": user_id, "sessionId": sid},
        room=room_id,
        skip_sid=sid,
    )

    # Send current participants back to joiner
    participants = [
        {"sessionId": s} for s in active_rooms[room_id] if s != sid
    ]
    return {"participants": participants}


@sio.event
async def leave_room(sid, data):
    """User leaves room."""
    room_id = data.get("roomId")
    user_id = data.get("userId")

    if room_id and room_id in active_rooms:
        active_rooms[room_id].discard(sid)
        await sio.leave_room(sid, room_id)

        await sio.emit(
            events.USER_LEFT,
            {"userId": user_id, "sessionId": sid},
            room=room_id,
        )

        if not active_rooms[room_id]:
            del active_rooms[room_id]


@sio.event
async def webrtc_offer(sid, data):
    """
    Relay WebRTC offer to target peer.
    Expected data: { roomId, targetSessionId, offer }
    """
    room_id = data.get("roomId")
    target_sid = data.get("targetSessionId")
    offer = data.get("offer")

    if target_sid:
        await sio.emit(
            events.WEBRTC_OFFER,
            {"offer": offer, "fromSessionId": sid},
            room=target_sid,
        )


@sio.event
async def webrtc_answer(sid, data):
    """
    Relay WebRTC answer to target peer.
    Expected data: { roomId, targetSessionId, answer }
    """
    target_sid = data.get("targetSessionId")
    answer = data.get("answer")

    if target_sid:
        await sio.emit(
            events.WEBRTC_ANSWER,
            {"answer": answer, "fromSessionId": sid},
            room=target_sid,
        )


@sio.event
async def ice_candidate(sid, data):
    """
    Relay ICE candidate to target peer.
    Expected data: { roomId, targetSessionId, candidate }
    """
    target_sid = data.get("targetSessionId")
    candidate = data.get("candidate")

    if target_sid:
        await sio.emit(
            events.ICE_CANDIDATE,
            {"candidate": candidate, "fromSessionId": sid},
            room=target_sid,
        )


@sio.event
async def chat_message(sid, data):
    """
    Broadcast chat message to room.
    Expected data: { roomId, userId, message }
    """
    room_id = data.get("roomId")
    await sio.emit(
        events.NEW_CHAT_MESSAGE,
        data,
        room=room_id,
        skip_sid=sid,
    )


@sio.event
async def whiteboard_update(sid, data):
    """
    Broadcast whiteboard changes to room.
    Expected data: { roomId, elements }
    """
    room_id = data.get("roomId")
    await sio.emit(
        events.WHITEBOARD_UPDATE,
        data,
        room=room_id,
        skip_sid=sid,
    )


@sio.event
async def reaction(sid, data):
    """
    Broadcast emoji reaction to room.
    Expected data: { roomId, emoji }
    """
    room_id = data.get("roomId")
    await sio.emit(
        events.NEW_REACTION,
        data,
        room=room_id,
        skip_sid=sid,
    )
