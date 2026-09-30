import os
import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import crud
from app.exceptions import InvalidImageError
from app.models.db_models import ImageRecord

# Magic-byte signatures — the browser's content-type header is easy to spoof,
# so the actual bytes decide the media type.
_SIGNATURES = (
    (b"\xff\xd8\xff", "image/jpeg", "jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", "png"),
    (b"RIFF", "image/webp", "webp"),  # + "WEBP" at offset 8, checked below
)


def _detect_media_type(contents: bytes) -> tuple[str, str]:
    for magic, media_type, ext in _SIGNATURES:
        if contents.startswith(magic):
            if media_type == "image/webp" and contents[8:12] != b"WEBP":
                continue
            return media_type, ext
    raise InvalidImageError("Only JPG, PNG, or WEBP images are allowed.")


class ImageService:
    async def validate_and_save(
        self, db: Session, user_id: int, file: UploadFile
    ) -> ImageRecord:
        settings = get_settings()

        contents = await file.read()
        if not contents:
            raise InvalidImageError("The uploaded file is empty.")

        size_mb = len(contents) / (1024 * 1024)
        if size_mb > settings.max_image_size_mb:
            raise InvalidImageError(
                f"Image must be under {settings.max_image_size_mb}MB."
            )

        media_type, ext = _detect_media_type(contents)

        filename = f"{uuid.uuid4().hex}.{ext}"
        os.makedirs(settings.upload_dir, exist_ok=True)
        filepath = os.path.join(settings.upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(contents)

        return crud.create_image(
            db,
            user_id=user_id,
            filename=filename,
            url_path=f"/uploads/{filename}",
            media_type=media_type,
        )

    def path_for(self, record: ImageRecord) -> str:
        settings = get_settings()
        return os.path.join(settings.upload_dir, record.filename)


image_service = ImageService()
