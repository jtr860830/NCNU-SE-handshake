import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session

from app.database import get_session
from app.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.deliverable import DeliverableCreate, DeliverableRead
from app.crud.deliverable import create_deliverable, list_deliverables_by_project
from app.crud.project import get_project


router = APIRouter(prefix="/deliverables", tags=["deliverables"])


@router.post(
    "/projects/{project_id}",
    response_model=DeliverableRead,
    status_code=201,
)
def create_deliverable_route(
    project_id: int,
    data: DeliverableCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(403, "Only workers can deliver work")

    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if project.worker_id != current_user.id:
        raise HTTPException(403, "You are not assigned to this project")

    deliverable = create_deliverable(session, project_id, current_user.id, data)

    return deliverable


@router.get(
    "/projects/{project_id}",
    response_model=list[DeliverableRead],
)
def list_deliverables_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(403, "Only the client can view deliverables")

    items = list_deliverables_by_project(session, project_id)
    return items


@router.post(
    "/projects/{project_id}/upload",
    response_model=DeliverableRead,
    status_code=201,
)
async def upload_deliverable_file(
    project_id: int,
    file: UploadFile = File(...),
    note: str | None = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # 只有 worker 可以上傳
    if current_user.role != UserRole.WORKER:
        raise HTTPException(403, "Only workers can upload deliverables")

    project = get_project(session, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # 檢查這個 worker 是否為該 project 的負責人
    if project.worker_id != current_user.id:
        raise HTTPException(403, "You are not assigned to this project")

    # ---- 準備 uploads 路徑 ----
    upload_dir = f"uploads/{project_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # ---- 儲存檔案 ----
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}-{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ---- 建立 deliverable 記錄 ----
    deliverable = create_deliverable(
        session=session,
        project_id=project_id,
        worker_id=current_user.id,
        data=DeliverableCreate(
            file_url=file_path,
            note=note,
        ),
    )

    return deliverable
