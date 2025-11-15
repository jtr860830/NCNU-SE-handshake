from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class Quote(SQLModel, table=True):
    __tablename__: str = "quotes"  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)

    project_id: Optional[int] = Field(foreign_key="projects.id")
    worker_id: Optional[int] = Field(foreign_key="users.id")

    amount: float
    days: int

    create_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    update_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # 關聯（可選，但非常有用）
    project: Optional["Project"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Quote.project_id]"}
    )
    worker: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Quote.worker_id]"}
    )
