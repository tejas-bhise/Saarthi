import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Create Socket.io server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Simple FastAPI app
app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Room storage
rooms = {}

# Socket.io events
@sio.event
async def connect(sid, environ):
    print(f'✅ Socket.io client connected: {sid}')

@sio.event
async def disconnect(sid):
    print(f'❌ Socket.io client disconnected: {sid}')
    for room_id, users in list(rooms.items()):
        rooms[room_id] = [u for u in users if u['sid'] != sid]
        if not rooms[room_id]:
            del rooms[room_id]

@sio.event
async def join_room(sid, data):
    room_id = data['roomId']
    user_id = data['userId']
    
    print(f'👤 User {user_id} joining room {room_id}')
    
    if room_id not in rooms:
        rooms[room_id] = []
    
    existing_users = [u['userId'] for u in rooms[room_id]]
    rooms[room_id].append({'sid': sid, 'userId': user_id})
    await sio.enter_room(sid, room_id)
    
    await sio.emit('existing-users', existing_users, room=sid)
    await sio.emit('user-joined', {'userId': user_id}, room=room_id, skip_sid=sid)
    print(f'✅ Room {room_id} now has {len(rooms[room_id])} users')

@sio.event
async def leave_room(sid, data):
    room_id = data['roomId']
    user_id = data['userId']
    
    if room_id in rooms:
        rooms[room_id] = [u for u in rooms[room_id] if u['sid'] != sid]
    
    await sio.leave_room(sid, room_id)
    await sio.emit('user-left', {'userId': user_id}, room=room_id)
    print(f'👋 User {user_id} left room {room_id}')

@sio.event
async def offer(sid, data):
    room_id = data['roomId']
    target_user_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_user_id), None)
        if target_sid:
            await sio.emit('offer', {
                'offer': data['offer'],
                'fromUserId': data.get('fromUserId', sid)
            }, room=target_sid)

@sio.event
async def answer(sid, data):
    room_id = data['roomId']
    target_user_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_user_id), None)
        if target_sid:
            await sio.emit('answer', {
                'answer': data['answer'],
                'fromUserId': data.get('fromUserId', sid)
            }, room=target_sid)

@sio.event
async def ice_candidate(sid, data):
    room_id = data['roomId']
    target_user_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_user_id), None)
        if target_sid:
            await sio.emit('ice-candidate', {
                'candidate': data['candidate'],
                'fromUserId': data.get('fromUserId', sid)
            }, room=target_sid)

# Wrap with Socket.io
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    uvicorn.run("socketio_server:socket_app", host="0.0.0.0", port=9000, reload=True)
