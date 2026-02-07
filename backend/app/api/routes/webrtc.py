# app/api/routes/webrtc.py

from fastapi import APIRouter
from ...config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/webrtc/config")
async def get_webrtc_config():
    """
    Return STUN/TURN server configuration for WebRTC connections.
    """
    return {
        "iceServers": [
            {"urls": settings.stun_server},
            {
                "urls": settings.turn_server,
                "username": settings.turn_username,
                "credential": settings.turn_credential,
            },
        ]
    }
