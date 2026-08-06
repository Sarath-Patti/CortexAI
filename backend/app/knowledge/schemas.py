import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.ai.schemas import UsageInfo


class DocumentSchema(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID | None
    owner_id: uuid.UUID
    filename: str
    file_type: str
    size: int
    status: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    size: int
    status: str
    chunk_count: int


class RetrievedChunk(BaseModel):
    text: str
    similarity_score: float
    metadata: dict


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query string")
    workspace_id: str | None = Field(None, description="Optional workspace filter")
    top_k: int = Field(default=5, ge=1, le=20, description="Top K results")


class SearchResponse(BaseModel):
    query: str
    chunks: list[RetrievedChunk]


class KnowledgeChatRequest(BaseModel):
    prompt: str = Field(..., description="User query prompt")
    system_prompt: str | None = Field(None, description="Optional system instructions")
    workspace_id: str | None = Field(None, description="Optional workspace ID")
    provider: str | None = Field(None, description="AI provider name")
    model: str | None = Field(None, description="LLM model name")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1000, gt=0)
    top_k: int = Field(default=5, ge=1, le=20)


class KnowledgeChatResponse(BaseModel):
    response: str
    provider: str
    model: str
    latency_ms: float
    request_id: str
    retrieved_chunks: list[RetrievedChunk]
    usage: UsageInfo | None = None
