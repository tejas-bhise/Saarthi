# backend/app/services/gemini_service.py

import google.generativeai as genai
import time
from ..config import get_settings

settings = get_settings()

# --------------------------------------------------
# Configure Gemini
# --------------------------------------------------

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)
else:
    print("⚠️ GEMINI_API_KEY not found in environment")


# --------------------------------------------------
# Primary Gemini Caller (your existing logic)
# --------------------------------------------------

def call_gemini(prompt: str, model_name: str = "gemini-2.5-flash", retry_count: int = 0) -> str:

    """
    Call Google Gemini API with the given prompt.
    Returns text response.
    """

    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in .env file")

    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise RuntimeError("Gemini returned empty response")

        return response.text.strip()

    except Exception as e:
        error_msg = str(e)
        print(f"❌ Gemini API Error: {error_msg}")

        # Retry on rate limit
        if "429" in error_msg and retry_count < 2:
            print(f"⏳ Rate limit hit, retrying in 30s ({retry_count + 1}/2)")
            time.sleep(30)
            return call_gemini(prompt, model_name, retry_count + 1)

        raise RuntimeError(f"Gemini API failed: {error_msg}")


# --------------------------------------------------
# ✅ Alias for Router Compatibility
# --------------------------------------------------

def call_gemini_api(prompt: str, system_prompt: str = "", max_tokens: int = 500):
    """
    Wrapper used by ai_router.py
    """
    return call_gemini(prompt)
