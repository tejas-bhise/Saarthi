# app/models/room.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Room(BaseModel):
    room_id: str
    subject: str
    tutor_id: str
    created_by: str
    created_at: datetime
    expires_at: datetime
    participant_count: int = 1
