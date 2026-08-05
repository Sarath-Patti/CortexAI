# CortexAI Architecture Documentation

## Overview
CortexAI is structured as a decoupled client-server architecture with a Python FastAPI backend and a React + TypeScript frontend. Milestone v0.3 introduces an Enterprise Workspace UI layout with theme support (Light/Dark/System), responsive collapsible sidebar navigation, reusable UI component primitives, and modular routing.

## Directory Layout
```text
CortexAI/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI Workflow
├── backend/
│   ├── alembic/               # Database migrations
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/            # Versioned API routes & endpoints
│   │   ├── auth/              # Security & JWT handling
│   │   ├── core/              # Config, logging, settings
│   │   ├── database/          # Async SQLAlchemy engine & sessions
│   │   ├── models/            # SQLAlchemy ORM models
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
│   │   ├── api/               # API fetch client & service endpoints
│   │   ├── components/
│   │   │   ├── auth/          # ProtectedRoute guard
│   │   │   ├── layout/        # Sidebar, Topbar, UserMenu, MobileNav, DashboardLayout
│   │   │   └── ui/            # Reusable primitives (Button, Card, Input, Modal, Dropdown, Tabs, Badge)
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── hooks/             # Custom hooks (useTheme)
│   │   ├── pages/             # Dashboard, Workspaces, Knowledge, Workflows, Settings, Login, Register
│   │   ├── router/            # React Router configuration
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── index.css          # Tailwind directives, CSS variables, glass panel utilities
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf             # Nginx server configuration
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml         # Local orchestration
```

## API & UI Conventions
- **API Prefix**: `/api/v1`
- **UI Architecture**: Modular component structure with clear separation between design system primitives (`components/ui/`), application layout shell (`components/layout/`), and feature page views (`pages/`).
- **Theme Engine**: `ThemeContext` supporting `'light'`, `'dark'`, and `'system'` preferences with persistent `localStorage` storage and OS preference detection.
