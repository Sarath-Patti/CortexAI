import asyncio
import json
from collections.abc import AsyncGenerator

import httpx

from app.ai.prompts.builder import PromptBuildResult
from app.ai.providers.base import BaseLLMProvider, ProviderGenerationResult
from app.ai.schemas import ModelInfo, UsageInfo
from app.core.config import settings
from app.core.logging import logger


class OllamaProvider(BaseLLMProvider):
    """
    Ollama Local LLM Provider Implementation.
    Interfaces with local or remote Ollama REST API endpoint.
    Includes simulated response fallback for dev environments when local daemon
    is offline.
    """

    SUPPORTED_MODELS = [
        ModelInfo(
            id="llama3",
            name="Llama 3 (8B)",
            provider="ollama",
            is_default=True,
        ),
        ModelInfo(
            id="llama3.1",
            name="Llama 3.1 (8B)",
            provider="ollama",
            is_default=False,
        ),
        ModelInfo(
            id="mistral",
            name="Mistral 7B",
            provider="ollama",
            is_default=False,
        ),
        ModelInfo(
            id="phi3",
            name="Phi-3 Mini",
            provider="ollama",
            is_default=False,
        ),
        ModelInfo(
            id="codellama",
            name="CodeLlama",
            provider="ollama",
            is_default=False,
        ),
    ]

    @property
    def name(self) -> str:
        return "ollama"

    def list_models(self) -> list[ModelInfo]:
        return self.SUPPORTED_MODELS

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(
                    f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags"
                )
                return res.status_code == 200
        except Exception:
            return False

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
        model_id = self._validate_model(model)
        endpoint = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"

        payload = {
            "model": model_id,
            "messages": prompt.messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(endpoint, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("message", {}).get("content", "")
                    prompt_eval_count = data.get("prompt_eval_count", 0)
                    eval_count = data.get("eval_count", 0)
                    usage = UsageInfo(
                        prompt_tokens=prompt_eval_count,
                        completion_tokens=eval_count,
                        total_tokens=prompt_eval_count + eval_count,
                    )
                    return ProviderGenerationResult(
                        response=content,
                        model=model_id,
                        usage=usage,
                    )
                else:
                    logger.warning("Ollama endpoint status %s", response.status_code)
        except Exception as err:
            logger.info(
                "Ollama local daemon not reachable (%s). Generating fallback"
                " response.",
                err,
            )

        # Fallback response for dev environments without active local Ollama daemon
        fallback_text = (
            f"[Ollama Provider - Model '{model_id}']\n\n"
            f'Received prompt: "{prompt.user_prompt}"\n\n'
            f'System instructions applied: "{prompt.system_prompt}"\n\n'
            "This structured response was produced by the CortexAI Provider"
            " Abstraction Layer using the unified BaseLLMProvider interface."
        )
        tokens = len(fallback_text.split())
        return ProviderGenerationResult(
            response=fallback_text,
            model=model_id,
            usage=UsageInfo(
                prompt_tokens=len(prompt.raw_prompt.split()),
                completion_tokens=tokens,
                total_tokens=len(prompt.raw_prompt.split()) + tokens,
            ),
        )

    async def stream(
        self,
        prompt: PromptBuildResult,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: float = 60.0,
    ) -> AsyncGenerator[str, None]:
        model_id = self._validate_model(model)
        endpoint = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"

        payload = {
            "model": model_id,
            "messages": prompt.messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }

        success = False
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", endpoint, json=payload) as response:
                    if response.status_code == 200:
                        success = True
                        async for line in response.aiter_lines():
                            if line.strip():
                                try:
                                    chunk_json = json.loads(line)
                                    msg = chunk_json.get("message", {}).get(
                                        "content", ""
                                    )
                                    if msg:
                                        yield msg
                                except Exception:
                                    continue
        except Exception as err:
            logger.info(
                "Ollama streaming connection error (%s), using fallback stream.",
                err,
            )

        if not success:
            fallback_text = (
                f"[Ollama Provider - Model '{model_id}'] "
                f'Processing prompt: "{prompt.user_prompt}" '
                "via the unified CortexAI Provider Abstraction Layer."
            )
            words = fallback_text.split(" ")
            for word in words:
                yield word + " "
                await asyncio.sleep(0.04)
