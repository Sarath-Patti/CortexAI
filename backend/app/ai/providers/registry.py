from app.ai.exceptions import InvalidProviderError
from app.ai.providers.base import BaseLLMProvider
from app.ai.schemas import ModelInfo, ProviderInfo
from app.core.config import settings


class ProviderRegistry:
    """
    Central registry for managing pluggable AI Provider instances.
    Decouples business logic from specific LLM provider implementations.
    """

    def __init__(self) -> None:
        self._providers: dict[str, BaseLLMProvider] = {}
        self._default_provider_name: str = settings.DEFAULT_PROVIDER

    def register(self, provider: BaseLLMProvider) -> None:
        """Register a new LLM provider instance."""
        self._providers[provider.name.lower()] = provider

    def get_provider(self, name: str | None = None) -> BaseLLMProvider:
        """
        Retrieve provider instance by name.
        If name is None or empty, returns the default provider.
        """
        target_name = (name or self._default_provider_name).lower().strip()
        if target_name not in self._providers:
            available = ", ".join(self._providers.keys())
            raise InvalidProviderError(
                f"Provider '{target_name}' is not registered. Available"
                f" providers: [{available}]"
            )
        return self._providers[target_name]

    def get_default_provider_name(self) -> str:
        return self._default_provider_name

    async def list_providers(self) -> list[ProviderInfo]:
        """
        Return metadata and health status for all registered providers.
        """
        provider_list: list[ProviderInfo] = []
        for name, provider in self._providers.items():
            is_default = name == self._default_provider_name.lower()
            available = await provider.health_check()
            models = provider.list_models()
            provider_list.append(
                ProviderInfo(
                    name=name,
                    is_default=is_default,
                    available=available,
                    models=models,
                )
            )
        return provider_list

    def list_models(self, provider_name: str | None = None) -> list[ModelInfo]:
        """
        List models for a specific provider or across all registered providers.
        """
        if provider_name:
            provider = self.get_provider(provider_name)
            return provider.list_models()

        all_models: list[ModelInfo] = []
        for provider in self._providers.values():
            all_models.extend(provider.list_models())
        return all_models
