# Shared Contract

Change only with team agreement, then everyone pulls.

## Layout

- `/data` - data pipeline
- `/backend` - Python, FastAPI, port 8000, CORS open for localhost:5173
- `/frontend` - React + Vite + Tailwind, port 5173, proxy `/api` to http://localhost:8000

## Data: `/data/experiments.json` (array of records)

```json
{
  "id": "string, stable slug",
  "title": "string",
  "year": "number | null",
  "platform": "ISS | drop tower | parabolic flight | sounding rocket | free-flyer | other",
  "fuel_material": "string",
  "atmosphere": {
    "o2_percent": "number | null",
    "pressure_kpa": "number | null",
    "flow_cm_s": "number | null"
  },
  "abstract": "string",
  "key_findings": ["string"],
  "safety_tags": ["flammability", "material-selection", "detection", "suppression", "smoldering", "flame-spread", "extinction", "cabin-atmosphere"],
  "source_url": "string"
}
```

Use null for unknown values. Never invent data. Every record needs a real `source_url`.

## Enriched experiment (backend output)

The record above plus:

- `ai_summary`: string
- `safety_relevance_score`: number 0-100
- `rationale`: string
- `mission_implications`: string

## API

- `GET /api/experiments?q=&platform=&tag=&sort=`
- `GET /api/experiments/{id}`
- `GET /api/rankings?relevance=0.5&confidence=0.3&recency=0.2` (adds `rank` and `score_breakdown`)
- `GET /api/compare?ids=a,b,c`
- `POST /api/insights` body `{experiment_ids: string[], question?: string}` -> `{insight: string, citations: string[]}`
- `GET /api/health` -> `{status: "ok"}`
