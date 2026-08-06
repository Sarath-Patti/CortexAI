import json
import time
import uuid
from collections.abc import AsyncGenerator

from app.ai.prompts.builder import PromptBuilder
from app.ai.schemas import ChatMessage, ChatRequest
from app.ai.service import AIService
from app.conversations.exceptions import ConversationNotFoundError
from app.conversations.repository import ConversationRepository
from app.conversations.schemas import (
    ConversationExportResponse,
    ConversationSchema,
    MessageSchema,
    SendMessageRequest,
    SendMessageResponse,
)
from app.knowledge.service import KnowledgeService


class ConversationService:
    """
    Core Conversation Engine Service orchestrating chat history, prompt assembly,
    RAG document retrieval, provider completions, and SSE streaming.
    """

    def __init__(
        self,
        repo: ConversationRepository,
        ai_service: AIService,
        knowledge_service: KnowledgeService | None = None,
    ) -> None:
        self.repo = repo
        self.ai_service = ai_service
        self.knowledge_service = knowledge_service

    async def create_conversation(
        self,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
        title: str | None = None,
    ) -> ConversationSchema:
        conv_title = title.strip() if title and title.strip() else "New Conversation"
        conv = await self.repo.create_conversation(
            owner_id=owner_id, workspace_id=workspace_id, title=conv_title
        )
        return ConversationSchema.model_validate(conv)

    async def get_conversation(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> ConversationSchema:
        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            raise ConversationNotFoundError("Conversation not found or access denied.")
        return ConversationSchema.model_validate(conv)

    async def list_conversations(
        self,
        owner_id: uuid.UUID,
        workspace_id: uuid.UUID | None = None,
        query: str | None = None,
    ) -> list[ConversationSchema]:
        convs = await self.repo.list_by_owner(
            owner_id=owner_id, workspace_id=workspace_id, search_query=query
        )
        return [ConversationSchema.model_validate(c) for c in convs]

    async def rename_conversation(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID, new_title: str
    ) -> ConversationSchema:
        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            raise ConversationNotFoundError("Conversation not found or access denied.")
        renamed = await self.repo.rename(conv, new_title.strip())
        return ConversationSchema.model_validate(renamed)

    async def delete_conversation(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> None:
        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            raise ConversationNotFoundError("Conversation not found or access denied.")
        await self.repo.delete(conv)

    async def send_message(
        self,
        conversation_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: SendMessageRequest,
    ) -> SendMessageResponse:
        start_time = time.perf_counter()

        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            raise ConversationNotFoundError("Conversation not found or access denied.")

        # 1. Save user prompt message to DB
        user_msg = await self.repo.create_message(
            conversation_id=conversation_id,
            role="user",
            content=request.prompt,
        )

        # 2. Build history from existing messages
        history: list[ChatMessage] = []
        for m in conv.messages:
            if m.role in {"user", "assistant"}:
                history.append(ChatMessage(role=m.role, content=m.content))

        # 3. Process RAG context if enabled
        citations: list[dict] = []
        augmented_system = request.system_prompt

        if request.rag_enabled and self.knowledge_service:
            ws_id_str = str(conv.workspace_id) if conv.workspace_id else None
            search_res = await self.knowledge_service.search(
                query=request.prompt,
                workspace_id=ws_id_str,
                top_k=request.top_k,
            )

            if search_res.chunks:
                context_blocks = []
                for idx, chunk in enumerate(search_res.chunks, start=1):
                    src_name = chunk.metadata.get("filename", "document")
                    page_num = chunk.metadata.get("page_number", 1)
                    doc_id = chunk.metadata.get("document_id", "")
                    chunk_idx = chunk.metadata.get("chunk_index", 0)

                    citations.append(
                        {
                            "filename": src_name,
                            "page_number": page_num,
                            "similarity_score": chunk.similarity_score,
                            "chunk_identifier": f"{doc_id}_{chunk_idx}",
                            "snippet": chunk.text[:200],
                        }
                    )
                    context_blocks.append(
                        f"[Source {idx}: {src_name} (Page {page_num})]\n{chunk.text}"
                    )

                context_text = "\n\n".join(context_blocks)
                augmented_system = (
                    "You are CortexAI. Use the following retrieved document "
                    "context to answer the user's question accurately.\n\n"
                    f"--- RETRIEVED CONTEXT ---\n{context_text}\n"
                    "--- END CONTEXT ---\n\n"
                    f"{(request.system_prompt or '').strip()}"
                )

        # 4. Construct prompt via PromptBuilder v2
        builder = (
            PromptBuilder()
            .set_system_prompt(augmented_system)
            .set_history(history)
            .set_user_prompt(request.prompt)
        )
        built_result = builder.build()

        # 5. Execute LLM completion via AIService
        chat_req = ChatRequest(
            prompt=built_result.user_prompt,
            system_prompt=built_result.system_prompt,
            history=history,
            provider=request.provider,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,
        )
        ai_res = await self.ai_service.generate_chat(chat_req)

        end_time = time.perf_counter()
        total_latency_ms = round((end_time - start_time) * 1000, 2)

        # 6. Save assistant message to DB
        assistant_msg = await self.repo.create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_res.response,
            provider=ai_res.provider,
            model=ai_res.model,
            token_usage=ai_res.usage.model_dump() if ai_res.usage else None,
            latency_ms=total_latency_ms,
            citations=citations if citations else None,
        )

        # Auto-update title if default
        if conv.title == "New Conversation":
            auto_title = request.prompt[:40] + (
                "..." if len(request.prompt) > 40 else ""
            )
            await self.repo.rename(conv, auto_title)

        return SendMessageResponse(
            conversation_id=conversation_id,
            user_message=MessageSchema.model_validate(user_msg),
            assistant_message=MessageSchema.model_validate(assistant_msg),
        )

    async def stream_message_sse(
        self,
        conversation_id: uuid.UUID,
        owner_id: uuid.UUID,
        prompt: str,
        system_prompt: str | None = None,
        provider: str | None = None,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        rag_enabled: bool = False,
        top_k: int = 5,
    ) -> AsyncGenerator[str, None]:
        start_time = time.perf_counter()

        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
            return

        # 1. Save user message
        await self.repo.create_message(
            conversation_id=conversation_id, role="user", content=prompt
        )

        # 2. Build history
        history: list[ChatMessage] = [
            ChatMessage(role=m.role, content=m.content)
            for m in conv.messages
            if m.role in {"user", "assistant"}
        ]

        # 3. Process RAG context if enabled
        citations: list[dict] = []
        augmented_system = system_prompt

        if rag_enabled and self.knowledge_service:
            ws_id_str = str(conv.workspace_id) if conv.workspace_id else None
            search_res = await self.knowledge_service.search(
                query=prompt,
                workspace_id=ws_id_str,
                top_k=top_k,
            )

            if search_res.chunks:
                context_blocks = []
                for idx, chunk in enumerate(search_res.chunks, start=1):
                    src_name = chunk.metadata.get("filename", "document")
                    page_num = chunk.metadata.get("page_number", 1)
                    doc_id = chunk.metadata.get("document_id", "")
                    chunk_idx = chunk.metadata.get("chunk_index", 0)

                    citations.append(
                        {
                            "filename": src_name,
                            "page_number": page_num,
                            "similarity_score": chunk.similarity_score,
                            "chunk_identifier": f"{doc_id}_{chunk_idx}",
                            "snippet": chunk.text[:200],
                        }
                    )
                    context_blocks.append(
                        f"[Source {idx}: {src_name} (Page {page_num})]\n{chunk.text}"
                    )

                context_text = "\n\n".join(context_blocks)
                augmented_system = (
                    "You are CortexAI. Use the following retrieved document "
                    "context to answer the user's question accurately.\n\n"
                    f"--- RETRIEVED CONTEXT ---\n{context_text}\n"
                    "--- END CONTEXT ---\n\n"
                    f"{(system_prompt or '').strip()}"
                )

        # 4. Construct prompt via PromptBuilder
        builder = (
            PromptBuilder()
            .set_system_prompt(augmented_system)
            .set_history(history)
            .set_user_prompt(prompt)
        )
        built_result = builder.build()

        chat_req = ChatRequest(
            prompt=built_result.user_prompt,
            system_prompt=built_result.system_prompt,
            history=history,
            provider=provider,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        accumulated_text = ""
        async for chunk in self.ai_service.stream_chat(chat_req):
            accumulated_text += chunk
            data_payload = json.dumps({"token": chunk, "text": accumulated_text})
            yield f"data: {data_payload}\n\n"

        end_time = time.perf_counter()
        total_latency_ms = round((end_time - start_time) * 1000, 2)

        # 5. Save complete assistant message to DB
        await self.repo.create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=accumulated_text,
            provider=provider or "default",
            model=model or "default",
            latency_ms=total_latency_ms,
            citations=citations if citations else None,
        )

        # Auto-update title if default
        if conv.title == "New Conversation":
            auto_title = prompt[:40] + ("..." if len(prompt) > 40 else "")
            await self.repo.rename(conv, auto_title)

        payload = {
            "done": True,
            "content": accumulated_text,
            "citations": citations,
        }

        yield f"data: {json.dumps(payload)}\n\n"

    async def export_conversation(
        self,
        conversation_id: uuid.UUID,
        owner_id: uuid.UUID,
        export_format: str = "markdown",
    ) -> ConversationExportResponse:
        conv = await self.repo.get_by_id(conversation_id, owner_id)
        if not conv:
            raise ConversationNotFoundError("Conversation not found or access denied.")

        if export_format.lower() == "json":
            export_dict = {
                "id": str(conv.id),
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "messages": [
                    {
                        "id": str(m.id),
                        "role": m.role,
                        "content": m.content,
                        "provider": m.provider,
                        "model": m.model,
                        "citations": m.citations,
                        "created_at": m.created_at.isoformat(),
                    }
                    for m in conv.messages
                ],
            }
            export_data = json.dumps(export_dict, indent=2)
        else:
            # Default Markdown export
            md_lines = [f"# {conv.title}\n", "_Exported from CortexAI_\n"]
            for m in conv.messages:
                role_title = m.role.capitalize()
                md_lines.append(f"### {role_title}")
                md_lines.append(f"{m.content}\n")
                if m.citations:
                    md_lines.append("**Citations:**")
                    for c in m.citations:
                        md_lines.append(
                            f"- {c.get('filename')} (Page {c.get('page_number')})"
                        )
                    md_lines.append("")
            export_data = "\n".join(md_lines)

        return ConversationExportResponse(
            conversation_id=conv.id,
            title=conv.title,
            format=export_format.lower(),
            export_data=export_data,
        )
