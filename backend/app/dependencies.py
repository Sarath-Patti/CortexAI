import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import decode_access_token
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.workspace_service import WorkspaceService

security_scheme = HTTPBearer(auto_error=True)


def get_user_repository(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> UserRepository:
    return UserRepository(db)


def get_workspace_repository(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> WorkspaceRepository:
    return WorkspaceRepository(db)


def get_user_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)]
) -> UserService:
    return UserService(user_repo)


def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)]
) -> AuthService:
    return AuthService(user_repo)


def get_workspace_service(
    workspace_repo: Annotated[
        WorkspaceRepository, Depends(get_workspace_repository)
    ]
) -> WorkspaceService:
    return WorkspaceService(workspace_repo)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> User:
    """
    Dependency that decodes the JWT access token from the Authorization header
    and retrieves the currently authenticated User object.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
