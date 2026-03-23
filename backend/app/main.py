from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio

from app.api.routes import chat, companions, auth, sessions
from app.services.database_service import init_database, close_database
from app.config import get_settings
from app.api.websocket.signaling import sio  # ✅ IMPORT EXISTING SOCKET.IO

settings = get_settings()

# ========================================
# Lifespan
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
# FastAPI App
# ========================================

fastapi_app = FastAPI(
    title="Saarthi AI API",
    version="2.0.0",
    lifespan=lifespan,
)

# ========================================
# CORS (LOCAL + VERCEL + RENDER)
# ========================================

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",

        "https://saarthi-ai-iota.vercel.app",
        "https://saarthi-ai-git-main-tejas-bhises-projects.vercel.app",
        "https://saarthi-exe0267af-tejas-bhises-projects.vercel.app",

        "https://*.vercel.app",
        "https://*.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# Routers
# ========================================

fastapi_app.include_router(auth.router)
fastapi_app.include_router(chat.router)
fastapi_app.include_router(companions.router)
fastapi_app.include_router(sessions.router)

# ========================================
# Health
# ========================================

@fastapi_app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Saarthi AI Backend",
        "version": "2.0.0",
    }

@fastapi_app.get("/health")
async def health():
    return {"status": "healthy"}

# ========================================
# FINAL ASGI APP
# ========================================

app = socketio.ASGIApp(sio, fastapi_app)