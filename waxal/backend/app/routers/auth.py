from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import crud
from app.db.database import get_db
from app.exceptions import AuthError, WaxalError
from app.models.db_models import User
from app.models.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from app.utils.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def user_out(db: Session, user: User) -> UserOut:
    crud.reset_usage_if_new_month(db, user)
    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        plan=crud.effective_plan(user),
        pro_expires_at=user.pro_expires_at,
        generations_used=user.generations_used,
        generations_limit=crud.generations_limit(user),
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise WaxalError(
            "EMAIL_TAKEN", "An account with this email already exists.", 409
        )
    user = crud.create_user(
        db,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name.strip(),
    )
    return TokenResponse(
        access_token=create_access_token(user.id), user=user_out(db, user)
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise AuthError("Wrong email or password.", code="BAD_CREDENTIALS")
    return TokenResponse(
        access_token=create_access_token(user.id), user=user_out(db, user)
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_out(db, user)
