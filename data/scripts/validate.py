"""Stage 5 - validate a JSON file against the contract schema.

Usage:  python scripts/validate.py [path]   (default: experiments.json)
Exit code 0 on success, 1 on any violation.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "schema" / "experiment.schema.json"


def validate_file(path: Path) -> list[str]:
    try:
        import jsonschema
    except ImportError:
        return ["jsonschema is not installed - run: python -m pip install -r requirements.txt"]

    if not path.exists():
        return [f"{path} does not exist"]

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"{path} is not valid JSON: {exc}"]

    if not isinstance(data, list):
        return [f"{path} must contain a JSON array of records"]

    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    validator = jsonschema.Draft7Validator(schema)
    errors: list[str] = []
    seen: set[str] = set()
    for index, record in enumerate(data):
        for error in validator.iter_errors(record):
            location = "/".join(str(part) for part in error.absolute_path) or "<root>"
            errors.append(f"record[{index}] {location}: {error.message}")
        record_id = record.get("id") if isinstance(record, dict) else None
        if record_id in seen:
            errors.append(f"record[{index}] id: duplicate id {record_id!r}")
        elif record_id:
            seen.add(record_id)
    return errors


def run(path: Path | None = None) -> None:
    target = path or (ROOT / "experiments.json")
    errors = validate_file(target)
    if errors:
        print(f"validate: FAILED ({len(errors)} problem(s)) in {target.name}")
        for error in errors:
            print(f"  - {error}")
        raise SystemExit(1)
    print(f"validate: ok - {target.name} matches the contract schema")


if __name__ == "__main__":
    argument = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    run(argument)
