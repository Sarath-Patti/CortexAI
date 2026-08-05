# CortexAI

CortexAI is a modern, modular, production-ready web application platform.

## Project Purpose
CortexAI provides a clean engineering foundation separating backend service APIs from frontend user interfaces. Milestone v0.1 establishes the architecture, directory standards, environment configuration, containerization, and CI pipelines without business or AI logic placeholders.

## Directory Structure
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI workflow for backend/frontend
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/             # Version 1 routers & endpoints
│   │   │       ├── endpoints/
│   │   │       │   └── health.py
│   │   │       └── router.py
│   │   ├── core/               # Configuration & Logging
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   └── main.py             # FastAPI entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/
│   └── architecture.md         # System Architecture documentation
├── frontend/
│   ├── src/
│   │   ├── api/                # Typed API client structure
│   │   ├── components/         # Reusable layouts & UI components
│   │   ├── pages/              # View pages (Home)
│   │   ├── router/             # Client-side routing
│   │   ├── types/              # TypeScript interface contracts
│   │   ├── App.tsx
│   │   ├── index.css           # Tailwind styles & tokens
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── infrastructure/
│   └── docker/
│       └── nginx.conf
├── .dockerignore
├── .gitignore
├── docker-compose.yml          # Local development orchestration
└── README.md
```

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (Optional for containerized setup)

### Running with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`

### Manual Local Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Development Workflow
1. **Branching & PRs**: Create feature branches off `main` or `develop`.
2. **Backend**: Keep routes versioned inside `backend/app/api/v1/endpoints/`.
3. **Frontend**: Maintain reusable UI elements under `src/components/` and page-level components under `src/pages/`.
4. **API Integration**: Add typed endpoint wrappers under `frontend/src/api/` using `apiClient`.
5. **Continuous Integration**: Pushing to `main` or opening PRs triggers GitHub Actions CI to run formatting checks, linter rules, and build verifications.
