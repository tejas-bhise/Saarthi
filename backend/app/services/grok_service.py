import os
import httpx
from typing import Optional


GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"


def call_grok_api(
    prompt: str,
    system_prompt: str = "You are a helpful AI tutor.",
    max_tokens: int = 500,
    temperature: float = 0.7
) -> Optional[str]:
    """
    Call xAI Grok API (synchronous version for compatibility)
    """
    if not GROK_API_KEY:
        print("❌ GROK_API_KEY not set")
        return None

    try:
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "grok-beta",  # Use grok-beta or grok-2-latest
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(GROK_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            answer = data["choices"][0]["message"]["content"]
            
            print(f"✅ Grok API success: {answer[:100]}...")
            return answer

    except Exception as e:
        print(f"❌ Grok API error: {e}")
        return None
