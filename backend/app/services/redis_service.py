# app/services/redis_service.py

import redis
from redis.exceptions import ConnectionError
from ..config import get_settings

settings = get_settings()


def get_redis_client() -> redis.Redis:
    """
    Returns a Redis client using UPSTASH_REDIS_URL.
    Works for both rediss:// (cloud) and redis:// (local).
    """

    if not settings.redis_url:
        raise RuntimeError("UPSTASH_REDIS_URL is not set in environment")

    try:
        client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )

        # light validation (does not break app if Upstash blocks ping)
        try:
            client.get("__healthcheck__")
        except Exception:
            pass

        return client

    except ConnectionError as e:
        raise RuntimeError(f"Failed to connect to Redis: {e}")


# singleton instance
redis_client = get_redis_client()
