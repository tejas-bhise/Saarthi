import requests
from ..config import get_settings

settings = get_settings()


def call_wolfram(query: str) -> str:
    """
    Call Wolfram Alpha API for mathematical calculations.
    """
    if not settings.wolfram_app_id:
        raise RuntimeError("WOLFRAM_APP_ID is not set in .env file")

    try:
        url = "http://api.wolframalpha.com/v1/result"
        params = {
            "appid": settings.wolfram_app_id,
            "i": query,
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 501:
            raise RuntimeError("Wolfram couldn't understand the question")
        
        response.raise_for_status()
        
        result = response.text.strip()
        
        if not result:
            raise RuntimeError("Wolfram returned empty result")
        
        return f"According to Wolfram Alpha: {result}"
    
    except Exception as e:
        print(f"❌ Wolfram API Error: {str(e)}")
        raise RuntimeError(f"Wolfram API failed: {str(e)}")
