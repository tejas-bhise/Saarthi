"""
Pydantic models for user authentication
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ========================================
# Request Models (Input)
# ========================================

class UserSignupRequest(BaseModel):
    """
    Signup request body
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "omkar@example.com",
                "password": "securepass123",
                "name": "Omkar Sharma"
            }
        }
    }


class UserLoginRequest(BaseModel):
    """
    Login request body
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "omkar@example.com",
                "password": "securepass123"
            }
        }
    }


# ========================================
# Response Models (Output)
# ========================================

class UserResponse(BaseModel):
    """
    User info (public, no password)
    """
    id: int
    email: str
    name: str
    created_at: datetime
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "omkar@example.com",
                "name": "Omkar Sharma",
                "created_at": "2026-02-07T10:30:00"
            }
        }
    }


class TokenResponse(BaseModel):
    """
    JWT token response
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "omkar@example.com",
                    "name": "Omkar Sharma",
                    "created_at": "2026-02-07T10:30:00"
                }
            }
        }
    }


class MessageResponse(BaseModel):
    """
    Generic message response
    """
    message: str
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "Operation successful"
            }
        }
    }


# ========================================
# Session Models
# ========================================

class SessionResponse(BaseModel):
    """
    Learning session info
    """
    id: int
    session_id: str
    tutor_id: str
    subject: Optional[str]
    created_at: datetime
    last_active: datetime
    message_count: Optional[int] = 0
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "session_id": "room_abc123",
                "tutor_id": "omkar_ai",
                "subject": "AI & ML",
                "created_at": "2026-02-07T10:00:00",
                "last_active": "2026-02-07T11:30:00",
                "message_count": 15
            }
        }
    }


class MessageModel(BaseModel):
    """
    Chat message
    """
    id: int
    role: str
    content: str
    timestamp: datetime
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "role": "user",
                "content": "What is machine learning?",
                "timestamp": "2026-02-07T10:30:00"
            }
        }
    }
