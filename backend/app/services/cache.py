"""Tiny disk cache for LLM results.

Keyed by a hash of the prompt, so identical inputs never re-hit the provider.
Failures are silent: a broken cache must never break a request.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from ..config import settings


def _path_for(key: str) -> Path:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return settings.cache_dir / f"{digest}.json"


def get(key: str) -> dict | None:
    path = _path_for(key)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def set(key: str, value: dict) -> None:
    path = _path_for(key)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")
    except OSError:
        pass
