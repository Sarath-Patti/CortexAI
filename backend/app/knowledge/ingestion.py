import uuid

from app.knowledge.chunker import DocumentChunker, TextChunk
from app.knowledge.embeddings import EmbeddingService
from app.knowledge.parser import DocumentParser
from app.knowledge.retriever import ChromaRetriever


class IngestionPipeline:
    """
    Ingestion Pipeline orchestrating parse -> chunk -> embed -> vector index.
    """

    def __init__(
        self,
        parser: DocumentParser | None = None,
        chunker: DocumentChunker | None = None,
        embedding_service: EmbeddingService | None = None,
        retriever: ChromaRetriever | None = None,
    ) -> None:
        self.parser = parser or DocumentParser()
        self.chunker = chunker or DocumentChunker()
        self.embedding_service = embedding_service or EmbeddingService()
        self.retriever = retriever or ChromaRetriever()

    def process_file(
        self,
        file_bytes: bytes,
        filename: str,
        document_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
    ) -> list[TextChunk]:
        # 1. Parse text from pages
        pages = self.parser.parse_bytes(file_bytes, filename)

        # 2. Chunk text
        chunks = self.chunker.chunk_pages(
            pages=pages,
            filename=filename,
            document_id=str(document_id),
            workspace_id=str(workspace_id) if workspace_id else None,
        )

        if not chunks:
            return []

        # 3. Generate embeddings
        texts = [c.text for c in chunks]
        embeddings = self.embedding_service.embed_texts(texts)

        # 4. Store in ChromaDB vector store
        self.retriever.add_chunks(chunks, embeddings)

        return chunks
