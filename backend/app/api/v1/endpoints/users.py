from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Retrieve details for the currently authenticated user.",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    return UserResponse.model_validate(current_user)
