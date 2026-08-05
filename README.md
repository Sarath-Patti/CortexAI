# CortexAI

CortexAI is a modern, modular, production-ready web application platform built with Python FastAPI and React + TypeScript.

## Milestone v0.2 – Identity & Persistence

Milestone v0.2 transforms CortexAI into a SaaS backend by implementing user authentication, PostgreSQL persistence with SQLAlchemy 2.x and Alembic, layered architecture (Repository pattern & Service layer), and workspace management.

### Key Capabilities
- **Authentication**: User registration, login, password hashing (`passlib`/`bcrypt`), and JWT access tokens.
- **Database & Persistence**: PostgreSQL with async SQLAlchemy 2.x, Alembic schema migrations, and relational user-workspace mapping.
- **Architecture**: Strict separation of concerns via Repositories, Services, Schemas, and Dependency Injection. Routers remain thin controllers.
- **Frontend App**: Login, Register, Protected Router, Dashboard Shell, and Workspace List/Create UI.

## Directory Structure
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI workflow for backend/frontend
├── backend/
│   ├── alembic/                # Alembic database migrations
│   │   ├── versions/           # Migration revision scripts
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/             # API v1 routers & endpoints
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── health.py
│   │   │       │   ├── users.py
│   │   │       │   └── workspaces.py
│   │   │       └── router.py
│   │   ├── auth/               # Security & JWT token functions
│   │   │   └── security.py
│   │   ├── core/               # Configuration & Logging
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── database/           # Async SQLAlchemy Engine & Session
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/             # SQLAlchemy ORM Models (User, Workspace)
│   │   ├── repositories/       # Data Access Repositories (UserRepository, WorkspaceRepository)
│   │   ├── schemas/            # Pydantic Schemas (User, Workspace, Auth)
│   │   ├── services/           # Domain Services (AuthService, UserService, WorkspaceService)
│   │   ├── dependencies.py     # Dependency Injection & get_current_user
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
│   │   ├── api/                # API client & auth/workspace service endpoints
│   │   ├── components/         # Layout & ProtectedRoute components
│   │   ├── context/            # AuthContext state provider
│   │   ├── pages/              # Login, Register, WorkspaceList pages
│   │   ├── router/             # React Router setup
│   │   ├── types/              # TypeScript interface contracts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx server configuration
│   ├── package.json
│   └── vite.config.ts
├── .dockerignore
├── .gitignore
├── docker-compose.yml          # Local development orchestration (PostgreSQL + Backend + Frontend)
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

## Local Setup

### Running with Docker Compose (Recommended)
```bash
docker compose up -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

### Manual Setup

1. **Start PostgreSQL**: Make sure PostgreSQL is running locally or via Docker (`docker run -p 5432:5432 -e POSTGRES_USER=cortex -e POSTGRES_PASSWORD=cortex_pass -e POSTGRES_DB=cortexai postgres:15-alpine`).
2. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
