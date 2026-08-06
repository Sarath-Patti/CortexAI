import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MessageSchema(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    provider: str | None = None
    model: str | None = None
    token_usage: dict | None = None
    latency_ms: float | None = None
    citations: list | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSchema(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID | None = None
    owner_id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ConversationCreateRequest(BaseModel):
    title: str | None = Field(
        None, description="Optional custom title for conversation"
    )
    workspace_id: uuid.UUID | None = Field(
        None, description="Optional workspace ID context"
    )


class ConversationUpdateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class SendMessageRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt query")
    system_prompt: str | None = Field(
        None, description="Optional system prompt instructions"
    )
    provider: str | None = Field(None, description="LLM provider name")
    model: str | None = Field(None, description="LLM model identifier")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1000, gt=0)
    rag_enabled: bool = Field(
        default=False, description="Whether RAG retrieval is enabled"
    )
    top_k: int = Field(default=5, ge=1, le=20)


class SendMessageResponse(BaseModel):
    conversation_id: uuid.UUID
    user_message: MessageSchema
    assistant_message: MessageSchema


class ConversationExportResponse(BaseModel):
    conversation_id: uuid.UUID
    title: str
    format: str
    export_data: str
