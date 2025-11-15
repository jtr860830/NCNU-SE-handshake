from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.crud.user import (
    create_user,
    authenticate_user,
    get_user_by_username,
)
from app.security import create_access_token


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
def login(
    data: UserLogin,
    session: Session = Depends(get_session),
):
    user = authenticate_user(session, data.username, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token({"sub": user.username})

    return {
        "access_token": token,
        "token_type": "bearer",
    }
