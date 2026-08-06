import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.conversations.exceptions import ConversationNotFoundError
from app.conversations.schemas import (
    ConversationCreateRequest,
    ConversationExportResponse,
    ConversationSchema,
    ConversationUpdateRequest,
    SendMessageRequest,
    SendMessageResponse,
)
from app.conversations.service import ConversationService
from app.dependencies import get_conversation_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/conversations", tags=["Conversations Platform"])


@router.post(
    "",
    response_model=ConversationSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Conversation",
)
async def create_conversation(
    request: ConversationCreateRequest,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Create a new persistent conversation thread for the current user.
    """
    return await service.create_conversation(
        owner_id=current_user.id,
        workspace_id=request.workspace_id,
        title=request.title,
    )


@router.get(
    "",
    response_model=list[ConversationSchema],
    summary="List Conversations",
)
async def list_conversations(
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_id: str | None = None,
    q: str | None = Query(None, description="Search query string"),
):
    """
    List current user's conversations, optionally filtered by workspace or search title.
    """
    ws_uuid = uuid.UUID(workspace_id) if workspace_id and workspace_id.strip() else None
    return await service.list_conversations(
        owner_id=current_user.id, workspace_id=ws_uuid, query=q
    )


@router.get(
    "/search",
    response_model=list[ConversationSchema],
    summary="Search Conversations",
)
async def search_conversations(
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str = Query(..., description="Query string to search in titles"),
    workspace_id: str | None = None,
):
    """
    Search conversations by title keyword.
    """
    ws_uuid = uuid.UUID(workspace_id) if workspace_id and workspace_id.strip() else None
    return await service.list_conversations(
        owner_id=current_user.id, workspace_id=ws_uuid, query=q
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationSchema,
    summary="Get Conversation Details",
)
async def get_conversation(
    conversation_id: uuid.UUID,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Retrieve full conversation metadata and ordered message history.
    """
    try:
        return await service.get_conversation(
            conversation_id=conversation_id, owner_id=current_user.id
        )
    except ConversationNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=err.message
        ) from err


@router.patch(
    "/{conversation_id}",
    response_model=ConversationSchema,
    summary="Rename Conversation",
)
async def rename_conversation(
    conversation_id: uuid.UUID,
    request: ConversationUpdateRequest,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Rename an existing conversation title.
    """
    try:
        return await service.rename_conversation(
            conversation_id=conversation_id,
            owner_id=current_user.id,
            new_title=request.title,
        )
    except ConversationNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=err.message
        ) from err


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Conversation",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete a conversation thread and all its stored messages.
    """
    try:
        await service.delete_conversation(
            conversation_id=conversation_id, owner_id=current_user.id
        )
        return {"message": "Conversation deleted successfully."}
    except ConversationNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=err.message
        ) from err


@router.post(
    "/{conversation_id}/messages",
    response_model=SendMessageResponse,
    summary="Send Message to Conversation",
)
async def send_message(
    conversation_id: uuid.UUID,
    request: SendMessageRequest,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Post a user query message to a conversation thread, construct history & RAG context,
    execute provider completion, and persist both user and assistant messages.
    """
    try:
        return await service.send_message(
            conversation_id=conversation_id,
            owner_id=current_user.id,
            request=request,
        )
    except ConversationNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=err.message
        ) from err


@router.get(
    "/{conversation_id}/stream",
    summary="Stream Response via SSE",
)
async def stream_message(
    conversation_id: uuid.UUID,
    prompt: str,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    provider: str | None = None,
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    rag_enabled: bool = False,
    system_prompt: str | None = None,
    top_k: int = 5,
):
    """
    Stream assistant token response using Server-Sent Events (SSE).
    """
    generator = service.stream_message_sse(
        conversation_id=conversation_id,
        owner_id=current_user.id,
        prompt=prompt,
        system_prompt=system_prompt,
        provider=provider,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        rag_enabled=rag_enabled,
        top_k=top_k,
    )
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(generator, media_type="text/event-stream", headers=headers)


@router.get(
    "/{conversation_id}/export",
    response_model=ConversationExportResponse,
    summary="Export Conversation",
)
async def export_conversation(
    conversation_id: uuid.UUID,
    service: Annotated[ConversationService, Depends(get_conversation_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    format: str = Query("markdown", description="Export format: 'markdown' or 'json'"),
):
    """
    Export full conversation history as Markdown or JSON formatted data.
    """
    try:
        return await service.export_conversation(
            conversation_id=conversation_id,
            owner_id=current_user.id,
            export_format=format,
        )
    except ConversationNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=err.message
        ) from err
