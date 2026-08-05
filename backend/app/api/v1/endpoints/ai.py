import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.ai.exceptions import (
    AIException,
    ConfigurationError,
    GenerationError,
    InvalidModelError,
    InvalidProviderError,
    ProviderUnavailableError,
)
from app.ai.schemas import ChatRequest, ChatResponse, ModelInfo, ProviderInfo
from app.ai.service import AIService
from app.dependencies import get_ai_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["AI Runtime"])


@router.post("", response_model=ChatResponse, summary="Generate AI Completion")
async def chat_completion(
    request: ChatRequest,
    ai_service: Annotated[AIService, Depends(get_ai_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Generate unified text completion using the specified AI provider and model.
    Supports optional streaming when `stream: true` is set.
    Requires JWT authentication.
    """
    try:
        if request.stream:

            async def sse_stream_generator():
                try:
                    async for token_chunk in ai_service.stream_chat(request):
                        yield f"data: {json.dumps({'token': token_chunk})}\n\n"
                    yield "data: [DONE]\n\n"
                except Exception as err:
                    yield f"data: {json.dumps({'error': str(err)})}\n\n"

            return StreamingResponse(
                sse_stream_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        return await ai_service.generate_chat(request)
    except InvalidProviderError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=err.message
        ) from err
    except InvalidModelError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=err.message
        ) from err
    except ConfigurationError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err
    except ProviderUnavailableError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=err.message,
        ) from err
    except GenerationError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=err.message
        ) from err
    except AIException as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err


@router.get(
    "/providers",
    response_model=list[ProviderInfo],
    summary="List AI Providers",
)
async def list_providers(
    ai_service: Annotated[AIService, Depends(get_ai_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    List all registered AI providers, their default status, and health
    availability.
    """
    return await ai_service.list_providers()


@router.get("/models", response_model=list[ModelInfo], summary="List AI Models")
async def list_models(
    ai_service: Annotated[AIService, Depends(get_ai_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    provider: str | None = Query(None, description="Optional provider filter name"),
):
    """
    List supported models for a specific provider or across all providers.
    """
    try:
        return ai_service.list_models(provider)
    except InvalidProviderError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=err.message
        ) from err
