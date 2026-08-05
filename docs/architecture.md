# CortexAI Architecture Documentation

## Overview
CortexAI is structured as a decoupled client-server architecture with a Python FastAPI backend and a React + TypeScript frontend. Milestone v0.4 establishes the core AI Runtime & Provider Abstraction Layer, enabling pluggable LLM provider integrations behind a unified interface.

## AI Runtime & Provider Abstraction Layer

```text
               +----------------------------------+
               |      FastAPI Client Request      |
               |     (POST /api/v1/chat)         |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |            AIService             |
               | (Prompt Building & Timing)       |
               +----------------------------------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
+------------------------+             +------------------------+
|    ProviderRegistry    |             |     PromptBuilder      |
| (Resolves Provider)    |             | (Assembles Messages)   |
+------------------------+             +------------------------+
             |
             +------------------+------------------+
             |                                     |
             v                                     v
+------------------------+             +------------------------+
|     OpenAIProvider     |             |     OllamaProvider     |
| (BaseLLMProvider API)  |             | (BaseLLMProvider API)  |
+------------------------+             +------------------------+
```

### Components
1. **`BaseLLMProvider`**: Abstract base class enforcing `generate()`, `stream()`, `health_check()`, and `list_models()` across all provider implementations.
2. **`ProviderRegistry`**: Dynamic registry mapping provider names (e.g. `'openai'`, `'ollama'`) to singleton instances, exposing default provider lookup and health checks.
3. **`PromptBuilder`**: Separates prompt formatting (system instructions, user prompts, conversation history) from provider execution.
4. **`AIService`**: Orchestrates provider selection, prompt construction, latency measurement (ms), structured logging, token usage metric collection, and SSE streaming delegation.
5. **AI Playground UI**: Enterprise React frontend page (`/playground`) providing interactive provider/model selection, prompt creation, temperature tuning, and completion response rendering.

## Directory Layout
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI Workflow
├── backend/
│   ├── alembic/               # Database migrations
│   ├── app/
│   │   ├── ai/                # AI Runtime & Provider Abstraction Module
│   │   │   ├── prompts/       # PromptBuilder & PromptTemplate
│   │   │   ├── providers/     # BaseLLMProvider, OpenAIProvider, OllamaProvider, ProviderRegistry
│   │   │   ├── exceptions.py  # Domain exceptions
│   │   │   ├── schemas.py     # Pydantic schemas (ChatRequest, ChatResponse, ProviderInfo, ModelInfo)
│   │   │   └── service.py     # AIService conversation service
│   │   ├── api/
│   │   │   └── v1/            # Versioned API routes & endpoints (/chat, /auth, /users, /workspaces)
│   │   ├── auth/              # Security & JWT handling
│   │   ├── core/              # Config, logging, settings
│   │   ├── database/          # Async SQLAlchemy engine & sessions
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic validation models
│   │   ├── services/          # Business logic services
│   │   ├── dependencies.py    # FastAPI dependencies (get_ai_service)
│   │   └── main.py            # FastAPI entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/                      # Architectural documentation
├── frontend/
│   ├── src/
│   │   ├── api/               # API fetch client & service endpoints (ai.ts)
│   │   ├── components/
│   │   │   ├── auth/          # ProtectedRoute guard
│   │   │   ├── layout/        # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/            # Reusable primitives
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── hooks/             # Custom hooks (useAuth, useTheme)
│   │   ├── pages/             # Playground, Dashboard, Workspaces, Knowledge, Workflows, Settings
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
