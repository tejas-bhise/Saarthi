# app/config.py

import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Project root = one level above "app"
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))  # .../backend/app
ROOT_DIR = os.path.dirname(ROOT_DIR)                   # .../backend
ENV_PATH = os.path.join(ROOT_DIR, ".env")
load_dotenv(ENV_PATH)


class Settings(BaseSettings):
    # Environment
    env: str = "development"
    debug: bool = True

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # AI Services
    gemini_api_key: str = ""
    wolfram_app_id: str = ""
    groq_api_key: str = ""

    # Voice
    elevenlabs_api_key: str = ""
    elevenlabs_default_voice_id: str = ""

    # Redis
    upstash_redis_url: str = ""

    # Database
    database_url: str = ""

    # JWT Authentication
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 10080

    # WebRTC
    stun_server: str = "stun:stun.l.google.com:19302"
    turn_server: str = "turn:openrelay.metered.ca:80"
    turn_username: str = "openrelayproject"
    turn_credential: str = "openrelayproject"

    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    model_config = {
        "extra": "ignore",
        "env_file": ".env",
        "case_sensitive": False
    }
    
    def get_cors_origins_list(self) -> list[str]:
        """Convert comma-separated CORS string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def redis_url(self) -> str:
        """Alias for upstash_redis_url"""
        return self.upstash_redis_url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
