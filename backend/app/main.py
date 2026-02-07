from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from contextlib import asynccontextmanager

from app.api.routes import chat, companions, auth, sessions
from app.services.database_service import init_database, close_database  # ✅ NEW
from app.config import get_settings
settings = get_settings()


# ========================================
# Lifespan Event Handler (Startup/Shutdown)
# ========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup and shutdown
    """
    # STARTUP
    print("🚀 Starting Saarthi AI Backend...")
    
    # Initialize database connection
    await init_database()
    print("✅ Database connected")
    
    yield  # App runs here
    
    # SHUTDOWN
    print("🛑 Shutting down...")
    await close_database()
    print("✅ Database connection closed")


# ========================================
# Create Socket.io Server
# ========================================

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)


# ========================================
# Create FastAPI App
# ========================================

app = FastAPI(
    title="Saarthi AI API",
    version="2.0.0",
    lifespan=lifespan  # ✅ Add lifespan handler
)


# ========================================
# CORS Middleware
# ========================================

# Get settings
# Get settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ========================================
# Include Routers
# ========================================

app.include_router(auth.router)  # Already has prefix="/api/auth" in auth.py
app.include_router(chat.router)  # Already has prefix in chat.py
app.include_router(companions.router)  # Already has prefix in companions.py
app.include_router(sessions.router)  # Already has prefix="/api/sessions" in sessions.py


# ========================================
# Room Storage (In-Memory)
# ========================================

rooms = {}


# ========================================
# Socket.io Event Handlers
# ========================================

@sio.on('connect')
async def connect(sid, environ):
    print(f'✅ Connected: {sid}')


@sio.on('disconnect')
async def disconnect(sid):
    print(f'❌ Disconnected: {sid}')
    for room_id, users in list(rooms.items()):
        rooms[room_id] = [u for u in users if u['sid'] != sid]
        if not rooms[room_id]:
            del rooms[room_id]


@sio.on('join-room')
async def join_room(sid, data):
    room_id = data['roomId']
    user_id = data['userId']
    
    print(f'👤 {user_id} joining {room_id}')
    
    if room_id not in rooms:
        rooms[room_id] = []
    
    existing = [u['userId'] for u in rooms[room_id]]
    rooms[room_id].append({'sid': sid, 'userId': user_id})
    
    await sio.enter_room(sid, room_id)
    await sio.emit('existing-users', existing, to=sid)
    await sio.emit('user-joined', {'userId': user_id}, room=room_id, skip_sid=sid)
    
    print(f'✅ Room {room_id}: {len(rooms[room_id])} users')


@sio.on('leave-room')
async def leave_room(sid, data):
    room_id = data['roomId']
    user_id = data['userId']
    
    if room_id in rooms:
        rooms[room_id] = [u for u in rooms[room_id] if u['sid'] != sid]
    
    await sio.leave_room(sid, room_id)
    await sio.emit('user-left', {'userId': user_id}, room=room_id)
    print(f'👋 {user_id} left {room_id}')


@sio.on('chat-message')
async def handle_chat(sid, data):
    room_id = data['roomId']
    
    # Broadcast to ALL users in room (including sender)
    await sio.emit('chat-message', {
        'message': data['message'],
        'userId': data['userId'],
        'sender': data.get('sender', 'user'),
        'timestamp': data['timestamp']
    }, room=room_id)
    
    print(f'💬 Chat in {room_id}: {data["message"][:50]}...')


@sio.on('offer')
async def handle_offer(sid, data):
    room_id = data['roomId']
    target_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_id), None)
        if target_sid:
            await sio.emit('offer', {
                'offer': data['offer'],
                'fromUserId': data.get('fromUserId', sid)
            }, to=target_sid)
            print(f'📤 Offer → {target_id}')


@sio.on('answer')
async def handle_answer(sid, data):
    room_id = data['roomId']
    target_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_id), None)
        if target_sid:
            await sio.emit('answer', {
                'answer': data['answer'],
                'fromUserId': data.get('fromUserId', sid)
            }, to=target_sid)
            print(f'📤 Answer → {target_id}')


@sio.on('ice-candidate')
async def handle_ice(sid, data):
    room_id = data['roomId']
    target_id = data['targetUserId']
    
    if room_id in rooms:
        target_sid = next((u['sid'] for u in rooms[room_id] if u['userId'] == target_id), None)
        if target_sid:
            await sio.emit('ice-candidate', {
                'candidate': data['candidate'],
                'fromUserId': data.get('fromUserId', sid)
            }, to=target_sid)


# ========================================
# Root Endpoint
# ========================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Saarthi AI Backend",
        "version": "2.0.0",
        "features": ["auth", "chat", "3d-avatar", "voice"]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# ========================================
# Wrap with Socket.io
# ========================================

socket_app = socketio.ASGIApp(sio, app)
