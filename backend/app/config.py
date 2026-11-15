"""Environment-backed settings.

Reads the repo-root `.env` first, then `backend/.env`. Missing values fall back
to defaults so the app boots on a clean checkout.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent


def _load_env_files() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    for candidate in (REPO_ROOT / ".env", BACKEND_DIR / ".env"):
        if candidate.exists():
            load_dotenv(candidate, override=False)


def _resolve(raw: str, base: Path) -> Path:
    path = Path(raw).expanduser()
    return path.resolve() if path.is_absolute() else (base / path).resolve()


@dataclass(frozen=True)
class Settings:
    data_path: Path
    mock_path: Path
    llm_provider: str
    llm_api_key: str
    llm_model: str
    cache_dir: Path
    cors_origins: tuple[str, ...]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    _load_env_files()
    origins = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )
    return Settings(
        data_path=_resolve(os.getenv("DATA_PATH", "../data/experiments.json"), BACKEND_DIR),
        mock_path=_resolve(os.getenv("MOCK_PATH", "./mock/experiments.mock.json"), BACKEND_DIR),
        llm_provider=os.getenv("LLM_PROVIDER", "anthropic").strip().lower(),
        llm_api_key=os.getenv("LLM_API_KEY", "").strip(),
        llm_model=os.getenv("LLM_MODEL", "").strip(),
        cache_dir=_resolve(os.getenv("CACHE_DIR", "./.cache"), BACKEND_DIR),
        cors_origins=tuple(item.strip() for item in origins.split(",") if item.strip()),
    )


settings = get_settings()
