from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class DeliverableCreate(SQLModel):
    file_url: str
    note: Optional[str] = None


class DeliverableRead(SQLModel):
    id: int
    project_id: int
    worker_id: int
    file_url: str
    note: Optional[str]
    create_at: datetime
    update_at: datetime
