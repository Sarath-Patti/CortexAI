from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the speaker (system, user, assistant)")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User prompt text")
    system_prompt: str | None = Field(None, description="System instructions")
    history: list[ChatMessage] | None = Field(
        default=None, description="Prior conversation messages"
    )
    provider: str | None = Field(
        None, description="Target AI provider (openai, ollama)"
    )
    model: str | None = Field(None, description="Target LLM model ID")
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Sampling temperature"
    )
    max_tokens: int = Field(
        default=1000, gt=0, description="Maximum tokens to generate"
    )
    stream: bool = Field(default=False, description="Whether to stream response tokens")


class UsageInfo(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ChatResponse(BaseModel):
    response: str = Field(..., description="Generated text content")
    provider: str = Field(..., description="Provider used")
    model: str = Field(..., description="Model used")
    latency_ms: float = Field(..., description="Generation latency in milliseconds")
    request_id: str = Field(..., description="Unique request identifier")
    usage: UsageInfo | None = Field(default=None, description="Token usage metrics")


class ModelInfo(BaseModel):
    id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Human-readable model name")
    provider: str = Field(..., description="Provider owning this model")
    is_default: bool = Field(
        default=False, description="Whether this is default for provider"
    )


class ProviderInfo(BaseModel):
    name: str = Field(..., description="Provider unique identifier")
    is_default: bool = Field(
        default=False, description="Whether this is the system default provider"
    )
    available: bool = Field(
        default=True, description="Whether provider is online and available"
    )
    models: list[ModelInfo] = Field(
        default_factory=list, description="Supported models"
    )
