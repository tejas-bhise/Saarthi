from time import time
from fastapi import Request, HTTPException

REQUESTS_PER_MINUTE = 30
WINDOW = 60  # seconds

users = {}


async def rate_limiter(request: Request, call_next):
    try:
        body = await request.json()
    except:
        return await call_next(request)

    user_id = body.get("user_id")

    if not user_id:
        return await call_next(request)

    now = time()

    if user_id not in users:
        users[user_id] = []

    # remove old timestamps
    users[user_id] = [t for t in users[user_id] if now - t < WINDOW]

    if len(users[user_id]) >= REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait 30 seconds."
        )

    users[user_id].append(now)

    return await call_next(request)
