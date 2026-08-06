import time
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.schemas import ChatRequest
from app.ai.service import AIService
from app.core.logging import logger
from app.knowledge.embeddings import EmbeddingService
from app.knowledge.exceptions import DocumentProcessingError
from app.knowledge.ingestion import IngestionPipeline
from app.knowledge.retriever import ChromaRetriever
from app.knowledge.schemas import (
    DocumentUploadResponse,
    KnowledgeChatRequest,
    KnowledgeChatResponse,
    SearchResponse,
)
from app.models.document import Document, DocumentChunk


class KnowledgeService:
    """
    Core Knowledge Base Service orchestrating document upload, parsing, chunking,
    embedding generation, vector retrieval, and RAG-augmented AI chat.
    """

    def __init__(
        self,
        db: AsyncSession,
        pipeline: IngestionPipeline | None = None,
        embedding_service: EmbeddingService | None = None,
        retriever: ChromaRetriever | None = None,
        uploads_dir: str = "uploads",
    ) -> None:
        self.db = db
        self.pipeline = pipeline or IngestionPipeline()
        self.embedding_service = embedding_service or EmbeddingService()
        self.retriever = retriever or ChromaRetriever()
        self.uploads_dir = Path(uploads_dir)
        self.uploads_dir.mkdir(parents=True, exist_ok=True)

    async def upload_document(
        self,
        file_bytes: bytes,
        filename: str,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
    ) -> DocumentUploadResponse:
        document_id = uuid.uuid4()
        ext = Path(filename).suffix.lower()

        # Save local upload copy
        file_path = self.uploads_dir / f"{document_id}_{filename}"
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # Create ORM Document
        doc = Document(
            id=document_id,
            workspace_id=workspace_id,
            owner_id=owner_id,
            filename=filename,
            file_type=ext,
            size=len(file_bytes),
            status="processing",
            chunk_count=0,
        )
        self.db.add(doc)
        await self.db.commit()

        try:
            # Process via Ingestion Pipeline (Parse -> Chunk -> Embed -> Vector DB)
            chunks = self.pipeline.process_file(
                file_bytes=file_bytes,
                filename=filename,
                document_id=document_id,
                workspace_id=workspace_id,
            )

            # Create DB DocumentChunk records
            for c in chunks:
                d_chunk = DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=document_id,
                    chunk_index=c.chunk_index,
                    text=c.text,
                    page_number=c.page_number,
                    metadata_json=c.metadata,
                )
                self.db.add(d_chunk)

            doc.status = "completed"
            doc.chunk_count = len(chunks)
            await self.db.commit()
            await self.db.refresh(doc)

            return DocumentUploadResponse(
                document_id=str(doc.id),
                filename=doc.filename,
                file_type=doc.file_type,
                size=doc.size,
                status=doc.status,
                chunk_count=doc.chunk_count,
            )
        except Exception as err:
            doc.status = "failed"
            await self.db.commit()
            logger.error("Document processing failed for '%s': %s", filename, err)
            raise DocumentProcessingError(f"Processing failed: {str(err)}") from err

    async def search(
        self,
        query: str,
        workspace_id: str | None = None,
        top_k: int = 5,
    ) -> SearchResponse:
        query_vector = self.embedding_service.embed_query(query)
        chunks = self.retriever.search(
            query_embedding=query_vector,
            workspace_id=workspace_id,
            top_k=top_k,
        )
        return SearchResponse(query=query, chunks=chunks)

    async def chat_with_knowledge(
        self,
        request: KnowledgeChatRequest,
        ai_service: AIService,
    ) -> KnowledgeChatResponse:
        start_time = time.perf_counter()

        # 1. Retrieve top K relevant document chunks via vector search
        search_res = await self.search(
            query=request.prompt,
            workspace_id=request.workspace_id,
            top_k=request.top_k,
        )
        retrieved_chunks = search_res.chunks

        # 2. Build context string from retrieved chunks
        if retrieved_chunks:
            context_blocks = []
            for idx, c in enumerate(retrieved_chunks, start=1):
                src = c.metadata.get("filename", "document")
                page = c.metadata.get("page_number", 1)
                context_blocks.append(f"[Source {idx}: {src} (Page {page})]\n{c.text}")
            formatted_context = "\n\n".join(context_blocks)
            augmented_system_prompt = (
                "You are CortexAI. Use the following retrieved document "
                "context to answer the user's question accurately.\n\n"
                f"--- RETRIEVED CONTEXT ---\n{formatted_context}\n"
                "--- END CONTEXT ---\n\n"
                f"{(request.system_prompt or '').strip()}"
            )
        else:
            augmented_system_prompt = request.system_prompt

        # 3. Delegate to existing AIService using existing ChatRequest
        chat_req = ChatRequest(
            prompt=request.prompt,
            system_prompt=augmented_system_prompt,
            provider=request.provider,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,
        )

        chat_res = await ai_service.generate_chat(chat_req)

        end_time = time.perf_counter()
        total_latency_ms = round((end_time - start_time) * 1000, 2)

        return KnowledgeChatResponse(
            response=chat_res.response,
            provider=chat_res.provider,
            model=chat_res.model,
            latency_ms=total_latency_ms,
            request_id=chat_res.request_id,
            retrieved_chunks=retrieved_chunks,
            usage=chat_res.usage,
        )

    async def list_documents(
        self,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
    ) -> list[Document]:
        stmt = select(Document).where(Document.owner_id == owner_id)
        if workspace_id:
            stmt = stmt.where(Document.workspace_id == workspace_id)
        stmt = stmt.order_by(Document.created_at.desc())

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete_document(
        self,
        document_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> bool:
        stmt = select(Document).where(
            Document.id == document_id, Document.owner_id == owner_id
        )
        res = await self.db.execute(stmt)
        doc = res.scalar_one_or_none()
        if not doc:
            return False

        # 1. Delete ChromaDB vectors
        self.retriever.delete_document_vectors(str(document_id))

        # 2. Delete local uploaded file
        file_path = self.uploads_dir / f"{document_id}_{doc.filename}"
        if file_path.exists():
            file_path.unlink()

        # 3. Delete DB record (cascade deletes chunks)
        await self.db.delete(doc)
        await self.db.commit()
        return True
