# CortexAI

CortexAI is a modern, modular, production-ready web application platform built with Python FastAPI and React + TypeScript.

## Milestone v0.3 – Enterprise Workspace Experience

Milestone v0.3 elevates CortexAI into a modern enterprise SaaS application with a sleek, responsive workspace shell, full theme support (Light, Dark, System preference), reusable UI component primitives, collapsible navigation sidebar, personalized dashboard analytics, and tabbed user settings.

### Key Capabilities
- **Application Shell**: Collapsible sidebar, sticky topbar with global search and breadcrumbs, user profile dropdown, and responsive mobile drawer navigation.
- **Navigation Structure**: Active route highlighting for Dashboard (`/`), Workspaces (`/workspaces`), Knowledge (`/knowledge`), Workflows (`/workflows`), and Settings (`/settings`).
- **Personalized Dashboard**: Welcome banner, statistics overview cards, quick actions bar, recent workspaces grid, and real-time activity timeline.
- **Workspace Experience**: Responsive grid layout with instant search filtering, multi-criteria sorting (Newest, Oldest, A-Z, Z-A), empty state handling, and interactive Create Workspace modal.
- **Settings & Preferences**: Tabbed configuration views for User Profile (functional), Theme Appearance (functional), Notifications, Preferences, and API Keys preview.
- **Theme Support**: Class-based theme engine (`ThemeContext`) with light, dark, and system auto-detection modes persisted via `localStorage`.
- **Reusable UI Design System**: Component primitives (`Button`, `Card`, `Input`, `Badge`, `Modal`, `Dropdown`, `Tabs`) enforcing consistent styling and accessible form controls.

## Screenshots (UI Preview)

```text
+-----------------------------------------------------------------------------------+
|  [Cpu] CortexAI      [ Search workspaces... ]               (Sun/Moon)  [Jane D.] |
+------------------+----------------------------------------------------------------+
|  [#] Dashboard   |  Welcome back, Jane!                                           |
|  [#] Workspaces  |  +-------------------+  +-------------------+  +---------------+ |
|  [#] Knowledge   |  | Workspaces: 4     |  | Documents: 24     |  | Workflows: 8  | |
|  [#] Workflows   |  +-------------------+  +-------------------+  +---------------+ |
|  [*] Settings    |  Recent Workspaces                                             |
|                  |  +-------------------+  +-------------------+                  |
|                  |  | Core Analytics    |  | Finance Pipeline  |                  |
|                  |  +-------------------+  +-------------------+                  |
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
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute navigation guard
│   │   │   ├── layout/         # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/             # Reusable UI primitives (Button, Card, Input, Modal, Dropdown, Tabs, Badge)
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── hooks/              # Custom hooks (useTheme)
│   │   ├── pages/              # Dashboard, WorkspaceList, Knowledge, Workflows, Settings, Login, Register
│   │   ├── router/             # React Router configuration
│   │   ├── types/              # TypeScript interface contracts
│   │   ├── App.tsx
│   │   ├── index.css           # CSS variables, glass panel utility classes, animations
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
