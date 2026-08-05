# CortexAI Backend Service

FastAPI-based modular backend application foundation.

## Features
- **FastAPI**: Modern, fast (high-performance) web framework for building APIs.
- **Pydantic v2 & Settings**: Type safety and environment configuration.
- **API Versioning**: Scalable route organization under `/api/v1`.
- **Structured Logging**: Standardized stdout logging.
- **Health Checks**: `/api/v1/health` monitoring endpoint.

## Local Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run application:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
