# CortexAI Architecture Documentation

## Overview
CortexAI is structured as a decoupled client-server architecture with a Python FastAPI backend and a React + TypeScript frontend.

## Directory Layout
```
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI Workflow
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/            # Versioned API routes & endpoints
│   │   ├── core/              # Config, logging, settings
│   │   └── main.py            # FastAPI entry point
│   ├── .env.example           # Backend environment template
│   ├── Dockerfile             # Multi-stage Python container
│   ├── pyproject.toml         # Backend project metadata
│   └── requirements.txt       # Dependencies
├── docs/                      # Architectural documentation
├── frontend/
│   ├── src/
│   │   ├── api/               # Reusable fetch client & endpoints
│   │   ├── components/        # Layout & reusable UI elements
│   │   ├── pages/             # Route pages
│   │   ├── router/            # React Router configuration
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── index.css          # Tailwind CSS & design tokens
│   │   └── main.tsx
│   ├── .env.example           # Frontend environment template
│   ├── Dockerfile             # Multi-stage Node/Nginx container
│   ├── nginx.conf             # Nginx server configuration
│   ├── package.json           # Node dependencies & scripts
│   └── vite.config.ts         # Vite bundler configuration
└── docker-compose.yml         # Local orchestration
```

## API Design Conventions
- Prefix: `/api/v1`
- Format: JSON responses
- Error Handling: Standardized status codes and standard JSON error payloads
