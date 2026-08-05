import uuid
from typing import Sequence

from fastapi import HTTPException, status

from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate


class WorkspaceService:
    """
    Service layer handling workspace domain logic and ownership verification.
    """

    def __init__(self, workspace_repo: WorkspaceRepository) -> None:
        self.workspace_repo = workspace_repo

    async def create_workspace(
        self, workspace_in: WorkspaceCreate, owner_id: uuid.UUID
    ) -> Workspace:
        return await self.workspace_repo.create(
            name=workspace_in.name,
            description=workspace_in.description,
            owner_id=owner_id,
        )

    async def get_user_workspaces(
        self, owner_id: uuid.UUID
    ) -> Sequence[Workspace]:
        return await self.workspace_repo.list_by_owner(owner_id)

    async def get_workspace_by_id(
        self, workspace_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Workspace:
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )
        if workspace.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )
        return workspace
