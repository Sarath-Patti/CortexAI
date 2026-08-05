import json
from collections.abc import AsyncGenerator

import httpx

from app.ai.exceptions import (
    ConfigurationError,
    GenerationError,
    ProviderUnavailableError,
)
from app.ai.prompts.builder import PromptBuildResult
from app.ai.providers.base import BaseLLMProvider, ProviderGenerationResult
from app.ai.schemas import ModelInfo, UsageInfo
from app.core.config import settings
from app.core.logging import logger


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI Provider Implementation using HTTPX Async API.
    """

    SUPPORTED_MODELS = [
        ModelInfo(
            id="gpt-4o-mini",
            name="GPT-4o Mini",
            provider="openai",
            is_default=True,
        ),
        ModelInfo(id="gpt-4o", name="GPT-4o", provider="openai", is_default=False),
        ModelInfo(
            id="gpt-4-turbo",
            name="GPT-4 Turbo",
            provider="openai",
            is_default=False,
        ),
        ModelInfo(
            id="gpt-3.5-turbo",
            name="GPT-3.5 Turbo",
            provider="openai",
            is_default=False,
        ),
    ]

    @property
    def name(self) -> str:
        return "openai"

    def list_models(self) -> list[ModelInfo]:
        return self.SUPPORTED_MODELS

    async def health_check(self) -> bool:
        if not settings.OPENAI_API_KEY:
            return False
        return True

    def _validate_config(self) -> None:
        if not settings.OPENAI_API_KEY:
            raise ConfigurationError(
                "OPENAI_API_KEY is not configured in environment settings."
            )

    def _validate_model(self, model: str) -> str:
        valid_ids = [m.id for m in self.SUPPORTED_MODELS]
        if not model or model not in valid_ids:
            return valid_ids[0]
        return model

    async def generate(
        self,
        prompt: PromptBuildResult,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: float = 60.0,
    ) -> ProviderGenerationResult:
        self._validate_config()
        model_id = self._validate_model(model)

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model_id,
            "messages": prompt.messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code != 200:
                    logger.error(
                        "OpenAI API status %s: %s",
                        response.status_code,
                        response.text,
                    )
                    raise GenerationError(
                        f"OpenAI API request failed with status "
                        f"{response.status_code}: {response.text}"
                    )

                data = response.json()
                content = data["choices"][0]["message"]["content"]

                raw_usage = data.get("usage", {})
                usage = UsageInfo(
                    prompt_tokens=raw_usage.get("prompt_tokens", 0),
                    completion_tokens=raw_usage.get("completion_tokens", 0),
                    total_tokens=raw_usage.get("total_tokens", 0),
                )
                return ProviderGenerationResult(
                    response=content,
                    model=model_id,
                    usage=usage,
                )
        except httpx.ConnectError as err:
            raise ProviderUnavailableError(
                "Unable to connect to OpenAI API endpoint."
            ) from err
        except httpx.TimeoutException as err:
            raise ProviderUnavailableError("OpenAI API request timed out.") from err
        except Exception as err:
            if isinstance(
                err,
                (
                    ConfigurationError,
                    ProviderUnavailableError,
                    GenerationError,
                ),
            ):
                raise
            raise GenerationError(
                f"Unexpected OpenAI generation failure: {str(err)}"
            ) from err

    async def stream(
        self,
        prompt: PromptBuildResult,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: float = 60.0,
    ) -> AsyncGenerator[str, None]:
        self._validate_config()
        model_id = self._validate_model(model)

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model_id,
            "messages": prompt.messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        yield (
                            "Error: OpenAI stream failed with status"
                            f" {response.status_code}"
                        )
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            line_data = line[6:].strip()
                            if line_data == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(line_data)
                                delta = chunk_json["choices"][0]["delta"]
                                if "content" in delta:
                                    yield delta["content"]
                            except Exception:
                                continue
        except Exception as err:
            yield f"Error during OpenAI streaming: {str(err)}"
