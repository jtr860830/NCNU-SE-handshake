from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlmodel import Session, select

from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


# ---------------------------------------------------------
# Create project
# ---------------------------------------------------------
def create_project(
    session: Session, client_id: int | None, data: ProjectCreate
) -> Project:
    project = Project(
        title=data.title,
        description=data.description,
        client_id=client_id,
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


# ---------------------------------------------------------
# Read
# ---------------------------------------------------------
def get_project(session: Session, project_id: int | None) -> Optional[Project]:
    return session.get(Project, project_id)


def list_open_projects(session: Session) -> Sequence[Project]:
    """For workers to browse open jobs."""
    stmt = select(Project).where(Project.status == ProjectStatus.OPEN)
    return session.exec(stmt).all()


def list_projects_by_client(
    session: Session, client_id: int | None
) -> Sequence[Project]:
    stmt = select(Project).where(Project.client_id == client_id)
    return session.exec(stmt).all()


def list_projects_by_worker(
    session: Session, worker_id: int | None
) -> Sequence[Project]:
    stmt = select(Project).where(Project.worker_id == worker_id)
    return session.exec(stmt).all()


# ---------------------------------------------------------
# Update project (title, description, status, worker)
# ---------------------------------------------------------
def update_project(session: Session, project: Project, data: ProjectUpdate) -> Project:
    if data.title is not None:
        project.title = data.title

    if data.description is not None:
        project.description = data.description

    if data.status is not None:
        project.status = data.status

    if data.worker_id is not None:
        project.worker_id = data.worker_id

    project.update_at = datetime.now(timezone.utc)

    session.add(project)
    session.commit()
    session.refresh(project)

    return project


# ---------------------------------------------------------
# Assign worker (接案人承接專案)
# ---------------------------------------------------------
def assign_worker(session: Session, project: Project, worker_id: int | None) -> Project:
    project.worker_id = worker_id
    project.status = ProjectStatus.IN_PROGRESS
    project.update_at = datetime.now(timezone.utc)

    session.add(project)
    session.commit()
    session.refresh(project)

    return project


# ---------------------------------------------------------
# Mark completed or rejected (委託人結案)
# ---------------------------------------------------------
def complete_project(session: Session, project: Project) -> Project:
    project.status = ProjectStatus.COMPLETED
    project.update_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


def reject_project(session: Session, project: Project) -> Project:
    project.status = ProjectStatus.REJECTED
    project.update_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project
