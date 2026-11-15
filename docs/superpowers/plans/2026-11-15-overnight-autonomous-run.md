# Overnight autonomous run — Ignis (PC1 lane) — 2026-11-15

**Primary goal.** A judge who opens `https://ignis-labs.vercel.app` finds a platform that
answers fire-safety questions about the Moon and Mars with *more* NASA experiments than
before, each one linked to a real NASA publication, and every number on screen traceable
to an evidence id. Nothing on the site is invented, and the same build still works with no
network.

**How to read this plan.** Phases run top to bottom without further questions. Every
approval the run needs is listed once in *Approvals bundle*. If a phase's verification
fails and the fix lies outside the PC1 file-ownership list, the run stops and writes a
`REPORT FOR OPERATOR` line instead of editing another owner's file.

---

## Phase 0 — Documentation discovery (evidence, already gathered)

Read before planning, so the phases below cite real files, not assumptions:

| What | Where it lives | Fact confirmed |
|---|---|---|
| Authoring contract for experiments | `data/SCHEMA.md` (6.4 KB) | field rules for `Experiment`, `Finding`, `Metric`, sources |
| Source registry | `data/experiments/sources.ts` | `SRC` constants; rule: url = page actually read |
| Dataset shape | `data/experiments/{acme,legacy,saffire,sofie}.ts` | 20 experiments, 45 findings |
| Validation entry | `scripts/validate-data.ts` → `src/lib/schema.ts#validateDataset` | zod + id uniqueness + evidence resolution |
| Data gate output | `npm run validate:data` | `OK - 20 experiments, 45 findings, 8 materials, 21 glossary terms, 12 coverage cells, 5 scenarios, 5 playbooks` |
| Live routes | `src/app/nav.ts` | 6 corporate + 13 platform routes under `/app`, all pages exist |
| E2E suite | `e2e/smoke.spec.ts`, `playwright.config.ts` | 8/8 passing at `0a5f167` |
| Teammate delta | `git rev-list main..origin/pc3-experience` | pc3-experience is 2 commits ahead; pc1/pc2 are merged |
| API surface | `api/si.ts`, `api/nasa.ts` (edge), `src/lib/nasa.ts` | live in production, verified 2026-11-15 |
| NTRS contract | `https://ntrs.nasa.gov/api/citations/search` | `results[].id` numeric, `abstract`, `otherReportNumbers`, queries AND-matched |

**Allowed APIs for this run:** `getExperiments / getExperiment / getFinding / getFindings`,
`validateDataset`, `rankExperiments`, `simulateRisk`, `getCoverage`, `getInsights`,
`getPlaybook`, `buildBriefMarkdown`, `askSI`, `findNasaPublications`. All verified present
in `src/lib` via graphify (12 symbols).

**Anti-patterns to avoid:** inventing metrics for a new experiment (use `value: null` and a
`note`); marking a record `verified` on a title alone (only an actually-read source with
the number in it qualifies); NTRS ids inside `SIResponse.citations`; editing `src/app/**`,
`src/design-system/**`, `src/features/**` (PC2/PC3 ownership).

---

## Phase 1 — Baseline and integrate teammates

**How this serves the primary goal:** the deployed site should contain everything the team
built, not a stale fork of it.

1. `git fetch origin`, then merge `origin/pc3-experience` into `main` keeping theirs for any
   conflict in `src/app/**` / `src/design-system/**` / `src/features/**`.
2. Refresh graph: `graphify .` (fallback `graphify . --code-only`).
3. Gate: `npm run validate:data && npm test && npm run build && npx playwright test`.
4. Commit and push `main`.

**Verification:** all four gates green; `origin/main` contains `781deba`'s work.

---

## Phase 2 — Dataset expansion 20 → 30 experiments (the core deliverable)

**How this serves the primary goal:** more real NASA experiments means denser rankings, fewer
coverage gaps, and answers that cite primary sources.

For each candidate: `GET https://ntrs.nasa.gov/api/citations/search?q=<short query>` →
read the returned `title`, `abstract`, `year`, `otherReportNumbers`, `id` → write the record
using `data/SCHEMA.md` and `SRC` constants → set `confidence: 'curated'` (abstract read) and
`sources[0].url` to `https://ntrs.nasa.gov/citations/<id>` or the official NASA page.

Candidates, in priority order (drop any that NTRS cannot confirm):

1. Saffire-II, 2. Saffire-V, 3. SOFBALL (Structure of Flame Balls at Low Lewis-number),
4. LSP (Laminar Soot Processes), 5. Candle Flames in Microgravity, 6. MSC (Microgravity
Smoldering Combustion), 7. TGDF (Turbulent Gas-Jet Diffusion Flames), 8. BASS-II,
9. FLEX-2 successor / "Flame Extinguishment Experiment follow-on" if a distinct NTRS record
exists, 10. a partial-g drop-tower or parabolic-flight record not yet represented.

Rules per record: `metrics[].value` stays `null` unless the abstract states the number;
`findings` are paraphrases of the abstract with tags; `safetyTakeaway` is one plain sentence;
`tags` reuse existing tag vocabulary so `searchExperiments` synonyms still hit.

Also in this phase: extend `getCoverage()`-relevant conditions so each new record lands in a
real (gravity × O2) cell, and add ≤ 2 materials to `data/materials.ts` only where a new
abstract names the fuel.

**Verification:** `npm run validate:data` reports ≥ 30 experiments and every evidence id
resolves; `npm test` green; each new experiment rendered in `/app/explore` locally (Playwright
or dev-server curl of the JSON module).

**Anti-pattern guard:** no new experiment without a retrievable NASA record. If NTRS returns
nothing, the candidate is dropped, not padded with invented numbers.

---

## Phase 3 — Harden the dataset gate

**How this serves the primary goal:** "honest about data" is a judging criterion, and a gate
is the only thing that keeps honesty true after the demo.

Extend `src/lib/schema.ts#validateDataset` (and `tests/`) with these checks:

- `sources.length >= 1` for every experiment; `source.url` host ends in `nasa.gov` for
  `verified`/`curated`
- `confidence: 'verified'` requires at least one source with a `year`
- ids kebab-case, unique, and finding ids prefixed by their experiment id
- `0 <= conditions.gravityG <= 2`, `0 <= o2Percent <= 100`, `pressureKPa > 0` when present
- every metric has non-empty `label` and `unit`
- every experiment appears in ≥ 1 coverage cell
- insight `evidenceIds`, playbook step `evidenceIds`, material `evidenceIds` all resolve
  (already present — keep)

**Verification:** `npm run validate:data` still exits 0 on the real dataset, and a new
`tests/schema.test.ts` case fails when each rule is violated (mutation-style fixtures).

---

## Phase 4 — NASA API robustness

**How this serves the primary goal:** the "live NASA data" story must not break the demo when
NTRS is slow.

- `api/nasa.ts`: one retry on 5xx/timeout, `Cache-Control` keyed per query, keep 8 s ceiling
- `src/lib/nasa.ts`: scenario-aware topic queries so lunar/mars/EVA each surface relevant
  literature (dust, regolith, suit materials), still never throwing
- regenerate the offline snapshot with `node scripts/sync-nasa.ts` over the expanded topics
  and record the retrieval timestamp
- tests: upstream 502 → snapshot results with `source: 'snapshot'`; malformed payload → empty
  list, no throw; query > 120 chars rejected

**Verification:** `npm test` green; `GET /api/nasa?q=flame%20spread&limit=1` and a lunar query
both return 200 locally; snapshot chunk still lazy (no size growth in the entry chunk).

---

## Phase 5 — Bundle budget and performance guard

**How this serves the primary goal:** "usable" at judge time means it loads fast on a laptop
in a conference room.

- add `scripts/check-budget.ts`: fails if the entry chunk gzip > 90 KB or any route chunk
  gzip > 250 KB; print the table
- wire it into the release gate (not into `npm test`)
- if the `compare` chunk exceeds budget, report it (it is PC2's file) rather than editing

**Verification:** `node scripts/check-budget.ts` passes and prints per-chunk gzip sizes.

---

## Phase 6 — Notes and provenance

**How this serves the primary goal:** a judge or maintainer can see where each claim came from.

- `src/lib/NOTES.md`: this run's decisions, the NTRS query vocabulary, the `@/` vs relative
  import trap (already recorded)
- `data/SCHEMA.md`: the source-provenance rule restated for new records
- no README edits (PC3 owns it); any README-worthy text goes in the final report instead

**Verification:** files exist and mention the new experiment count.

---

## Phase 7 — Ship and verify production

**How this serves the primary goal:** the improvement is actually visible at the public URL.

1. `git push origin main`
2. `vercel deploy --yes` (preview) → smoke `/`, `/app/explore`, `/app/rankings`,
   `GET /api/nasa`, `POST /api/si`
3. `vercel deploy --prod --yes` → same smoke against `https://ignis-labs.vercel.app`
4. confirm the Ask Ignis drawer still shows live NTRS literature with a `Live · <date>` badge
5. print the final REPORT FOR OPERATOR with the Graph check line

**Verification:** production responds 200 on all five checks, `npm test` + `npm run build` +
`npm run validate:data` + `npx playwright test` green on the pushed commit.

---

## Approvals bundle (grant once, covers the whole run)

| # | Action | Touches |
|---|---|---|
| A1 | network reads from `ntrs.nasa.gov` while curating records | network only |
| A2 | edit `data/**`, `src/lib/**`, `data/nasa/**`, `scripts/**`, `tests/**` | PC1-owned files |
| A3 | run `node scripts/sync-nasa.ts` (rewrites `data/nasa/ntrs.ts`) | PC1-owned file |
| A4 | commits on `main` + `git push origin main` (repeated, per phase) | `origin/main` |
| A5 | merge `origin/pc3-experience` into `main`, keeping their version of their files | `origin/main` |
| A6 | `vercel deploy` preview and `vercel deploy --prod` at the end | Vercel project `ignis-labs` |
| A7 | tag + push `p2-done-pc1` when Phase 7 is green | git tag |
| A8 | recreate the local worktree from `main` (removes the stale `nasa-grounding` ref) | local dir only |

## Stop conditions (the run pauses and reports instead of continuing)

- a gate (`validate:data`, `test`, `build`, `playwright`) is red and the fix is outside PC1
  ownership
- a candidate experiment has no retrievable NASA record after two query variants
- production verification fails twice
- any action would need force-push, branch/file deletion, a new dependency, or a paid service
- `origin/main` gains commits that conflict inside a PC1 file in a way that changes meaning

## Explicitly out of scope

No LLM keys or paid APIs. No edits to `src/app/**`, `src/design-system/**`,
`src/features/explore|compare|rankings|materials|coverage|timeline|home|insights|playbook|
simulator|brief|glossary|method|assistant|palette|corporate/**`, `e2e/**`, `README.md`,
`docs/**`. No new npm dependencies. No schema/contract changes.
