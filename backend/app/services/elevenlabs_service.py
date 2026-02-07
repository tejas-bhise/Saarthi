import requests
import time
from ..config import get_settings

settings = get_settings()

# ============================================
# 🎙️ STANDARD FREE ELEVENLABS VOICES
# These are the default voices available to all free tier users
# ============================================
VOICE_ID_MAP = {
    # Standard pre-made voices (free tier)
    "omkar_ai": "pNInz6obpgDQGcFmaJgB",        # Adam - Deep male voice
    "priya_biology": "21m00Tcm4TlvDq8ikWAM",   # Rachel - Clear female voice
}

DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam


def generate_speech(text: str, voice_key: str, retry_on_rate_limit: bool = True) -> bytes:
    """
    Generate speech audio using ElevenLabs API.
    
    Args:
        text: The text to convert to speech (max 500 chars)
        voice_key: Key from VOICE_ID_MAP
        retry_on_rate_limit: Whether to retry on rate limits
    
    Returns:
        Audio bytes (MP3 format)
    """
    if not settings.elevenlabs_api_key:
        raise RuntimeError("ELEVENLABS_API_KEY is not set")

    voice_id = VOICE_ID_MAP.get(voice_key, DEFAULT_VOICE_ID)
    print(f"🎤 Using ElevenLabs voice: {voice_key} → {voice_id}")

    # Truncate text
    truncated_text = text[:500]
    if len(text) > 500:
        truncated_text += "..."

    # Use non-streaming endpoint (more reliable)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": settings.elevenlabs_api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": truncated_text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    try:
        print(f"📡 Calling ElevenLabs API...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 401:
            raise RuntimeError("Invalid ElevenLabs API key")
        elif response.status_code == 402:
            raise RuntimeError("Voice requires payment or quota exceeded")
        elif response.status_code == 429:
            if retry_on_rate_limit:
                print("⏳ Rate limit, waiting 3s...")
                time.sleep(3)
                return generate_speech(text, voice_key, retry_on_rate_limit=False)
            raise RuntimeError("Rate limit exceeded")
        
        response.raise_for_status()
        
        audio_bytes = response.content
        print(f"✅ Generated {len(audio_bytes)} bytes of audio")
        return audio_bytes
    
    except requests.exceptions.RequestException as e:
        print(f"❌ ElevenLabs request failed: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"❌ Response body: {e.response.text}")
        raise RuntimeError(f"ElevenLabs API error: {str(e)}")
