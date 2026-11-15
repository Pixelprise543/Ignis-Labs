"""Run the whole pipeline: collect -> clean -> normalize -> tag -> validate.

Writes data/experiments.json. Safe to re-run; each stage is idempotent and
intermediate artifacts live in the gitignored raw/ directory.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
ROOT = SCRIPTS.parent
sys.path.insert(0, str(SCRIPTS))

import clean  # noqa: E402
import collect  # noqa: E402
import normalize  # noqa: E402
import tag  # noqa: E402
import validate  # noqa: E402

TAGGED = ROOT / "raw" / "tagged.json"
OUTPUT = ROOT / "experiments.json"


def run() -> None:
    print("== collect ==")
    collect.run()
    print("== clean ==")
    clean.run()
    print("== normalize ==")
    normalize.run()
    print("== tag ==")
    tag.run()

    records = json.loads(TAGGED.read_text(encoding="utf-8")) if TAGGED.exists() else []
    OUTPUT.write_text(
        json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"build: wrote {len(records)} record(s) -> {OUTPUT.relative_to(ROOT)}")

    print("== validate ==")
    validate.run(OUTPUT)
    print("build: done")


if __name__ == "__main__":
    run()
