"""Stage 3 - map seed records onto the CONTRACT.md shape.

Every field in the schema is emitted. Anything unknown becomes null (numbers) or
an empty list, never a guess.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "curated" / "seed.json"
RAW = ROOT / "raw"
CLEAN = RAW / "clean.json"
OUT = RAW / "normalized.json"

ATMOSPHERE_KEYS = ("o2_percent", "pressure_kpa", "flow_cm_s")


def as_number(value) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    return None


def normalize_atmosphere(source: dict) -> dict:
    atmosphere = source.get("atmosphere") or {}
    if not isinstance(atmosphere, dict):
        atmosphere = {}
    return {key: as_number(atmosphere.get(key)) for key in ATMOSPHERE_KEYS}


def normalize_record(source: dict, cleaned: dict[str, str]) -> dict:
    record_id = source.get("id", "")
    abstract = (source.get("abstract") or "").strip()
    if not abstract:
        abstract = cleaned.get(record_id, "")

    findings = source.get("key_findings") or []
    if not isinstance(findings, list):
        findings = []

    tags = source.get("safety_tags") or []
    if not isinstance(tags, list):
        tags = []

    return {
        "id": record_id,
        "title": (source.get("title") or "").strip(),
        "year": as_number(source.get("year")),
        "platform": source.get("platform") or "other",
        "fuel_material": (source.get("fuel_material") or "").strip(),
        "atmosphere": normalize_atmosphere(source),
        "abstract": abstract,
        "key_findings": [str(item).strip() for item in findings if str(item).strip()],
        "safety_tags": [str(item) for item in tags],
        "source_url": (source.get("source_url") or "").strip(),
    }


def run() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    seed = json.loads(SEED.read_text(encoding="utf-8")) if SEED.exists() else []
    cleaned = json.loads(CLEAN.read_text(encoding="utf-8")) if CLEAN.exists() else {}
    records = [normalize_record(item, cleaned) for item in seed if isinstance(item, dict)]
    OUT.write_text(
        json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"normalize: {len(records)} record(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    run()
