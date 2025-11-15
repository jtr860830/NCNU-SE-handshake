from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class Deliverable(SQLModel, table=True):
    __tablename__: str = "deliverables"  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)

    project_id: Optional[int] = Field(foreign_key="projects.id")
    worker_id: Optional[int] = Field(foreign_key="users.id")

    file_url: str
    note: Optional[str] = None

    create_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    update_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # optional relationships
    project: Optional["Project"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Deliverable.project_id]"}
    )
    worker: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Deliverable.worker_id]"}
    )
