"""
Security utilities for JWT authentication and password hashing
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings

settings = get_settings()

# ========================================
# Password Hashing (STABLE FIX)
# ========================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    # bcrypt expects string
    password = str(password)

    # ensure max 72 bytes for bcrypt compatibility
    password_bytes = password.encode("utf-8")
    password_bytes = password_bytes[:72]

    return pwd_context.hash(password_bytes.decode("utf-8", errors="ignore"))


def verify_password(plain_password, hashed_password):
    plain_password = str(plain_password)

    password_bytes = plain_password.encode("utf-8")
    password_bytes = password_bytes[:72]

    return pwd_context.verify(
        password_bytes.decode("utf-8", errors="ignore"),
        hashed_password
    )


# ========================================
# JWT Token Generation
# ========================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )

    return encoded_jwt


# ========================================
# JWT Token Verification
# ========================================

security = HTTPBearer()


def verify_token(token: str) -> dict:

    try:

        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )

        email: str = payload.get("sub")

        if email is None:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ========================================
# Dependency: Get Current User from Token
# ========================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:

    token = credentials.credentials

    payload = verify_token(token)

    return payload


# ========================================
# Optional Authentication
# ========================================

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[dict]:

    if credentials is None:

        return None

    try:

        return await get_current_user(credentials)

    except HTTPException:

        return None