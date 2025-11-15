from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from app.models.user import User


class ProjectStatus(str, Enum):
    OPEN = "open"  # 委託人建立，尚未有人承接
    IN_PROGRESS = "in_progress"  # 已被接案人承接
    COMPLETED = "completed"  # 已交付並被接受
    REJECTED = "rejected"  # 委託人退件


class Project(SQLModel, table=True):
    __tablename__: str = "projects"  #  type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)

    title: str
    description: str

    # 由哪個委託人建立
    client_id: Optional[int] = Field(foreign_key="users.id")

    # 由哪個接案人承接，剛建立專案時為 None
    worker_id: Optional[int] = Field(default=None, foreign_key="users.id")

    # 專案狀態
    status: ProjectStatus = Field(default=ProjectStatus.OPEN)

    # 建立 / 更新時間
    create_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    update_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # 反向關聯（非必要但未來可用）
    client: Optional["User"] = Relationship(back_populates="client_projects")
    worker: Optional["User"] = Relationship(back_populates="worker_projects")
