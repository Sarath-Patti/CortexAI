import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user, get_workspace_service
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse
from app.services.workspace_service import WorkspaceService

router = APIRouter()


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Workspace",
    description="Create a new workspace owned by the current user.",
)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_service: Annotated[WorkspaceService, Depends(get_workspace_service)],
) -> WorkspaceResponse:
    workspace = await workspace_service.create_workspace(
        workspace_in=workspace_in,
        owner_id=current_user.id,
    )
    return WorkspaceResponse.model_validate(workspace)


@router.get(
    "",
    response_model=list[WorkspaceResponse],
    status_code=status.HTTP_200_OK,
    summary="List Workspaces",
    description="List all workspaces owned by the current user.",
)
async def list_workspaces(
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_service: Annotated[WorkspaceService, Depends(get_workspace_service)],
) -> list[WorkspaceResponse]:
    workspaces = await workspace_service.get_user_workspaces(owner_id=current_user.id)
    return [WorkspaceResponse.model_validate(w) for w in workspaces]


@router.get(
    "/{id}",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Workspace Details",
    description="Retrieve details of a specific workspace by ID.",
)
async def get_workspace(
    id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_service: Annotated[WorkspaceService, Depends(get_workspace_service)],
) -> WorkspaceResponse:
    workspace = await workspace_service.get_workspace_by_id(
        workspace_id=id,
        owner_id=current_user.id,
    )
    return WorkspaceResponse.model_validate(workspace)
