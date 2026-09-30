from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.db_models import CaptionRecord, ImageRecord, User


def _current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def effective_plan(user: User) -> str:
    """A Pro plan that has expired counts as free."""
    if user.plan == "pro" and user.pro_expires_at is not None:
        if user.pro_expires_at < datetime.utcnow():
            return "free"
    return user.plan


def generations_limit(user: User) -> int:
    settings = get_settings()
    if effective_plan(user) == "pro":
        return settings.pro_monthly_generations
    return settings.free_monthly_generations


def reset_usage_if_new_month(db: Session, user: User) -> None:
    month = _current_month()
    if user.usage_month != month:
        user.usage_month = month
        user.generations_used = 0
        db.commit()


def generations_left(user: User) -> int:
    return max(0, generations_limit(user) - user.generations_used)


def record_generation(db: Session, user: User) -> None:
    user.generations_used += 1
    db.commit()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, email: str, hashed_password: str, display_name: str) -> User:
    user = User(
        email=email.lower(),
        hashed_password=hashed_password,
        display_name=display_name,
        usage_month=_current_month(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_image(db: Session, image_id: int, user_id: int) -> Optional[ImageRecord]:
    return (
        db.query(ImageRecord)
        .filter(ImageRecord.id == image_id, ImageRecord.user_id == user_id)
        .first()
    )


def create_image(
    db: Session, user_id: int, filename: str, url_path: str, media_type: str
) -> ImageRecord:
    record = ImageRecord(
        user_id=user_id, filename=filename, url_path=url_path, media_type=media_type
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def create_history(
    db: Session,
    user_id: int,
    image_id: int,
    captions: list,
    tone: str,
    platform: str,
    language: str,
    ai_description: str,
) -> CaptionRecord:
    record = CaptionRecord(
        user_id=user_id,
        image_id=image_id,
        captions=captions,
        tone=tone,
        platform=platform,
        language=language,
        ai_description=ai_description,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_history(
    db: Session, user_id: int, limit: int = 20, offset: int = 0
) -> List[CaptionRecord]:
    return (
        db.query(CaptionRecord)
        .filter(CaptionRecord.user_id == user_id)
        .order_by(CaptionRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_history_item(db: Session, item_id: int, user_id: int) -> Optional[CaptionRecord]:
    return (
        db.query(CaptionRecord)
        .filter(CaptionRecord.id == item_id, CaptionRecord.user_id == user_id)
        .first()
    )


def delete_history_item(db: Session, record: CaptionRecord) -> None:
    db.delete(record)
    db.commit()


def set_favorite(db: Session, record: CaptionRecord, favorite: bool) -> CaptionRecord:
    record.is_favorite = favorite
    db.commit()
    db.refresh(record)
    return record


def image_url_for(db: Session, image_id: int) -> str:
    record = db.get(ImageRecord, image_id)
    return record.url_path if record else ""
