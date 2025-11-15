from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.deps import get_current_user
from app.models.user import User, UserRole
from app.models.project import Project
from app.schemas.quote import QuoteCreate, QuoteRead
from app.crud.quote import (
    create_quote,
    list_quotes_by_project,
    list_quotes_by_worker,
)
from app.crud.project import get_project


router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/projects/{project_id}", response_model=QuoteRead, status_code=201)
def create_quote_route(
    project_id: int | None,
    data: QuoteCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # 只有 Worker 能建立 quote
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can submit quotes",
        )

    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # 專案必須是 open 才能報價
    if project.status != "open":
        raise HTTPException(400, "Cannot quote on closed or assigned projects")

    quote = create_quote(session, project_id, current_user.id, data)
    return quote


@router.get(
    "/projects/{project_id}",
    response_model=list[QuoteRead],
)
def list_project_quotes_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # 只有該專案的委託人可以查看所有報價
    if project.client_id != current_user.id:
        raise HTTPException(
            403,
            "Only the project owner can view its quotes",
        )

    quotes = list_quotes_by_project(session, project_id)
    return quotes


@router.get(
    "/me",
    response_model=list[QuoteRead],
)
def list_my_quotes_route(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            403,
            "Only workers can view their submitted quotes",
        )

    quotes = list_quotes_by_worker(session, current_user.id)
    return quotes
