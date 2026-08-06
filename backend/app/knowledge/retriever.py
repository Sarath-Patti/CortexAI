from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.logging import logger
from app.knowledge.chunker import TextChunk
from app.knowledge.exceptions import RetrievalError
from app.knowledge.schemas import RetrievedChunk


class ChromaRetriever:
    """
    Vector database retriever using ChromaDB.
    Persists collection embeddings in local 'chroma' directory.
    """

    COLLECTION_NAME = "cortex_documents"

    def __init__(self, chroma_path: str = "chroma") -> None:
        self.chroma_dir = Path(chroma_path)
        self.chroma_dir.mkdir(parents=True, exist_ok=True)

        self.client = chromadb.PersistentClient(
            path=str(self.chroma_dir),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "ChromaDB collection '%s' initialized at '%s'.",
            self.COLLECTION_NAME,
            self.chroma_dir.absolute(),
        )

    def add_chunks(
        self, chunks: list[TextChunk], embeddings: list[list[float]]
    ) -> None:
        if not chunks:
            return

        ids = [f"{c.metadata['document_id']}_{c.chunk_index}" for c in chunks]
        documents = [c.text for c in chunks]
        metadatas = [c.metadata for c in chunks]

        try:
            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )
            logger.info("Successfully indexed %d chunks in ChromaDB.", len(chunks))
        except Exception as err:
            raise RetrievalError(
                f"Failed to add document chunks to vector database: {str(err)}"
            ) from err

    def search(
        self,
        query_embedding: list[float],
        workspace_id: str | None = None,
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        try:
            where_filter = None
            if workspace_id and workspace_id.strip():
                where_filter = {"workspace_id": str(workspace_id).strip()}

            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter,
                include=["documents", "metadatas", "distances"],
            )

            retrieved: list[RetrievedChunk] = []
            if (
                not results
                or not results.get("documents")
                or not results["documents"][0]
            ):
                return retrieved

            docs = results["documents"][0]
            metas = (
                results["metadatas"][0]
                if results.get("metadatas")
                else [{}] * len(docs)
            )
            distances = (
                results["distances"][0]
                if results.get("distances")
                else [0.0] * len(docs)
            )

            for text, meta, dist in zip(docs, metas, distances, strict=False):
                # Cosine distance to similarity score conversion
                similarity = round(max(0.0, 1.0 - float(dist)), 4)
                retrieved.append(
                    RetrievedChunk(
                        text=text,
                        similarity_score=similarity,
                        metadata=meta or {},
                    )
                )

            return retrieved
        except Exception as err:
            logger.error("ChromaDB vector search failed: %s", err)
            raise RetrievalError(f"Vector search failed: {str(err)}") from err

    def delete_document_vectors(self, document_id: str) -> None:
        try:
            self.collection.delete(where={"document_id": str(document_id)})
            logger.info("Deleted ChromaDB vectors for document_id '%s'.", document_id)
        except Exception as err:
            logger.warning(
                "Failed to delete vectors for document_id '%s': %s",
                document_id,
                err,
            )
