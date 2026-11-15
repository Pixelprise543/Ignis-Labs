# Ask Ignis — NVIDIA NIM provider (pc3-experience)

## Decision
Ask Ignis is powered server-side by `api/si.ts`. The provider is chosen via `SI_PROVIDER` so the model key never reaches the browser:
- unset / `none` → deterministic offline answer (`src/lib/siFallback.ts`), built from the local dataset
- `nvidia` (or any other value with `SI_API_KEY`) → OpenAI-compatible chat-completions call; NVIDIA NIM endpoint `https://integrate.api.nvidia.com/v1/chat/completions` by default

## Why this shape
- The drawer (`AskIgnisDrawer.tsx`) already calls `askSI` → `POST /api/si` and falls back offline on any failure, so no client change was needed to switch providers.
- Every provider answer passes through `auditCitations` (`src/lib/citations.ts`), which strips invented `[experiment-id]` citations and reports a `groundingScore`. On timeout, non-200, empty, or ungrounded output, the route returns the offline answer — so the chatbot never shows an error or an ungrounded answer.
- The key is read only from `process.env` inside the Edge route; `src/` never imports it.

## Env (copy to .env.local, never commit)
```
SI_PROVIDER=nvidia
SI_API_KEY=nvapi-...
SI_MODEL=meta/llama-3.1-8b-instruct   # optional; defaults to meta/llama-3.1-8b-instruct
```

## Files touched
- `api/si.ts` — NVIDIA/OpenAI-compatible provider branch + grounding prompt built from dataset experiments
- `.env.example` — documented `nvidia` provider
- `tests/apiSi.test.ts` — NVIDIA provider test (cites real experiments)

## Notes
- `src/lib/si.ts` (askSI) and the drawer needed no changes: both already POST to `/api/si` and fall back offline.
- Pre-existing: `tests/apiSi.test.ts > default handler` tests call `handler` with a node-style `(req, res)` callback, but `vite.config.ts` invokes `handler(request: Request)` expecting a `Response`. Those 2 assertions fail regardless of this change (incompatible calling convention with the dev-server contract).
