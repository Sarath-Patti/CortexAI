# CortexAI

CortexAI is a modern, modular, production-ready web application platform built with Python FastAPI and React + TypeScript.

## Milestone v0.4 – AI Runtime & Provider Abstraction

Milestone v0.4 establishes the core AI infrastructure for CortexAI. It provides a production-grade provider abstraction layer supporting multiple LLM providers (OpenAI, Ollama) behind a single unified interface (`BaseLLMProvider`). The runtime handles provider selection, model resolution, prompt construction, structured latency logging, token usage tracking, and SSE streaming.

### Key Capabilities
- **Provider Abstraction**: Unified `BaseLLMProvider` interface defining `generate()`, `stream()`, `health_check()`, and `list_models()`.
- **Pluggable Providers**: Pluggable provider implementations (`OpenAIProvider`, `OllamaProvider`) that can be swapped without altering business logic or API contracts.
- **Provider Registry**: `ProviderRegistry` managing provider lookup, health status, default selection, and model discovery.
- **Prompt Builder**: `PromptBuilder` separating prompt composition (system prompts, user queries, conversation history) from provider execution.
- **AI Conversation Service**: `AIService` managing model selection, prompt building, execution delegation, latency timing (in ms), and structured logging.
- **Unified API Endpoints**: `POST /api/v1/chat` (supporting completion and SSE streaming), `GET /api/v1/chat/providers`, and `GET /api/v1/chat/models`.
- **AI Playground UI**: Enterprise Playground page (`/playground`) featuring provider & model selectors, temperature slider, max token inputs, system/user prompt textareas, streaming mode toggle, and completion output panel with latency & token usage metrics.

## Screenshots (UI Preview)

```text
+-----------------------------------------------------------------------------------+
|  [Cpu] CortexAI      [ Search workspaces... ]               (Sun/Moon)  [Jane D.] |
+------------------+----------------------------------------------------------------+
|  [#] Dashboard   |  AI Playground (v0.4 Runtime)                                  |
|  [#] Workspaces  |  +-------------------+  +------------------------------------+ |
|  [*] Playground  |  | Provider: OLLAMA  |  | Model Output Response              | |
|  [#] Knowledge   |  | Model: Llama 3    |  | [Ollama - llama3]                  | |
|  [#] Workflows   |  | Temp: 0.7         |  | Benefits of provider abstraction.. | |
|  [#] Settings    |  | Max Tokens: 1000  |  | Latency: 14.2 ms | Total: 180 tokens| |
|                  |  +-------------------+  +------------------------------------+ |
+------------------+----------------------------------------------------------------+
```

## Directory Structure
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI workflow for backend/frontend
├── backend/
│   ├── alembic/                # Alembic database migrations
│   ├── app/
│   │   ├── ai/                 # Core AI Runtime & Provider Abstraction Module
│   │   │   ├── prompts/        # PromptBuilder & PromptTemplate implementations
│   │   │   │   ├── builder.py
│   │   │   │   ├── templates.py
│   │   │   │   └── __init__.py
│   │   │   ├── providers/      # Pluggable LLM Providers & Registry
│   │   │   │   ├── base.py
│   │   │   │   ├── ollama_provider.py
│   │   │   │   ├── openai_provider.py
│   │   │   │   ├── registry.py
│   │   │   │   └── __init__.py
│   │   │   ├── exceptions.py   # AI domain exceptions
│   │   │   ├── schemas.py      # ChatRequest, ChatResponse, ProviderInfo, ModelInfo
│   │   │   ├── service.py      # AIService conversation orchestrator
│   │   │   └── __init__.py
│   │   ├── api/
│   │   │   └── v1/             # API v1 routers & endpoints
│   │   │       ├── endpoints/
│   │   │       │   ├── ai.py   # AI endpoints (/chat, /chat/providers, /chat/models)
│   │   │       │   ├── auth.py
│   │   │       │   ├── health.py
│   │   │       │   ├── users.py
│   │   │       │   └── workspaces.py
│   │   │       └── router.py
│   │   ├── auth/               # Security & JWT token functions
│   │   ├── core/               # Configuration (OpenAI/Ollama settings) & Logging
│   │   ├── database/           # Async SQLAlchemy Engine & Session
│   │   ├── models/             # ORM Models (User, Workspace)
│   │   ├── repositories/       # Data Access Repositories
│   │   ├── schemas/            # Pydantic Schemas
│   │   ├── services/           # Domain Services
│   │   ├── dependencies.py     # Dependency Injection (get_ai_service)
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
│   │   ├── api/                # API client & AI endpoints (ai.ts)
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute navigation guard
│   │   │   ├── layout/         # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/             # Reusable UI primitives
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── hooks/              # Custom hooks (useAuth, useTheme)
│   │   ├── pages/              # Playground, Dashboard, WorkspaceList, Knowledge, Workflows, Settings
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
| `GET` | `/api/v1/workspaces/{id}` | Get specific workspace details | Yes |
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

### Environment Configuration (AI Providers)
Set the following environment variables in `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_PROVIDER=ollama
DEFAULT_MODEL=llama3
AI_REQUEST_TIMEOUT=60.0
```
