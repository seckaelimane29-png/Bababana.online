from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Tone(str, Enum):
    WITTY = "witty"
    PROFESSIONAL = "professional"
    POETIC = "poetic"
    CASUAL = "casual"
    HYPE = "hype"


class Platform(str, Enum):
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"


class CaptionLanguage(str, Enum):
    """Language of the generated captions (not of the UI)."""

    WOLOF = "wolof"            # Wolof with natural French borrowings (default)
    WOLOF_PURE = "wolof_pure"  # strictly Wolof, no French mixing
    FRENCH = "french"


class CaptionRequest(BaseModel):
    image_id: int
    tone: Tone = Tone.CASUAL
    platform: Platform = Platform.INSTAGRAM
    language: CaptionLanguage = CaptionLanguage.WOLOF
    include_hashtags: bool = True
    max_length: Optional[int] = Field(default=None, ge=10, le=2200)
    context: Optional[str] = Field(default=None, max_length=500)
    count: int = Field(default=3, ge=1, le=5)


class CaptionVariant(BaseModel):
    id: str
    text: str
    hashtags: List[str] = []
    tone: Tone
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)


class CaptionResponse(BaseModel):
    captions: List[CaptionVariant]
    image_description: str
    generated_at: datetime
    history_id: int
    generations_left: Optional[int] = None


class RefineRequest(BaseModel):
    original_caption: str = Field(max_length=3000)
    instruction: str = Field(max_length=500)
    tone: Tone
    platform: Platform
    language: CaptionLanguage = CaptionLanguage.WOLOF


class HistoryItem(BaseModel):
    id: int
    image_url: str
    captions: List[CaptionVariant]
    image_description: str = ""
    tone: Tone
    platform: Platform
    language: CaptionLanguage = CaptionLanguage.WOLOF
    is_favorite: bool = False
    created_at: datetime


class FavoriteRequest(BaseModel):
    favorite: bool


class UploadResponse(BaseModel):
    id: int
    url: str


# ---------- Auth / account ----------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    plan: str
    pro_expires_at: Optional[datetime] = None
    generations_used: int
    generations_limit: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Billing ----------

class PlanInfo(BaseModel):
    name: str
    monthly_generations: int
    price_fcfa: int


class PlansResponse(BaseModel):
    free: PlanInfo
    pro: PlanInfo
    payment_ready: bool
