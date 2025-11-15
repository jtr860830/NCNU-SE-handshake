from typing import Optional, Sequence

from sqlmodel import Session, select

from app.models.quote import Quote
from app.schemas.quote import QuoteCreate


# ---------------------------------------------------------
# Create Quote
# ---------------------------------------------------------
def create_quote(
    session: Session,
    project_id: int | None,
    worker_id: int | None,
    data: QuoteCreate,
) -> Quote:
    quote = Quote(
        project_id=project_id,
        worker_id=worker_id,
        amount=data.amount,
        days=data.days,
    )

    session.add(quote)
    session.commit()
    session.refresh(quote)

    return quote


# ---------------------------------------------------------
# Read
# ---------------------------------------------------------
def get_quote(session: Session, quote_id: int) -> Optional[Quote]:
    return session.get(Quote, quote_id)


def list_quotes_by_project(session: Session, project_id: int) -> Sequence[Quote]:
    statement = select(Quote).where(Quote.project_id == project_id)
    return session.exec(statement).all()


def list_quotes_by_worker(session: Session, worker_id: int) -> Sequence[Quote]:
    statement = select(Quote).where(Quote.worker_id == worker_id)
    return session.exec(statement).all()
