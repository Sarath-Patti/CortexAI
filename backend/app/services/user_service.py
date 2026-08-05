import uuid
from typing import Optional

from fastapi import HTTPException, status

from app.auth.security import get_password_hash
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserService:
    """
    Service layer handling user domain logic.
    """

    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def get_by_email(self, email: str) -> Optional[User]:
        return await self.user_repo.get_by_email(email)

    async def register_user(self, user_in: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        password_hash = get_password_hash(user_in.password)
        user = await self.user_repo.create(
            name=user_in.name,
            email=user_in.email,
            password_hash=password_hash,
        )
        return user
