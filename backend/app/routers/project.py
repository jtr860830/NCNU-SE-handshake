from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.deps import get_current_user
from app.models.user import User, UserRole
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectRead,
)
from app.crud.project import (
    create_project,
    get_project,
    list_open_projects,
    list_projects_by_client,
    list_projects_by_worker,
    update_project,
    assign_worker,
    complete_project,
    reject_project,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectRead)
def create_project_route(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create projects",
        )

    project = create_project(session, current_user.id, data)
    return project


@router.get("/open", response_model=list[ProjectRead])
def list_open_projects_route(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    projects = list_open_projects(session)
    return projects


@router.get("/me/client", response_model=list[ProjectRead])
def list_client_projects_route(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    projects = list_projects_by_client(session, current_user.id)
    return projects


@router.get("/me/worker", response_model=list[ProjectRead])
def list_worker_projects_route(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    projects = list_projects_by_worker(session, current_user.id)
    return projects


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project_route(
    project_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the client can update this project",
        )

    updated = update_project(session, project, data)
    return updated


@router.post("/{project_id}/assign", response_model=ProjectRead)
def assign_worker_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(403, "Only workers can accept projects")

    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if project.worker_id is not None:
        raise HTTPException(400, "Project already assigned")

    assigned = assign_worker(session, project, current_user.id)
    return assigned


@router.post("/{project_id}/complete", response_model=ProjectRead)
def complete_project_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(403, "Only the client can complete the project")

    return complete_project(session, project)


@router.post("/{project_id}/reject", response_model=ProjectRead)
def reject_project_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(403, "Only the client can reject the project")

    return reject_project(session, project)
