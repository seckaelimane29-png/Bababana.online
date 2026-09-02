import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import crud
from app.db.database import get_db
from app.exceptions import NotFoundError, QuotaExceededError
from app.models.db_models import User
from app.models.schemas import (
    CaptionRequest,
    CaptionResponse,
    CaptionVariant,
    RefineRequest,
)
from app.services.claude_service import claude_service
from app.services.image_service import image_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["captions"])


def _check_quota(db: Session, user: User) -> None:
    crud.reset_usage_if_new_month(db, user)
    if crud.generations_left(user) <= 0:
        if crud.effective_plan(user) == "free":
            raise QuotaExceededError(
                "You've used all your free captions this month. "
                "Upgrade to Pro to keep going."
            )
        raise QuotaExceededError(
            "You've reached this month's Pro limit. It resets next month."
        )


@router.post("/generate", response_model=CaptionResponse)
async def generate_captions(
    payload: CaptionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_quota(db, user)

    image = crud.get_image(db, payload.image_id, user.id)
    if image is None:
        raise NotFoundError("Image not found. Upload it again.")
    image_path = image_service.path_for(image)
    if not os.path.exists(image_path):
        raise NotFoundError("Image file is gone from the server. Upload it again.")

    result = await claude_service.generate_captions(
        image_path=image_path, media_type=image.media_type, request=payload
    )

    crud.record_generation(db, user)
    history = crud.create_history(
        db,
        user_id=user.id,
        image_id=image.id,
        captions=[c.model_dump(mode="json") for c in result["captions"]],
        tone=payload.tone.value,
        platform=payload.platform.value,
        language=payload.language.value,
        ai_description=result["image_description"],
    )

    return CaptionResponse(
        captions=result["captions"],
        image_description=result["image_description"],
        generated_at=result["generated_at"],
        history_id=history.id,
        generations_left=crud.generations_left(user),
    )


@router.post("/refine", response_model=CaptionVariant)
async def refine_caption(
    payload: RefineRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Refinements are lighter than generations; they don't consume quota,
    # but they do require an account.
    return await claude_service.refine_caption(payload)
