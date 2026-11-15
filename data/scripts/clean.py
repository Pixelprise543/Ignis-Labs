"""Stage 2 - strip markup, normalise whitespace, dedupe.

Reads raw/<id>.html, writes raw/clean.json as {id: plain_text}.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "curated" / "seed.json"
RAW = ROOT / "raw"
OUT = RAW / "clean.json"

DROP_BLOCK = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
ANY_TAG = re.compile(r"<[^>]+>")
HSPACE = re.compile(r"[ \t\r\f\v]+")
BLANK_LINES = re.compile(r"\n{3,}")


def to_text(markup: str) -> str:
    text = DROP_BLOCK.sub(" ", markup)
    text = ANY_TAG.sub(" ", text)
    text = html.unescape(text)
    text = HSPACE.sub(" ", text)
    text = "\n".join(line.strip() for line in text.splitlines())
    return BLANK_LINES.sub("\n\n", text).strip()


def seed_ids() -> list[str]:
    if not SEED.exists():
        return []
    data = json.loads(SEED.read_text(encoding="utf-8"))
    return [record["id"] for record in data if isinstance(record, dict) and record.get("id")]


def run() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    cleaned: dict[str, str] = {}
    for record_id in seed_ids():
        source = RAW / f"{record_id}.html"
        if not source.exists():
            print(f"  miss  {record_id} (run collect.py first)")
            continue
        markup = source.read_bytes().decode("utf-8", errors="replace")
        cleaned[record_id] = to_text(markup)
        print(f"  ok    {record_id} ({len(cleaned[record_id]):,} chars)")
    OUT.write_text(
        json.dumps(cleaned, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"clean: {len(cleaned)} record(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    run()
