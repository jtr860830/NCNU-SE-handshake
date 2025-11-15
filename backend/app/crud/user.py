from typing import Optional, Sequence

from sqlmodel import Session, select
from datetime import datetime, timezone

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.security import hash_password, verify_password


# ---------------------------------------------------------
# Read
# ---------------------------------------------------------


def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)


def get_user_by_username(session: Session, username: str) -> Optional[User]:
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()


# ---------------------------------------------------------
# Create
# ---------------------------------------------------------


def create_user(session: Session, data: UserCreate) -> User:
    user = User(
        username=data.username,
        password=hash_password(data.password),
        role=data.role,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


# ---------------------------------------------------------
# Update
# ---------------------------------------------------------


def update_user(session: Session, user: User, data: UserUpdate) -> User:
    if data.username is not None:
        user.username = data.username

    if data.password is not None:
        user.password = hash_password(data.password)

    if data.role is not None:
        user.role = data.role

    user.update_at = datetime.now(timezone.utc)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


# ---------------------------------------------------------
# Authentication Helper
# ---------------------------------------------------------


def authenticate_user(session: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(session, username)
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


# ---------------------------------------------------------
# List (optional)
# ---------------------------------------------------------


def list_users(session: Session) -> Sequence[User]:
    return session.exec(select(User)).all()
