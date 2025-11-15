from datetime import datetime
from sqlmodel import SQLModel


class QuoteCreate(SQLModel):
    amount: float
    days: int


class QuoteRead(SQLModel):
    id: int
    project_id: int
    worker_id: int
    amount: float
    days: int
    create_at: datetime
    update_at: datetime
