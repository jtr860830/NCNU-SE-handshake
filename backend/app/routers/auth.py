from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.database import get_session
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.crud.user import (
    create_user,
    authenticate_user,
    get_user_by_username,
)
from app.security import create_access_token
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["auth"])


# ------------------------------------------------------
# Register
# ------------------------------------------------------
@router.post("/register", response_model=UserRead)
def register_user(
    data: UserCreate,
    session: Session = Depends(get_session),
):
    existing = get_user_by_username(session, data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    user = create_user(session, data)
    return user


# ------------------------------------------------------
# Login
# ------------------------------------------------------
@router.post("/login")
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user: User | None = authenticate_user(
        session,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login/json")
def login_json(
    data: UserLogin,
    session: Session = Depends(get_session),
):
    user: User | None = authenticate_user(
        session,
        data.username,
        data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
    }