import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """
    Repository encapsulating all database access for User entities.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self, name: str, email: str, password_hash: str
    ) -> User:
        user = User(
            name=name,
            email=email.lower(),
            password_hash=password_hash,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def list_all(self) -> Sequence[User]:
        stmt = select(User).order_by(User.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()
