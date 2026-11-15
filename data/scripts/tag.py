"""Stage 4 - assign safety_tags from the CONTRACT.md allow-list.

Keyword rules over title/abstract/findings. Existing hand-authored tags are
preserved. Tags outside the allow-list are dropped so validate.py cannot fail on
them later.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
IN = RAW / "normalized.json"
OUT = RAW / "tagged.json"

ALLOWED = (
    "flammability",
    "material-selection",
    "detection",
    "suppression",
    "smoldering",
    "flame-spread",
    "extinction",
    "cabin-atmosphere",
)

RULES: dict[str, tuple[str, ...]] = {
    "flammability": ("flammab", "ignit", "burn", "combust"),
    "material-selection": ("material", "sample", "polymer", "alloy", "insulation"),
    "detection": ("detect", "sensor", "alarm", "monitor"),
    "suppression": ("suppress", "extinguish agent", "extinguisher", "inert gas", "co2"),
    "smoldering": ("smolder", "smoulder", "char", "heterogeneous"),
    "flame-spread": ("flame spread", "spread rate", "flame propagation"),
    "extinction": ("extinct", "blow-off", "blowoff", "quench", "limit"),
    "cabin-atmosphere": ("atmosphere", "oxygen", "pressure", "ventilation", "cabin"),
}


def haystack(record: dict) -> str:
    parts = [record.get("title", ""), record.get("abstract", ""), record.get("fuel_material", "")]
    parts.extend(record.get("key_findings", []))
    return " ".join(parts).lower()


def assign(record: dict) -> list[str]:
    text = haystack(record)
    tags = [tag for tag in record.get("safety_tags", []) if tag in ALLOWED]
    for tag, keywords in RULES.items():
        if tag not in tags and any(keyword in text for keyword in keywords):
            tags.append(tag)
    return [tag for tag in ALLOWED if tag in tags]


def run() -> None:
    if not IN.exists():
        print("tag: nothing to do (run normalize.py first)")
        return
    records = json.loads(IN.read_text(encoding="utf-8"))
    for record in records:
        record["safety_tags"] = assign(record)
    OUT.write_text(
        json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"tag: {len(records)} record(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    run()
