from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.db_models import User
from app.models.schemas import UploadResponse
from app.services.image_service import image_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["images"])


@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = await image_service.validate_and_save(db, user.id, file)
    return UploadResponse(id=record.id, url=record.url_path)
