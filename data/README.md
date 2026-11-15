# Data pipeline

Turns real NASA microgravity combustion sources into `experiments.json`.

## Hard rule

**Never invent data.** Every record needs a real `source_url` you can open and
verify. Unknown numeric values are `null`, never guessed. An empty
`experiments.json` is a valid, honest state; a fabricated one is not.

`curated/seed.json` is the hand-verified seed and the only place records are
authored by a human. Everything downstream is mechanical.

## Layout

| Path | Purpose |
|---|---|
| `schema/experiment.schema.json` | JSON Schema mirroring `CONTRACT.md` (input fields only) |
| `curated/seed.json` | Hand-verified records with real `source_url`s |
| `raw/` | Downloaded source material — **gitignored** |
| `scripts/` | `collect` → `clean` → `normalize` → `tag` → `validate` → `build` |
| `experiments.json` | Pipeline output, committed so the backend runs without rebuilding |

## Rebuild

```bash
cd data
python -m pip install -r requirements.txt
python scripts/build.py
```

`build.py` runs the whole chain and writes `experiments.json`. Individual stages
can be run alone; each one is idempotent and reads the previous stage's artifact
from `raw/` (gitignored).

## Adding a record

1. Open the source, confirm it is real and public.
2. Append one object to `curated/seed.json` matching the schema.
3. Use `null` for anything the source does not state.
4. Run `python scripts/build.py` — `validate.py` will reject a bad record.

## Sources

Recorded per-entry via `source_url`. Preferred publishers:

- NASA NTRS (`ntrs.nasa.gov`)
- NASA Glenn Research Center combustion pages
- NASA ISS experiment pages (`nasa.gov`)

Do not cite aggregators, blogs, or generated text.

## Status

`curated/seed.json` is currently empty, so `experiments.json` is `[]`. The
backend falls back to `backend/mock/experiments.mock.json` until real records
land, which keeps the dashboard runnable without inventing science.
