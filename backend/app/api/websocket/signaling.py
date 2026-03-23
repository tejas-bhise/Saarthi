# app/api/websocket/signaling.py

import socketio
from typing import Dict, Set
from . import events

# ========================================
# Socket.IO Server (ONLY ONE)
# ========================================

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

# ========================================
# In-Memory Room Storage
# room_id -> set(session_ids)
# ========================================

active_rooms: Dict[str, Set[str]] = {}

# ========================================
# Connection Events
# ========================================

@sio.event
async def connect(sid, environ):
    print(f"✅ Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Client disconnected: {sid}")

    for room_id, users in list(active_rooms.items()):
        if sid in users:
            users.remove(sid)
            await sio.leave_room(sid, room_id)

            await sio.emit(
                events.USER_LEFT,
                {"userId": sid},
                room=room_id,
                skip_sid=sid,
            )

            if not users:
                del active_rooms[room_id]

# ========================================
# Room Management
# ========================================

@sio.event
async def join_room(sid, data):
    room_id = data.get("roomId")
    user_id = data.get("userId")

    if not room_id:
        return {"error": "roomId required"}

    await sio.enter_room(sid, room_id)

    active_rooms.setdefault(room_id, set()).add(sid)

    await sio.emit(
        events.USER_JOINED,
        {"userId": user_id, "sessionId": sid},
        room=room_id,
        skip_sid=sid,
    )

    participants = [
        {"sessionId": s} for s in active_rooms[room_id] if s != sid
    ]

    return {"participants": participants}

@sio.event
async def leave_room(sid, data):
    room_id = data.get("roomId")
    user_id = data.get("userId")

    if room_id in active_rooms:
        active_rooms[room_id].discard(sid)
        await sio.leave_room(sid, room_id)

        await sio.emit(
            events.USER_LEFT,
            {"userId": user_id, "sessionId": sid},
            room=room_id,
        )

        if not active_rooms[room_id]:
            del active_rooms[room_id]

# ========================================
# WebRTC Signaling
# ========================================

@sio.event
async def webrtc_offer(sid, data):
    await sio.emit(
        events.WEBRTC_OFFER,
        {"offer": data["offer"], "fromSessionId": sid},
        room=data["targetSessionId"],
    )

@sio.event
async def webrtc_answer(sid, data):
    await sio.emit(
        events.WEBRTC_ANSWER,
        {"answer": data["answer"], "fromSessionId": sid},
        room=data["targetSessionId"],
    )

@sio.event
async def ice_candidate(sid, data):
    await sio.emit(
        events.ICE_CANDIDATE,
        {"candidate": data["candidate"], "fromSessionId": sid},
        room=data["targetSessionId"],
    )

# ========================================
# Collaboration Events
# ========================================

@sio.event
async def chat_message(sid, data):
    await sio.emit(
        events.NEW_CHAT_MESSAGE,
        data,
        room=data.get("roomId"),
        skip_sid=sid,
    )

@sio.event
async def whiteboard_update(sid, data):
    await sio.emit(
        events.WHITEBOARD_UPDATE,
        data,
        room=data.get("roomId"),
        skip_sid=sid,
    )

@sio.event
async def reaction(sid, data):
    await sio.emit(
        events.NEW_REACTION,
        data,
        room=data.get("roomId"),
        skip_sid=sid,
    )
