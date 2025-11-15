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

    password: str  # hashed password (命名比較簡單也 OK)

    role: UserRole = Field(default=UserRole.CLIENT)

    create_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    update_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # === 反向關聯 ===
    # 該使用者作為委託人（client）所建立的專案列表
    client_projects: List["Project"] = Relationship(
        back_populates="client",
        sa_relationship_kwargs={"foreign_keys": "[Project.client_id]"},
    )

    # 該使用者作為接案人（worker）所承接的專案列表
    worker_projects: List["Project"] = Relationship(
        back_populates="worker",
        sa_relationship_kwargs={"foreign_keys": "[Project.worker_id]"},
    )
