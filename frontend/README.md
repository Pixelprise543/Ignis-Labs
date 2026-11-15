# Frontend

React + Vite + TypeScript + Tailwind. Port **5173**. Proxies `/api` to
`http://localhost:8000`.

## Run

```bash
cd frontend
cp .env.example .env      # required — Vite reads env from THIS folder
npm install
npm run dev
```

**Env gotcha:** Vite loads `.env` from the project root, i.e. `frontend/`. The
repo-root `.env.example` is for the backend. If you skip the copy step,
`VITE_USE_MOCKS` is `undefined`, which means "not `false`", which means mock
mode — the app still works, but you will not be talking to FastAPI even if it is
running.

## Modes

| `VITE_USE_MOCKS` | Behaviour |
|---|---|
| `true` (default) | `mockClient` — no backend needed, synthetic data |
| `false` | `realClient` — `fetch` to `VITE_API_URL` (default same-origin, proxied) |

`src/api/client.ts` picks one; every page only ever sees the `ApiClient`
interface.

## Layout

```
src/
  api/
    types.ts                 mirrors CONTRACT.md (incl. enriched fields)
    client.ts                mock/real switch
    realClient.ts            fetch calls to /api/*
    mockClient.ts            same interface, local filtering + ranking
    mock/experiments.mock.ts synthetic records
  pages/                     Experiments, Rankings, Detail, Compare, Insights
  components/                cards, filters, badges, sliders, citations, charts
  hooks/useApi.ts            loading/error/data wrapper
  lib/format.ts              null-safe formatting
  styles/index.css           Tailwind directives
```

## Mock data is duplicated on purpose

`src/api/mock/experiments.mock.ts` mirrors
`backend/mock/experiments.mock.json` by hand. Two copies, same content, so
`VITE_USE_MOCKS=true` and `false` return identical results. **If you edit one,
edit the other.** Every mock id starts with `mock-`, every `source_url` uses the
reserved `example.invalid` domain, and every abstract is prefixed `[MOCK]` — it
must never be mistaken for real research.

## Charts

No chart library. `ScoreByPlatformChart` is CSS bars; `O2VsScoreChart` is inline
SVG. Both read straight from `EnrichedExperiment[]`. There is deliberately no
"flame spread rate" axis — `CONTRACT.md` has no such field.

## Build

```bash
npm run build      # tsc --noEmit && vite build
```
