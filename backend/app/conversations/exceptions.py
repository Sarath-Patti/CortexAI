class ConversationException(Exception):
    """Base exception for conversation domain operations."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class ConversationNotFoundError(ConversationException):
    """Raised when a requested conversation is not found or inaccessible."""

    pass
