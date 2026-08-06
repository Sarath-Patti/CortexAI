# CortexAI

CortexAI is a modern, modular, production-ready enterprise AI platform built with Python FastAPI and React + TypeScript.

## Milestone v0.6 – Conversation Intelligence

Milestone v0.6 transforms CortexAI into a persistent enterprise conversation platform. It introduces multi-turn conversation state persistence, SSE streaming responses, source citations display, prompt context assembly (PromptBuilder v2), conversation sidebar management (search, rename, delete), and Markdown/JSON export capabilities.

### Key Capabilities
- **Conversation Engine**: Database models (`Conversation` and `Message`) backed by PostgreSQL and SQLAlchemy 2.x. Every turn is persisted asynchronously with token usage, latency metrics, and citations.
- **Prompt Builder v2**: Extended prompt builder (`PromptBuilder`) assembling system instructions, prior conversation turns, RAG document context, and current user prompts.
- **SSE Real-Time Streaming**: Server-Sent Events endpoint (`GET /api/v1/conversations/{id}/stream`) utilizing the provider streaming abstraction.
- **RAG Source Citations**: Grounding citations showing source document filename, page number, similarity score percentage, and chunk identifier below responses.
- **Enterprise Chat UI**: Complete chat workspace (`/conversations`) featuring a conversation sidebar (`ConversationSidebar`), auto-scroll chat window (`ChatWindow`), formatted message bubbles (`MessageBubble`), citation cards (`CitationCard`), and streaming animations (`StreamingMessage`).
- **Conversation Export**: Export chat history to Markdown (`.md`) or JSON (`.json`).

## Architecture Diagram (Conversation Pipeline)

```text
 User Input / Prompt ──► ConversationService ──► Fetch Context (KnowledgeService)
                               │                               │
                               ▼                               ▼
                      PromptBuilder v2 ◄────────── Document Citations
                               │
                               ▼
                       AIService / Runtime ─────► LLM Provider (OpenAI / Ollama)
                               │
                               ▼
                    ConversationRepository ────► PostgreSQL (Conversation & Message)
                               │
                               ▼
                     SSE Event Stream / UI ────► React Chat Window & Sidebar
```

## Directory Structure
```text
CortexAI/
├── backend/
│   ├── app/
│   │   ├── ai/                 # Core AI Runtime & Provider Abstraction (v0.4)
│   │   ├── conversations/      # Conversation Intelligence Module (v0.6)
│   │   │   ├── exceptions.py   # Domain exceptions
│   │   │   ├── repository.py   # Database persistence repository
│   │   │   ├── schemas.py      # Conversation & Message Pydantic models
│   │   │   ├── service.py      # Conversation engine service & exporter
│   │   │   └── __init__.py
│   │   ├── knowledge/          # Document Intelligence & RAG Foundation (v0.5)
│   │   ├── api/
│   │   │   └── v1/             # Versioned API routes & endpoints
│   │   │       ├── endpoints/
│   │   │       │   ├── conversations.py # Conversation endpoints
│   │   │       │   ├── ai.py
│   │   │       │   ├── knowledge.py
│   │   │       │   ├── auth.py
│   │   │       │   └── workspaces.py
│   │   │       └── router.py
│   │   ├── models/             # ORM Models (User, Workspace, Document, Conversation, Message)
│   │   ├── dependencies.py     # Dependency Injection
│   │   └── main.py             # FastAPI Entry Point
├── docs/
│   └── architecture.md         # System Architecture documentation
├── frontend/
│   ├── src/
│   │   ├── api/                # API client (conversations.ts, knowledge.ts, ai.ts)
│   │   ├── components/
│   │   │   ├── chat/           # Chat UI components (Sidebar, Window, Bubble, Citation, Streaming)
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── pages/              # ConversationsPage, Knowledge, Playground, Dashboard
│   │   ├── router/
│   │   └── types/
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/conversations` | Create a new conversation thread | Yes |
| `GET` | `/api/v1/conversations` | List conversations (with workspace & search filters) | Yes |
| `GET` | `/api/v1/conversations/search` | Search conversations by title | Yes |
| `GET` | `/api/v1/conversations/{id}` | Get conversation details and message history | Yes |
| `PATCH` | `/api/v1/conversations/{id}` | Rename conversation title | Yes |
| `DELETE` | `/api/v1/conversations/{id}` | Delete conversation and all messages | Yes |
| `POST` | `/api/v1/conversations/{id}/messages` | Send message and execute AI completion | Yes |
| `GET` | `/api/v1/conversations/{id}/stream` | Stream response tokens via Server-Sent Events (SSE) | Yes |
| `GET` | `/api/v1/conversations/{id}/export` | Export conversation as Markdown or JSON | Yes |

## Local Setup

```bash
docker compose up -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
