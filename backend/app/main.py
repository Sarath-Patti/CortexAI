from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import ai, auth, knowledge, users, workspaces
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.database.base import Base
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager for startup and shutdown events.
    Creates database tables if they do not exist.
    """
    logger.info("Starting %s v%s...", settings.PROJECT_NAME, settings.VERSION)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database models initialized successfully.")
    yield
    await engine.dispose()
    logger.info("Shutting down %s...", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Versioned API Router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount endpoint routers without the API version prefix.
app.include_router(auth.router, prefix="/auth", tags=["Auth Direct"])
app.include_router(users.router, prefix="/users", tags=["Users Direct"])
app.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces Direct"])
app.include_router(ai.router, prefix="/chat", tags=["AI Direct"])
app.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Direct"])


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for basic verification.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": settings.VERSION,
    }
