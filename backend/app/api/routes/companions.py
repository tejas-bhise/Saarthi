# app/api/routes/companions.py

from fastapi import APIRouter
from ...utils.constants import TUTORS
from ...schemas.responses import CompanionsResponse, TutorSchema

router = APIRouter()


@router.get("/companions", response_model=CompanionsResponse)
async def get_companions() -> CompanionsResponse:
    tutors_list = []

    for tutor_id, cfg in TUTORS.items():
        tutors_list.append(
            TutorSchema(
                id=cfg["id"],
                name=cfg["name"],
                subject=cfg["subject"],
                avatar_3d=cfg["avatar_3d"],
                avatar_image=cfg.get("avatar_image"),
                personality=cfg.get("personality", ""),
                teaching_style=cfg.get("teaching_style", ""),
            )
        )

    return CompanionsResponse(tutors=tutors_list)
