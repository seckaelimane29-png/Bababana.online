from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(80), nullable=False)
    plan = Column(String(20), default="free", nullable=False)  # free | pro
    pro_expires_at = Column(DateTime, nullable=True)
    generations_used = Column(Integer, default=0, nullable=False)
    usage_month = Column(String(7), default="", nullable=False)  # "YYYY-MM"
    created_at = Column(DateTime, default=datetime.utcnow)


class ImageRecord(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    url_path = Column(String(500), nullable=False)
    media_type = Column(String(50), nullable=False, default="image/jpeg")
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class CaptionRecord(Base):
    __tablename__ = "captions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    captions = Column(JSON, default=list, nullable=False)  # list of CaptionVariant dicts
    tone = Column(String(50), nullable=False)
    platform = Column(String(50), nullable=False)
    language = Column(String(20), nullable=False, default="wolof")
    ai_description = Column(Text, default="")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
