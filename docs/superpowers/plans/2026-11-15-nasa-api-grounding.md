# NASA API grounding — implementation plan

Design: `docs/superpowers/specs/2026-11-15-nasa-api-grounding-design.md`

## Global constraints

- Never edit `src/contracts/**`. NTRS ids never enter `SIResponse`.
- `offlineAnswer()` stays synchronous, deterministic and dataset-only.
- Every new network path must be failure-tolerant: it returns a labelled
  snapshot instead of throwing, and the UI never shows an error state for it.
- No gradients, glows, shadows. Warm palette, 1px `--ig-line` borders only.
- `npm run build` (tsc -b + vite build) and `npm test` must pass after each task.
- Commit after each green task, message prefix `feat:` / `fix:`.

## T1 — Edge runtime for `api/si.ts`

Files: `api/si.ts`, `tests/apiSi.test.ts`

1. Keep `handleSiRequest(input: unknown): Promise<SIResponse>` exactly as is.
2. Replace the `(req, res)` default export with:
   ```ts
   export const config = { runtime: 'edge' }
   export default async function handler(req: Request): Promise<Response>
   ```
   - non-POST → `405` JSON `{ error: 'Use POST for /api/si' }`
   - body: `await req.json()` inside try/catch, `{}` on failure
   - success → `200` JSON body, header `Cache-Control: no-store`
3. Tests: build a real `new Request('https://ignis.local/api/si', { method, body })`
   and assert `status` + `await res.json()`.
4. `vite.config.ts` dev middleware is untouched (it calls `handleSiRequest`).

Verify: `npm test -- tests/apiSi.test.ts`, `npm run build`.

## T2 — `vercel.json`

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```
Vercel checks the filesystem before rewrites, so `/assets/*` still serves.

Verify (after deploy, needs approval): `/app/explore` → 200, `/api/si` → 200.

## T3 — `api/nasa.ts` edge proxy

Contract: `GET /api/nasa?q=<120 chars max>&limit=6`

- `export const config = { runtime: 'edge' }`
- rejects GET-only with 405; empty `q` → 400 `{ error: 'q is required' }`
- fetch `https://ntrs.nasa.gov/api/citations/search?q=<q>&page.size=<1..8>`
  with `AbortSignal.timeout(8000)`
- maps each result to:
  `{ id, title, abstract, year, reportNumber, center, authors, stiType, pdfUrl, url }`
  - `id` = `citationId` string
  - `year` from `distributionDate` (`YYYY-MM-DD…` → 4-digit number) else `null`
  - `reportNumber` = first `otherReportNumbers` entry else `null`
  - `pdfUrl` = first `downloads[].links.pdf` joined onto `https://ntrs.nasa.gov`
  - `url` = `https://ntrs.nasa.gov/citations/<id>`
  - `abstract` truncated to 1200 chars, `null` when absent
- response `{ query, retrievedAt: new Date().toISOString(), total, results }`
- headers `Cache-Control: public, s-maxage=21600, stale-while-revalidate=86400`
- upstream failure/timeout → 502 `{ error, detail }`

## T4 — `src/lib/nasa.ts` client

- `NasaPublication` type + zod schema mirroring T3.
- `findNasaPublications(query: string, opts?: { limit?: number; signal?: AbortSignal })`
  → `Promise<NasaLiterature>` where
  `{ results, source: 'live' | 'snapshot', retrievedAt, query }`
  - builds a search query from the question: keep meaningful words, append
    `combustion` when none of fire/flame/burn/flammab/ignit/oxygen present, cap 120 chars
  - `fetch('/api/nasa?…', { signal })`, 4 s internal timeout
  - validates with zod; a shape mismatch or empty list falls through to the snapshot
  - **never throws**
- `formatNasaLiterature(lit)` → markdown block (see T6) using only titles,
  verbatim abstract excerpts max 320 chars on a word boundary, report number,
  year, centre and the PDF link.

## T5 — snapshot `data/nasa/`

- `data/nasa/index.ts` exports `NASA_SNAPSHOT: { retrievedAt, publications }`
  and `NasaPublication`.
- `scripts/sync-nasa.ts` — `node scripts/sync-nasa.ts`; six family queries
  (`saffire`, `sofie solid fuel ignition`, `acme combustion microgravity`,
  `flex flame spread`, `bass soot microgravity`, `spacecraft fire safety
  flammability`) × 6 results, dedupe by id, tags `families: string[]`.
  Writes `data/nasa/ntrs.ts` with a header comment naming the script.
- Snapshot is committed. `retrievedAt` is the script's real run time.

## T6 — drawer panel

`src/features/assistant/AskIgnisDrawer.tsx`

- After a successful answer, run `findNasaPublications(question)` in parallel
  with `askSI` (same `requestRef` guard).
- Render below the message's citation chips:
  - heading "From NASA's technical report library"
  - badge: `Live · <date>` (olive) or `Snapshot · <date>` (amber)
  - each result: linked title, `year · centre · report number`, 2-line abstract
    excerpt, "Open PDF" when present
  - footnote "Titles and abstracts are NASA's own words. These reports are not
    scored into the dataset."
- No results → render nothing.
- `aria-live` polite; keyboard reachable links.

## T7 — imagery (only if T1–T6 green)

`images-api.nasa.gov/search?q=<q>&media_type=image` from the browser (CORS `*`),
show up to 3 thumbnails under the literature list, `nasa_id` as caption.
Skip on failure. No proxy needed.

## Review focus

- Does any NTRS id leak into `SIResponse.citations`? It must not.
- Can `/api/nasa` be made to reflect attacker-controlled HTML? Links are built
  from `https://ntrs.nasa.gov/…` + id; titles are rendered by react-markdown
  which escapes HTML.
- Does the drawer still work with no network, no functions, no key?
- Is `npm run build` zero-error and is `graphify-out/` untracked?
