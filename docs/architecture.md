# CortexAI Architecture Documentation

## Overview
CortexAI is structured as a decoupled client-server architecture with a Python FastAPI backend and a React + TypeScript frontend. Milestone v0.6 introduces Conversation Intelligence, providing multi-turn conversation persistence, prompt history assembly, Server-Sent Events (SSE) streaming, RAG source citations, and conversation export capabilities.

## Conversation Intelligence Pipeline

```text
                        +----------------------------------+
                        |  User Query / Send Message API   |
                        +----------------------------------+
                                         |
                                         v
                        +----------------------------------+
                        |       ConversationService        |
                        +----------------------------------+
                                  /              \
                                 /                \
                                v                  v
             +-----------------------+   +-----------------------+
             |    KnowledgeService   |   | ConversationRepository|
             |  (RAG Vector Search)  |   | (Fetch Message History|
             +-----------------------+   +-----------------------+
                                 \                /
                                  \              /
                                   v            v
                        +----------------------------------+
                        |         PromptBuilder v2         |
                        | (System + History + RAG + Prompt)|
                        +----------------------------------+
                                         |
                                         v
                        +----------------------------------+
                        |            AIService             |
                        |    (Unified v0.4 AI Runtime)     |
                        +----------------------------------+
                                         |
                                         v
                        +----------------------------------+
                        |   Message DB Record & Citations  |
                        +----------------------------------+
```

### Components
1. **Conversation Models & Repository (`app/models/conversation.py`, `app/conversations/repository.py`)**:
   - `Conversation`: Persistent thread belonging to a User and Workspace.
   - `Message`: Turn object storing role, content, provider, model, token usage, latency (ms), and source citations.
2. **PromptBuilder v2 (`app/ai/prompts/builder.py`)**:
   - Assembles system prompt, prior conversation turns, RAG document context, and the current user prompt into structured messages for provider consumption.
3. **Conversation Engine Service (`app/conversations/service.py`)**:
   - Handles multi-turn chat completions, SSE streaming (`stream_message_sse`), dynamic title generation, and Markdown/JSON conversation exports.
4. **Conversation UI Workspace (`frontend/src/components/chat/`, `frontend/src/pages/ConversationsPage.tsx`)**:
   - Modular React chat workspace containing `ConversationSidebar`, `ChatWindow`, `MessageBubble`, `CitationCard`, and `StreamingMessage`.

## API Endpoints Summary
- `POST /api/v1/conversations`: Create conversation
- `GET /api/v1/conversations`: List conversations
- `GET /api/v1/conversations/search`: Search conversations by title
- `GET /api/v1/conversations/{id}`: Get conversation details & history
- `PATCH /api/v1/conversations/{id}`: Rename conversation
- `DELETE /api/v1/conversations/{id}`: Delete conversation
- `POST /api/v1/conversations/{id}/messages`: Post message & get completion
- `GET /api/v1/conversations/{id}/stream`: Stream response via SSE
- `GET /api/v1/conversations/{id}/export`: Export as Markdown or JSON
