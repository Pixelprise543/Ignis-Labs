"""FastAPI application. Wiring only: CORS, routers, no business logic."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import compare, experiments, health, insights, rankings


def create_app() -> FastAPI:
    app = FastAPI(
        title="Ignis Labs API",
        description="Microgravity fire research, summarised and ranked.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for module in (health, experiments, rankings, compare, insights):
        app.include_router(module.router, prefix="/api")

    return app


app = create_app()
