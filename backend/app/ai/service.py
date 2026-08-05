import time
import uuid
from collections.abc import AsyncGenerator

from app.ai.prompts.builder import PromptBuilder
from app.ai.providers.registry import ProviderRegistry
from app.ai.schemas import (
    ChatRequest,
    ChatResponse,
    ModelInfo,
    ProviderInfo,
)
from app.core.config import settings
from app.core.logging import logger


class AIService:
    """
    Central AI Conversation Service.
    Handles provider selection, model resolution, prompt building, response
    generation, latency logging, and streaming delegation. Does NOT persist
    chat history in database.
    """

    def __init__(self, registry: ProviderRegistry) -> None:
        self.registry = registry

    async def generate_chat(self, request: ChatRequest) -> ChatResponse:
        request_id = f"req_{uuid.uuid4().hex[:12]}"
        start_time = time.perf_counter()

        # 1. Select provider
        provider = self.registry.get_provider(request.provider)
        provider_name = provider.name

        # 2. Select model
        model = request.model or settings.DEFAULT_MODEL

        logger.info(
            "[%s] Starting AI generation: provider=%s, model=%s, temp=%.2f,"
            " max_tokens=%d",
            request_id,
            provider_name,
            model,
            request.temperature,
            request.max_tokens,
        )

        # 3. Build prompt
        prompt_result = (
            PromptBuilder()
            .set_system_prompt(request.system_prompt)
            .set_user_prompt(request.prompt)
            .set_history(request.history)
            .build()
        )

        # 4. Generate response via provider abstraction
        generation_result = await provider.generate(
            prompt=prompt_result,
            model=model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            timeout=settings.AI_REQUEST_TIMEOUT,
        )

        end_time = time.perf_counter()
        latency_ms = round((end_time - start_time) * 1000, 2)

        # 5. Log metrics (provider, model, latency, request_id, usage)
        usage_str = (
            f"prompt_tokens={generation_result.usage.prompt_tokens}, "
            f"completion_tokens={generation_result.usage.completion_tokens}, "
            f"total_tokens={generation_result.usage.total_tokens}"
            if generation_result.usage
            else "usage=N/A"
        )

        logger.info(
            "[%s] AI generation completed: provider=%s, model=%s,"
            " latency=%.2fms, %s",
            request_id,
            provider_name,
            generation_result.model,
            latency_ms,
            usage_str,
        )

        return ChatResponse(
            response=generation_result.response,
            provider=provider_name,
            model=generation_result.model,
            latency_ms=latency_ms,
            request_id=request_id,
            usage=generation_result.usage,
        )

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        request_id = f"stream_{uuid.uuid4().hex[:12]}"
        provider = self.registry.get_provider(request.provider)
        model = request.model or settings.DEFAULT_MODEL

        logger.info(
            "[%s] Starting AI streaming: provider=%s, model=%s",
            request_id,
            provider.name,
            model,
        )

        prompt_result = (
            PromptBuilder()
            .set_system_prompt(request.system_prompt)
            .set_user_prompt(request.prompt)
            .set_history(request.history)
            .build()
        )

        async for chunk in provider.stream(
            prompt=prompt_result,
            model=model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            timeout=settings.AI_REQUEST_TIMEOUT,
        ):
            yield chunk

    async def list_providers(self) -> list[ProviderInfo]:
        return await self.registry.list_providers()

    def list_models(self, provider_name: str | None = None) -> list[ModelInfo]:
        return self.registry.list_models(provider_name)
