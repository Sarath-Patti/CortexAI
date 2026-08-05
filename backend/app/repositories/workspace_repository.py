import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace


class WorkspaceRepository:
    """
    Repository encapsulating all database access for Workspace entities.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.id == workspace_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_owner(self, owner_id: uuid.UUID) -> Sequence[Workspace]:
        stmt = (
            select(Workspace)
            .where(Workspace.owner_id == owner_id)
            .order_by(Workspace.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(
        self, name: str, description: Optional[str], owner_id: uuid.UUID
    ) -> Workspace:
        workspace = Workspace(
            name=name,
            description=description,
            owner_id=owner_id,
        )
        self.session.add(workspace)
        await self.session.commit()
        await self.session.refresh(workspace)
        return workspace
