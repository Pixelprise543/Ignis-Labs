# Ignis Labs

An interactive, AI-powered dashboard that summarizes, ranks, and interprets
NASA's microgravity fire research to deliver fire safety insights for human
space exploration.

## Structure

- `data/` - data pipeline (NASA microgravity combustion experiments -> `experiments.json`)
- `backend/` - FastAPI + AI layer (port 8000)
- `frontend/` - React + Vite + Tailwind dashboard (port 5173)
- `CONTRACT.md` - shared schema and API contract

## Run

```bash
# backend
cd backend && uvicorn main:app --reload --port 8000

# frontend
cd frontend && npm install && npm run dev
```

Copy `.env.example` to `.env` and fill in your values. Never commit `.env`.

## Team

TODO
