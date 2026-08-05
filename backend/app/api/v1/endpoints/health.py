from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    environment: str


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check endpoint",
    description="Returns operational status and basic environment info.",
)
async def health_check() -> HealthCheckResponse:
    """
    Perform system health check.
    """
    return HealthCheckResponse(
        status="ok",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
