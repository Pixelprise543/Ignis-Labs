"""Read-only access to the experiment corpus.

Source of truth is `DATA_PATH` (default ../data/experiments.json). If that file is
missing or empty - which is the honest state before real sources are curated -
the backend falls back to the committed mock so the API stays runnable.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from .config import settings
from .models import EnrichedExperiment
from .services import enrichment


def _read_json(path: Path) -> list[dict]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict)]


@lru_cache(maxsize=1)
def load_experiments() -> tuple[EnrichedExperiment, ...]:
    records = _read_json(settings.data_path)
    if not records:
        records = _read_json(settings.mock_path)
    return tuple(enrichment.enrich(item) for item in records)


def get_experiment(experiment_id: str) -> EnrichedExperiment | None:
    for record in load_experiments():
        if record.id == experiment_id:
            return record
    return None


def using_mock() -> bool:
    return not _read_json(settings.data_path)


def clear_cache() -> None:
    load_experiments.cache_clear()
