# app/models/tutor.py

from pydantic import BaseModel


class Tutor(BaseModel):
    id: str
    name: str
    subject: str
    avatar_3d: str
    avatar_image: str | None = None
    voice_key: str
    personality: str
    teaching_style: str
    prompt_template: str
