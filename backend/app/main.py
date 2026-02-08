from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from contextlib import asynccontextmanager

from app.api.routes import chat, companions, auth, sessions
from app.services.database_service import init_database, close_database
from app.config import get_settings

settings = get_settings()

# ========================================
# Lifespan Event Handler
# ========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Saarthi AI Backend...")
    await init_database()
    print("✅ Database connected")
    yield
    print("🛑 Shutting down...")
    await close_database()
    print("✅ Database connection closed")

# ========================================
# Create FastAPI App
# ========================================

app = FastAPI(
    title="Saarthi AI API",
    version="2.0.0",
    lifespan=lifespan
)

# ========================================
# CORS Middleware (SINGLE, CORRECT)
# ========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://saarthi-ai-iota.vercel.app",
        "https://saarthi-ai-git-main-tejas-bhises-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# Create Socket.IO Server (CORS FIXED)
# ========================================

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "https://saarthi-ai-iota.vercel.app",
        "https://saarthi-ai-git-main-tejas-bhises-projects.vercel.app",
    ],
)

# ========================================
# Include Routers
# ========================================

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(companions.router)
app.include_router(sessions.router)

# ========================================
# Room Storage (In-Memory)
# ========================================

rooms = {}

# ========================================
# Socket.IO Event Handlers
# ========================================

@sio.on("connect")
async def connect(sid, environ):
    print(f"✅ Connected: {sid}")

@sio.on("disconnect")
async def disconnect(sid):
    print(f"❌ Disconnected: {sid}")
    for room_id, users in list(rooms.items()):
        rooms[room_id] = [u for u in users if u["sid"] != sid]
        if not rooms[room_id]:
            del rooms[room_id]

@sio.on("join-room")
async def join_room(sid, data):
    room_id = data["roomId"]
    user_id = data["userId"]

    print(f"👤 {user_id} joining {room_id}")

    if room_id not in rooms:
        rooms[room_id] = []

    existing = [u["userId"] for u in rooms[room_id]]
    rooms[room_id].append({"sid": sid, "userId": user_id})

    await sio.enter_room(sid, room_id)
    await sio.emit("existing-users", existing, to=sid)
    await sio.emit("user-joined", {"userId": user_id}, room=room_id, skip_sid=sid)

@sio.on("leave-room")
async def leave_room(sid, data):
    room_id = data["roomId"]
    user_id = data["userId"]

    if room_id in rooms:
        rooms[room_id] = [u for u in rooms[room_id] if u["sid"] != sid]

    await sio.leave_room(sid, room_id)
    await sio.emit("user-left", {"userId": user_id}, room=room_id)

@sio.on("chat-message")
async def handle_chat(sid, data):
    await sio.emit("chat-message", data, room=data["roomId"])

@sio.on("offer")
async def handle_offer(sid, data):
    room_id = data["roomId"]
    target_id = data["targetUserId"]

    if room_id in rooms:
        target_sid = next(
            (u["sid"] for u in rooms[room_id] if u["userId"] == target_id),
            None,
        )
        if target_sid:
            await sio.emit("offer", data, to=target_sid)

@sio.on("answer")
async def handle_answer(sid, data):
    room_id = data["roomId"]
    target_id = data["targetUserId"]

    if room_id in rooms:
        target_sid = next(
            (u["sid"] for u in rooms[room_id] if u["userId"] == target_id),
            None,
        )
        if target_sid:
            await sio.emit("answer", data, to=target_sid)

@sio.on("ice-candidate")
async def handle_ice(sid, data):
    room_id = data["roomId"]
    target_id = data["targetUserId"]

    if room_id in rooms:
        target_sid = next(
            (u["sid"] for u in rooms[room_id] if u["userId"] == target_id),
            None,
        )
        if target_sid:
            await sio.emit("ice-candidate", data, to=target_sid)

# ========================================
# Root & Health
# ========================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Saarthi AI Backend",
        "version": "2.0.0",
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ========================================
# ASGI APP (FINAL, CORRECT)
# ========================================

app = socketio.ASGIApp(sio, app)
