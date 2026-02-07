# app/schemas/responses.py

from pydantic import BaseModel
from typing import List


class TutorSchema(BaseModel):
    id: str
    name: str
    subject: str
    avatar_3d: str
    avatar_image: str | None = None
    personality: str
    teaching_style: str

    class Config:
        from_attributes = True


class CompanionsResponse(BaseModel):
    tutors: List[TutorSchema]


class RoomResponse(BaseModel):
    roomId: str
    companionId: str
    subject: str
    participantCount: int
    createdAt: str
    expiresAt: str

class ChatResponse(BaseModel):
    answer: str
    source: str  # "gemini", "wolfram", or "groq"
    audioUrl: str | None = None  # will add later with ElevenLabs
