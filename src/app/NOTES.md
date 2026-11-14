# PC3 — Experience notes

Owner: PC3 (Ignis Labs). Branch: `pc3-experience`, cut from `scaffold-v1`
(`origin/main` at `8f2b119`). Repo: `Pixelprise543/Ignis-Labs` (capital L).

## Status

- ENV: node v26.13.1, npm 11.20.0, python 3.11.9, git 2.50.1, graphify 0.9.108.
  graphify runs `--code-only` here (no LLM key for doc extraction); hook installed.
- P0 shipped: app shell, lazy routes + EmptyState fallback for missing pages,
  Scenario Bar, design-system primitives, Home, Insights, Ask Ignis drawer.
- P1 shipped on this branch: Simulator, Playbook, Brief, Glossary, Method,
  Command palette. PC2's pages resolve to EmptyState until they land.
- `npm run build` passes (tsc -b + vite build). No gradients, shadows, blurs or
  filters found by the Playwright style sweep; contrast sweep passes AA on
  vacuum/hull text; 375px and 1440px have no horizontal overflow.

## Data/stub strategy

- `src/app/data.ts` is the ONLY import point for data and store logic. It
  re-exports `_stubs.ts` today. When PC1's `@/lib/*` and `@/store/useIgnis`
  land, edit `data.ts` to the frozen module API and delete `_stubs.ts`.
- Types are imported from `@/contracts/types` everywhere (the stubs are typed
  against the contract, not a copy of it).
- Stub data is labeled illustrative in the UI. The offline assistant says so
  in its caveats. Never remove that while stubs are live.
- The stub store persists only in memory. URL sync (`initUrlSync`) is a no-op
  until PC1's `@/store/urlSync` lands; a full reload resets the scenario.

## Decisions

- Design-system CSS is imported from `src/app/App.tsx`, never `main.tsx`
  (PC1 owns the entry). `theme.css` is PC3-owned now; tokens unchanged since
  the scaffold except the documented AA values.
- Tailwind v4 token utilities (`bg-ig-hull`, `border-ig-line`, ...) plus a
  small `app.css` for markdown, scroll and cmdk details.
- `featureRegistry.ts` globs `/src/features/*/index.tsx`, excluding
  `assistant` and `palette`, which are shell chrome imported directly.
- Route-level code splitting works; every lazy page exports the exact name
  from the frozen API (`HomePage`, `InsightsPage`, ...).
- Flat rules enforced in review and in the Playwright style sweep. No shadow,
  gradient, blur or filter utilities anywhere in PC3 files.
- The Flame Orb is a sampled polar path (circle → teardrop) animated with
  framer-motion, pausable, and static under `prefers-reduced-motion`.

## Next

1. Swap `data.ts` to PC1 modules when they land (one commit, delete stubs).
2. Verify PC2 pages load through the glob and match the shell spacing.
3. P2: print stylesheet, e2e smoke spec, README, extra experiments via PC1,
   performance pass, bookmarks UI.
4. Tag `p0-done-pc3` only after the swap still builds and the demo flow works
   with no network.
