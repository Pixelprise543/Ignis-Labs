# PC3 — Experience notes

Owner: PC3 (Ignis Labs). Branch: `pc3-experience`. Repo:
`Pixelprise543/Ignis-Labs` (capital L). Cut from `scaffold-v1` (`8f2b119`).

## Status

- ENV: node v26.13.1, npm 11.20.0, python 3.11.9, git 2.50.1, graphify 0.9.108.
  graphify runs `--code-only` here (no LLM key for doc extraction); hook installed.
- P0 shipped: app shell, lazy routes + EmptyState fallback for missing pages,
  Scenario Bar, design-system primitives, Home, Insights, Ask Ignis drawer.
- P1 shipped: Simulator, Playbook, Brief, Glossary, Method, Command palette.
- PC1's `pc1-core` is merged in: real 20-experiment dataset, scoring, insights,
  materials, coverage, simulator, playbook and brief now drive every PC3 page.
- `src/app/_stubs.ts` is deleted. Every data/store import goes through
  `src/app/data.ts`, which re-exports PC1's frozen module API.
- `npm run build` passes (tsc -b + vite build). Playwright sweep: no gradients,
  shadows, blurs or filters; no AA contrast failures on the checked pages; no
  horizontal overflow at 375px and 1440px; zero console/page errors.

## Data and assistant

- `src/app/data.ts` is the ONLY import point for data, scoring and store.
  Types always come from `@/contracts/types`.
- Evidence ids in PC1's dataset name either an experiment (`saffire-i`) or a
  finding (`saffire-i-f1`). `resolveEvidence` in `data.ts` resolves both;
  `CitationChip` selects the owning experiment and marks unresolved ids in
  alarm red instead of hiding them.
- `data.ts` re-exports PC1's real `askSI` from `@/lib/si`. The app-level
  `siFallback.ts` is deleted, so there is one SI implementation, not two.
- The assistant is honest even when PC1's client validation drops the server's
  `fallback` flag: the drawer also treats the `ignis-offline` model as a
  fallback, and scales `groundingScore` (a 0..1 share) to a percentage.
  Verified live: "Offline fallback · ignis-offline · Grounding 100%", no
  unresolved chips, no page errors.
- **Contract-vs-graph/PC1 mismatch to report:** `src/lib/si.ts`
  `validateServerAnswer` always returns `fallback: false`, discarding the
  server's `fallback: true`, so a deterministic `/api/si` answer would be
  labelled a model answer. `askSI` therefore never reports `fallback: true` in
  the browser when the dev API is up. PC1 should copy `raw.fallback`. PC3's
  drawer works around it for display only.

## Decisions

- Design-system CSS is imported from `src/app/App.tsx`, never `main.tsx`
  (PC1 owns the entry). `theme.css` is PC3-owned now.
- Tailwind v4 token utilities (`bg-ig-hull`, `border-ig-line`, ...) plus a
  small `app.css` for markdown, scroll and cmdk details.
- `featureRegistry.ts` globs `/src/features/*/index.tsx`, excluding
  `assistant` and `palette`, which are shell chrome imported directly.
- Every lazy page exports the exact name from the frozen API (`HomePage`,
  `InsightsPage`, ...). A missing page renders EmptyState, never a crash.
- Flat rules enforced in review and in the Playwright style sweep. No shadow,
  gradient, blur or filter utilities in PC3 files.
- The Flame Orb is a sampled polar path (circle → teardrop) animated with
  framer-motion, pausable, and static under `prefers-reduced-motion`.
- The simulator follows the scenario bar until the user edits a slider, and
  the driver bars show each driver's share of the score (PC1 weights are
  points, not 0..1 fractions).

## Next

1. Push `pc3-experience` (blocked: GitHub says `Joshita-566` lacks permission
   to `Pixelprise543/Ignis-Labs`; operator must add the account or supply a
   token).
2. After push: tag `p0-done-pc3` (needs operator approval, O4).
3. INTEGRATE: merge PC2's branch, refresh graph, build, report.
4. Optional polish left: bookmarks UI (store field exists), onboarding hints.
