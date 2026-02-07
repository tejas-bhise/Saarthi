# app/schemas/requests.py

from pydantic import BaseModel, field_validator


class CreateRoomRequest(BaseModel):
    userId: str
    companionId: str  # tutor id from TUTORS
    subject: str

    @field_validator("subject")
    @classmethod
    def subject_not_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 2:
            raise ValueError("subject is required")
        return v.strip()


class ChatRequest(BaseModel):
    userId: str
    roomId: str
    question: str
    subject: str
    retryCount: int = 0
    companionId: str

    @field_validator("question")
    @classmethod
    def question_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:  # ✅ Changed from 3 to 1
            raise ValueError("Question too short")
        if len(v) > 1000:
            raise ValueError("Question too long (max 1000 chars)")
        return v
