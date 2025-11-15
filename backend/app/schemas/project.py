from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel

from app.models.project import ProjectStatus


class ProjectBase(SQLModel):
    title: str
    description: str
    status: ProjectStatus = ProjectStatus.OPEN


# === Create ===
class ProjectCreate(SQLModel):
    title: str
    description: str


# === Update ===
class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    worker_id: Optional[int] = None  # 用於接案人承接專案


# === Read ===
class ProjectRead(ProjectBase):
    id: int
    client_id: int
    worker_id: Optional[int]
    create_at: datetime
    update_at: datetime
