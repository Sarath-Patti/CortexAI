import uuid
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from app.ai.service import AIService
from app.dependencies import (
    get_ai_service,
    get_current_user,
    get_knowledge_service,
)
from app.knowledge.exceptions import (
    DocumentProcessingError,
    EmbeddingError,
    KnowledgeException,
    RetrievalError,
    UnsupportedFileTypeError,
)
from app.knowledge.schemas import (
    DocumentSchema,
    DocumentUploadResponse,
    KnowledgeChatRequest,
    KnowledgeChatResponse,
    SearchRequest,
    SearchResponse,
)
from app.knowledge.service import KnowledgeService
from app.models.user import User

router = APIRouter(prefix="/knowledge", tags=["Document Intelligence & RAG"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Ingest Document",
)
async def upload_document(
    file: Annotated[UploadFile, File(...)],
    knowledge_service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_id: Annotated[str | None, Form()] = None,
):
    """
    Upload a document (PDF, DOCX, TXT, MD) to ingest, parse, chunk, embed,
    and index into ChromaDB vector store.
    Requires JWT authentication.
    """
    try:
        content = await file.read()
        ws_uuid = (
            uuid.UUID(workspace_id) if workspace_id and workspace_id.strip() else None
        )

        return await knowledge_service.upload_document(
            file_bytes=content,
            filename=file.filename or "uploaded_document",
            owner_id=current_user.id,
            workspace_id=ws_uuid,
        )
    except UnsupportedFileTypeError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=err.message
        ) from err
    except DocumentProcessingError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err
    except KnowledgeException as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Vector Similarity Search",
)
async def search_documents(
    request: SearchRequest,
    knowledge_service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Execute semantic similarity search across ingested document chunks.
    Requires JWT authentication.
    """
    try:
        return await knowledge_service.search(
            query=request.query,
            workspace_id=request.workspace_id,
            top_k=request.top_k,
        )
    except (EmbeddingError, RetrievalError) as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err


@router.post(
    "/chat",
    response_model=KnowledgeChatResponse,
    summary="Knowledge RAG Chat Completion",
)
async def chat_with_knowledge(
    request: KnowledgeChatRequest,
    knowledge_service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    ai_service: Annotated[AIService, Depends(get_ai_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Execute RAG-augmented query answering using retrieved document context and
    the unified AI Runtime from v0.4.
    Requires JWT authentication.
    """
    try:
        return await knowledge_service.chat_with_knowledge(
            request=request, ai_service=ai_service
        )
    except KnowledgeException as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=err.message,
        ) from err


@router.get(
    "/documents",
    response_model=list[DocumentSchema],
    summary="List Uploaded Documents",
)
async def list_documents(
    knowledge_service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    workspace_id: str | None = None,
):
    """
    Retrieve current user's ingested documents.
    """
    ws_uuid = uuid.UUID(workspace_id) if workspace_id and workspace_id.strip() else None
    return await knowledge_service.list_documents(
        owner_id=current_user.id, workspace_id=ws_uuid
    )


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Document & Vector Embeddings",
)
async def delete_document(
    document_id: uuid.UUID,
    knowledge_service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete document record, chunk database records, local upload file, and
    ChromaDB vectors.
    """
    success = await knowledge_service.delete_document(
        document_id=document_id, owner_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied.",
        )
    return {"message": "Document and associated vectors deleted successfully."}
