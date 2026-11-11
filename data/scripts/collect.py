"""Stage 1 - download each seed record's source into raw/.

Network only. Never invents anything: a failed fetch is reported and skipped,
never filled in with a guess.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "curated" / "seed.json"
RAW = ROOT / "raw"
USER_AGENT = "IgnisLabs-DataPipeline/1.0 (+https://github.com/Pixelprise543/Ignis-Labs)"
TIMEOUT_S = 30


def load_seed() -> list[dict]:
    if not SEED.exists():
        print(f"collect: no seed at {SEED.relative_to(ROOT)}")
        return []
    data = json.loads(SEED.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit(f"{SEED} must contain a JSON array")
    return data


def collect(records: list[dict]) -> int:
    RAW.mkdir(parents=True, exist_ok=True)
    fetched = 0
    for record in records:
        record_id = record.get("id")
        url = record.get("source_url")
        if not record_id or not url:
            print(f"  skip  missing id/source_url: {record.get('title')!r}")
            continue
        target = RAW / f"{record_id}.html"
        if target.exists() and target.stat().st_size:
            print(f"  cache {record_id}")
            continue
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
                payload = response.read()
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            print(f"  FAIL  {record_id}: {exc}")
            continue
        target.write_bytes(payload)
        fetched += 1
        print(f"  ok    {record_id} ({len(payload):,} bytes)")
    return fetched


def run() -> None:
    records = load_seed()
    print(f"collect: {len(records)} seed record(s)")
    fetched = collect(records)
    print(f"collect: {fetched} downloaded")


if __name__ == "__main__":
    run()
