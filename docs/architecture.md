# CortexAI Architecture Documentation

## Overview
CortexAI is structured as a decoupled client-server architecture with a Python FastAPI backend and a React + TypeScript frontend. Milestone v0.5 introduces Document Intelligence and RAG Foundation, providing end-to-end document parsing, recursive text chunking, sentence embeddings, ChromaDB vector indexing, and RAG-augmented query answering over the existing v0.4 AI Runtime.

## RAG & Document Intelligence Pipeline

```text
               +-----------------------------------+
               |  Document Upload (PDF/DOCX/TXT/MD)|
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |          DocumentParser           |
               |      (Extracts UTF-8 Text)        |
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |          DocumentChunker          |
               |   (~800 Chunks, ~150 Overlap)     |
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |         EmbeddingService          |
               |    (all-MiniLM-L6-v2 384-dim)     |
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |          ChromaRetriever          |
               |   (Cosine Vector Similarity)      |
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |           PromptBuilder           |
               |   (Augments System Prompt)        |
               +-----------------------------------+
                                 |
                                 v
               +-----------------------------------+
               |             AIService             |
               |    (Unified v0.4 AI Runtime)      |
               +-----------------------------------+
```

### Components
1. **`DocumentParser`**: Extracts clean UTF-8 text from PDF (`pypdf`), Word (`python-docx`), plain text, and Markdown files.
2. **`DocumentChunker`**: Recursively splits parsed text into chunks (target size ~800 characters, overlap ~150 characters) while maintaining page numbers, document IDs, workspace IDs, and filenames in metadata.
3. **`EmbeddingService`**: Generates 384-dimensional dense vector embeddings using `all-MiniLM-L6-v2`.
4. **`ChromaRetriever`**: Vector database wrapper (`chromadb`) performing cosine similarity search (Top K=5) over indexed document chunks.
5. **`KnowledgeService`**: Service layer orchestrating upload ingestion, similarity search, document deletion, and RAG query execution by augmenting system prompts and calling the existing v0.4 `AIService`.
6. **Frontend Knowledge Hub & Playground RAG**: UI views (`/knowledge` and `/playground`) supporting file drag & drop, upload status tracking, vector search, document deletion, and RAG-augmented AI chat.

## Directory Layout
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI Workflow
├── backend/
│   ├── alembic/               # Database migrations
│   ├── chroma/                # ChromaDB vector store
│   ├── uploads/               # Uploaded files directory
│   ├── app/
│   │   ├── ai/                # AI Runtime & Provider Abstraction Module (v0.4)
│   │   ├── knowledge/         # Document Intelligence & RAG Foundation (v0.5)
│   │   │   ├── chunker.py
│   │   │   ├── embeddings.py
│   │   │   ├── exceptions.py
│   │   │   ├── ingestion.py
│   │   │   ├── parser.py
│   │   │   ├── retriever.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── __init__.py
│   │   ├── api/
│   │   │   └── v1/            # Versioned API routes (/knowledge, /chat, /auth, /workspaces)
│   │   ├── auth/              # Security & JWT handling
│   │   ├── core/              # Config, logging, settings
│   │   ├── database/          # Async SQLAlchemy engine & sessions
│   │   ├── models/            # ORM models (User, Workspace, Document, DocumentChunk)
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic validation models
│   │   ├── services/          # Business logic services
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   └── main.py            # FastAPI entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/                      # Architectural documentation
├── frontend/
│   ├── src/
│   │   ├── api/               # API fetch client & service endpoints (knowledge.ts, ai.ts)
│   │   ├── components/
│   │   │   ├── auth/          # ProtectedRoute guard
│   │   │   ├── layout/        # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/            # Reusable primitives
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── hooks/             # Custom hooks (useAuth, useTheme)
│   │   ├── pages/             # Knowledge, Playground, Dashboard, WorkspaceList, Workflows, Settings
│   │   ├── router/            # React Router configuration
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf             # Nginx server configuration
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml         # Local orchestration
```
