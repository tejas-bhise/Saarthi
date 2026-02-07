# app/models/session_summary.py

from pydantic import BaseModel
from typing import List
from datetime import datetime


class SessionSummary(BaseModel):
    user_id: str
    room_id: str
    tutor_id: str
    subject: str
    topics_covered: List[str]
    questions_asked: List[str]
    learning_style: str  # e.g., "visual", "example-based", "theoretical"
    knowledge_gaps: List[str]
    recommended_next_topics: List[str]
    created_at: datetime
