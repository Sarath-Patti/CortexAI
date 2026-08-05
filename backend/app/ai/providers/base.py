from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator

from pydantic import BaseModel

from app.ai.prompts.builder import PromptBuildResult
from app.ai.schemas import ModelInfo, UsageInfo


class ProviderGenerationResult(BaseModel):
    response: str
    model: str
    usage: UsageInfo | None = None


class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM Provider implementations.
    Defines the unified interface: generate, stream, health_check, list_models.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique provider identifier (e.g. 'openai', 'ollama')."""
        pass

    @abstractmethod
    async def generate(
        self,
        prompt: PromptBuildResult,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: float = 60.0,
    ) -> ProviderGenerationResult:
        """
        Generate a full completion response from the model.
        """
        pass

    @abstractmethod
    async def stream(
        self,
        prompt: PromptBuildResult,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: float = 60.0,
    ) -> AsyncGenerator[str, None]:
        """
        Stream completion response tokens asynchronously.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check whether provider service is reachable and configured.
        """
        pass

    @abstractmethod
    def list_models(self) -> list[ModelInfo]:
        """
        List supported models for this provider.
        """
        pass
