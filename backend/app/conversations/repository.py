import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, Message


class ConversationRepository:
    """
    Data Access Repository for managing Conversation and Message persistence.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_conversation(
        self,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
        title: str = "New Conversation",
    ) -> Conversation:
        conversation = Conversation(
            id=uuid.uuid4(),
            owner_id=owner_id,
            workspace_id=workspace_id,
            title=title,
        )
        self.db.add(conversation)
        await self.db.commit()

        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation.id)
            .options(selectinload(Conversation.messages))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def get_by_id(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Conversation | None:
        stmt = (
            select(Conversation)
            .where(
                Conversation.id == conversation_id,
                Conversation.owner_id == owner_id,
            )
            .options(selectinload(Conversation.messages))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_owner(
        self,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
        search_query: str | None = None,
    ) -> Sequence[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.owner_id == owner_id)
            .options(selectinload(Conversation.messages))
        )
        if workspace_id:
            stmt = stmt.where(Conversation.workspace_id == workspace_id)
        if search_query and search_query.strip():
            stmt = stmt.where(Conversation.title.ilike(f"%{search_query.strip()}%"))
        stmt = stmt.order_by(Conversation.updated_at.desc())

        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def rename(self, conversation: Conversation, new_title: str) -> Conversation:
        conversation.title = new_title
        await self.db.commit()

        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation.id)
            .options(selectinload(Conversation.messages))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def delete(self, conversation: Conversation) -> None:
        await self.db.delete(conversation)
        await self.db.commit()

    async def create_message(
        self,
        conversation_id: uuid.UUID,
        role: str,
        content: str,
        provider: str | None = None,
        model: str | None = None,
        token_usage: dict | None = None,
        latency_ms: float | None = None,
        citations: list | None = None,
    ) -> Message:
        message = Message(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            role=role,
            content=content,
            provider=provider,
            model=model,
            token_usage=token_usage,
            latency_ms=latency_ms,
            citations=citations,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message
