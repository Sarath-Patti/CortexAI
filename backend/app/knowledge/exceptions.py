class KnowledgeException(Exception):
    """Base exception for Knowledge & RAG operations."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class UnsupportedFileTypeError(KnowledgeException):
    """Raised when an uploaded file extension/MIME is not supported."""

    pass


class EmbeddingError(KnowledgeException):
    """Raised when vector embedding generation fails."""

    pass


class RetrievalError(KnowledgeException):
    """Raised when vector similarity search or retrieval fails."""

    pass


class DocumentProcessingError(KnowledgeException):
    """Raised when parsing or chunking document content fails."""

    pass
