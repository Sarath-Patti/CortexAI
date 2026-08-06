# CortexAI

CortexAI is a modern, modular, production-ready web application platform built with Python FastAPI and React + TypeScript.

## Milestone v0.5 – Document Intelligence (RAG Foundation)

Milestone v0.5 introduces Retrieval-Augmented Generation (RAG), enabling CortexAI to ingest, parse, chunk, embed, and answer questions over uploaded enterprise documents (PDF, DOCX, TXT, MD). The architecture reuses the v0.4 AI Runtime and Provider Abstraction Layer without bypassing the Prompt Builder.

### Key Capabilities
- **Document Ingestion Pipeline**: Ingestion pipeline (`IngestionPipeline`) parsing PDF (`pypdf`), Word (`python-docx`), TXT, and Markdown files into plain UTF-8 text.
- **Recursive Text Chunker**: Recursive chunking algorithm (`DocumentChunker`) with target chunk size ≈ 800 characters, overlap ≈ 150 characters, and rich metadata preservation (filename, page number, workspace, document ID, chunk index).
- **Dense Vector Embeddings**: Embeddings generator (`EmbeddingService`) generating 384-dimensional vector embeddings using `all-MiniLM-L6-v2`.
- **ChromaDB Vector Store**: Vector database (`ChromaRetriever`) storing document chunk text, embeddings, and metadata with cosine similarity search.
- **RAG Knowledge Service**: `KnowledgeService` orchestrating upload, parsing, chunking, embedding generation, vector retrieval, and augmented prompt construction through the existing v0.4 `PromptBuilder` and `AIService`.
- **Knowledge API Endpoints**:
  - `POST /api/v1/knowledge/upload` (Multipart document ingestion)
  - `POST /api/v1/knowledge/search` (Vector similarity search)
  - `POST /api/v1/knowledge/chat` (RAG-augmented Q&A)
  - `GET /api/v1/knowledge/documents` (List ingested documents)
  - `DELETE /api/v1/knowledge/documents/{id}` (Delete database record, local file, and ChromaDB vectors)
- **Knowledge Management UI**: Interactive Drag & Drop file uploader, progress indicator, document inventory table, vector similarity search tool, and modal delete confirmation.
- **AI Playground RAG Integration**: Added "Knowledge RAG Mode" toggle in AI Playground (`/playground`), routing completions through `/knowledge/chat` and displaying retrieved context chunks with similarity scores.

## Architecture Diagram (RAG Pipeline)

```text
 Upload (PDF/DOCX/TXT/MD)
         │
         ▼
  DocumentParser ──────► Extracts UTF-8 Text
         │
         ▼
  DocumentChunker ─────► ~800 Chunks (~150 Overlap)
         │
         ▼
 EmbeddingService ────► all-MiniLM-L6-v2 (384-dim)
         │
         ▼
  ChromaDB / DB ──────► Vector Index & Metadata
         │
         ▼
  ChromaRetriever ────► Similarity Search (Top-K=5)
         │
         ▼
   PromptBuilder ─────► Injects Retrieved Context
         │
         ▼
     AIService ───────► Unified v0.4 AI Runtime
         │
         ▼
   LLM Provider ──────► OpenAI / Ollama Completion
```

## Directory Structure
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI workflow for backend/frontend
├── backend/
│   ├── alembic/                # Database migrations
│   ├── chroma/                 # ChromaDB local vector storage directory
│   ├── uploads/                # Uploaded local file storage directory
│   ├── app/
│   │   ├── ai/                 # Core AI Runtime & Provider Abstraction Module (v0.4)
│   │   ├── knowledge/          # Document Intelligence & RAG Foundation (v0.5)
│   │   │   ├── chunker.py      # Recursive text chunker (~800 chars, ~150 overlap)
│   │   │   ├── embeddings.py   # SentenceTransformers embedding generator
│   │   │   ├── exceptions.py   # Knowledge domain exceptions
│   │   │   ├── ingestion.py    # Parse -> Chunk -> Embed -> Vector index pipeline
│   │   │   ├── parser.py       # PDF, DOCX, TXT, MD text parser
│   │   │   ├── retriever.py    # ChromaDB vector retriever & similarity search
│   │   │   ├── schemas.py      # Upload, Search, Chat RAG schemas
│   │   │   ├── service.py      # KnowledgeService orchestrator
│   │   │   └── __init__.py
│   │   ├── api/
│   │   │   └── v1/             # Versioned API routes & endpoints
│   │   │       ├── endpoints/
│   │   │       │   ├── ai.py   # AI endpoints (/chat, /chat/providers, /chat/models)
│   │   │       │   ├── auth.py
│   │   │       │   ├── health.py
│   │   │       │   ├── knowledge.py # Knowledge RAG endpoints
│   │   │       │   ├── users.py
│   │   │       │   └── workspaces.py
│   │   │       └── router.py
│   │   ├── auth/               # Security & JWT token functions
│   │   ├── core/               # Configuration & Logging
│   │   ├── database/           # Async SQLAlchemy Engine & Session
│   │   ├── models/             # ORM Models (User, Workspace, Document, DocumentChunk)
│   │   ├── repositories/       # Data Access Repositories
│   │   ├── schemas/            # Pydantic Schemas
│   │   ├── services/           # Domain Services
│   │   ├── dependencies.py     # Dependency Injection (get_knowledge_service, get_ai_service)
│   │   └── main.py             # FastAPI Application Entry Point
│   ├── .env.example
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/
│   └── architecture.md         # System Architecture documentation
├── frontend/
│   ├── src/
│   │   ├── api/                # API client & knowledge endpoints (knowledge.ts, ai.ts)
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute guard
│   │   │   ├── layout/         # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/             # Reusable UI primitives
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── hooks/              # Custom hooks (useAuth, useTheme)
│   │   ├── pages/              # Knowledge, Playground, Dashboard, WorkspaceList, Workflows, Settings
│   │   ├── router/             # React Router configuration
│   │   ├── types/              # TypeScript interface contracts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx server configuration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml          # Local development orchestration
└── README.md
```

## API Endpoints

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health status | No |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/v1/workspaces` | Create new workspace | Yes |
| `GET` | `/api/v1/workspaces` | List current user's workspaces | Yes |
| `POST` | `/api/v1/knowledge/upload` | Multipart document upload & ingestion | Yes |
| `POST` | `/api/v1/knowledge/search` | Vector similarity search | Yes |
| `POST` | `/api/v1/knowledge/chat` | RAG-augmented completion via AI Runtime | Yes |
| `GET` | `/api/v1/knowledge/documents` | List ingested documents | Yes |
| `DELETE` | `/api/v1/knowledge/documents/{id}` | Delete document and vector embeddings | Yes |
| `POST` | `/api/v1/chat` | Generate AI completion (SSE streaming supported) | Yes |
| `GET` | `/api/v1/chat/providers` | List registered AI providers & health status | Yes |
| `GET` | `/api/v1/chat/models` | List supported LLM models | Yes |

## Local Setup

### Running with Docker Compose (Recommended)
```bash
docker compose up -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`
