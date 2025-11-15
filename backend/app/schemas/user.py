from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel

from app.models.user import UserRole


class UserBase(SQLModel):
    username: str
    role: UserRole


class UserCreate(SQLModel):
    username: str
    password: str
    role: UserRole = UserRole.CLIENT


class UserLogin(SQLModel):
    username: str
    password: str


class UserRead(UserBase):
    id: int
    create_at: datetime
    update_at: datetime


class UserUpdate(SQLModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
