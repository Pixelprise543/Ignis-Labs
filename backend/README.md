# Backend

FastAPI + AI layer. Port **8000**. CORS open for `localhost:5173`.

## Run

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs: <http://localhost:8000/docs>

## Configuration

Reads the repo-root `.env` first, then `backend/.env`. Every value has a default,
so the app boots on a clean checkout.

| Variable | Default | Notes |
|---|---|---|
| `DATA_PATH` | `../data/experiments.json` | read-only |
| `MOCK_PATH` | `./mock/experiments.mock.json` | used when `DATA_PATH` is empty |
| `LLM_PROVIDER` | `anthropic` | or `openai` |
| `LLM_API_KEY` | *(empty)* | **unset means no LLM calls** |
| `LLM_MODEL` | provider default | |
| `CACHE_DIR` | `./.cache` | gitignored |
| `CORS_ORIGINS` | `localhost:5173,127.0.0.1:5173` | comma-separated |

### Offline behaviour

With no `LLM_API_KEY`, `services/enrichment.py` uses a deterministic heuristic
and `services/grounding.py` synthesises insights by reordering real records. The
API never 500s because the environment is incomplete — it just stops being
"AI" and becomes arithmetic over the same data.

## Endpoints

All under `/api`. Shapes match `CONTRACT.md`.

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{status:"ok"}` |
| GET | `/api/experiments?q=&platform=&tag=&sort=` | `EnrichedExperiment[]` |
| GET | `/api/experiments/{id}` | `EnrichedExperiment` (404 if unknown) |
| GET | `/api/rankings?relevance=&confidence=&recency=` | `RankedExperiment[]` |
| GET | `/api/compare?ids=a,b,c` | `EnrichedExperiment[]` in requested order |
| POST | `/api/insights` | `{insight, citations}` |

`sort` accepts `relevance` (default), `year`, `title`, `id`.

## Layout

```
app/
  main.py            wiring only: CORS + routers
  config.py          env-backed settings
  models.py          Pydantic models mirroring CONTRACT.md
  data_loader.py     read-only corpus access, mock fallback
  routers/           one module per endpoint group
  services/          llm, enrichment, ranking, grounding, cache
  prompts/           LLM prompt templates
tests/               ranking, grounding, API shapes
```

## Tests

```bash
cd backend
python -m pytest
```

`test_api_shapes.py` asserts every endpoint returns the keys `CONTRACT.md`
promises, so a contract drift fails CI rather than the frontend.

## Mock data

`mock/experiments.mock.json` is **synthetic** — every id is `mock-*`, every
`source_url` uses the reserved `example.invalid` domain, and every abstract is
prefixed `[MOCK]`. It exists so the dashboard runs before real records are
curated. Never present it as real research.
