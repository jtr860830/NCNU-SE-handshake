from typing import Sequence

from sqlmodel import Session, select

from app.models.deliverable import Deliverable
from app.schemas.deliverable import DeliverableCreate


def create_deliverable(
    session: Session,
    project_id: int | None,
    worker_id: int | None,
    data: DeliverableCreate,
) -> Deliverable:
    deliverable = Deliverable(
        project_id=project_id,
        worker_id=worker_id,
        file_url=data.file_url,
        note=data.note,
    )

    session.add(deliverable)
    session.commit()
    session.refresh(deliverable)

    return deliverable


def list_deliverables_by_project(
    session: Session, project_id: int
) -> Sequence[Deliverable]:
    stmt = select(Deliverable).where(Deliverable.project_id == project_id)
    return session.exec(stmt).all()
