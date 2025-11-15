from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project


class UserRole(str, Enum):
    CLIENT = "client"  # 委託人
    WORKER = "worker"  # 接案人


class User(SQLModel, table=True):
    __tablename__: str = "users"  #  type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password: str  # hashed password
    role: UserRole = Field(default=UserRole.CLIENT)
    create_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    update_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))