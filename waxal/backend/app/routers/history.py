from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import crud
from app.db.database import get_db
from app.exceptions import NotFoundError
from app.models.db_models import CaptionRecord, User
from app.models.schemas import FavoriteRequest, HistoryItem
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/v1/history", tags=["history"])


def _to_item(db: Session, record: CaptionRecord) -> HistoryItem:
    return HistoryItem(
        id=record.id,
        image_url=crud.image_url_for(db, record.image_id),
        captions=record.captions or [],
        image_description=record.ai_description or "",
        tone=record.tone,
        platform=record.platform,
        language=record.language,
        is_favorite=record.is_favorite,
        created_at=record.created_at,
    )


@router.get("", response_model=List[HistoryItem])
def list_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = crud.list_history(db, user.id, limit=limit, offset=offset)
    return [_to_item(db, r) for r in records]


@router.delete("/{item_id}")
def delete_history(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = crud.get_history_item(db, item_id, user.id)
    if record is None:
        raise NotFoundError("History item not found.")
    crud.delete_history_item(db, record)
    return {"success": True}


@router.post("/{item_id}/favorite", response_model=HistoryItem)
def toggle_favorite(
    item_id: int,
    payload: FavoriteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = crud.get_history_item(db, item_id, user.id)
    if record is None:
        raise NotFoundError("History item not found.")
    record = crud.set_favorite(db, record, payload.favorite)
    return _to_item(db, record)
