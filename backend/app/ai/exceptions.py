class AIException(Exception):
    """Base exception for AI Runtime errors."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class ProviderUnavailableError(AIException):
    """Raised when the requested provider is unavailable or offline."""

    pass


class InvalidProviderError(AIException):
    """Raised when an unsupported or unregistered provider is specified."""

    pass


class InvalidModelError(AIException):
    """Raised when an invalid model is specified for a provider."""

    pass


class GenerationError(AIException):
    """Raised when text generation fails."""

    pass


class ConfigurationError(AIException):
    """
    Raised when provider configuration (API key, URL) is missing or invalid.
    """

    pass
