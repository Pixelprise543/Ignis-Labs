# PC2 Explore — working notes

## State
- Branch: `pc2-explore`, cut from `origin/main` at tag `scaffold-v1` (`8f2b119`); chart kit `8a632a4`.
- Ownership: `src/components/charts/**`, `src/features/{explore,compare,rankings,materials,coverage,timeline}/**`.
- P0 pages done: Explore, Rankings, Compare.
- P1 pages done: Materials, Coverage, Timeline.
- `src/lib` and `src/store` now exist; as of the integration merge every page imports
  `@/app/data`, `@/lib/search`, `@/lib/coverage` and `@/lib/materials`, and the stub is gone.

## Decisions
- Charts are presentational and take `Experiment[]`; they import types only from `@/contracts/types`.
- Regime identity = color + marker shape + legend label: circle (microgravity), diamond (partial-g), square (normal-g).
- Colors are `var(--token, #fallback)` strings so theme.css stays authoritative.
- Every chart is wrapped in `ChartFrame`: visible summary, `role="img"` label, `<details>` data table. No color-only meaning.
- Missing measurements are omitted, never defaulted to 0 (radar drops incomplete rows and says how many).
- No gradients/glows/shadows: solid fills, 1px grid lines, flat tooltip.
- Compare auto-generates the SI comparison whenever the selection or scenario changes (demo flow:
  add a second record -> answer is already there), with a Regenerate button and a visible
  "Offline fallback" badge when `askSI` did not call a model.
- pagination/search/filter controls read/write `useIgnis` only, so URL sync (PC1) will pick them up for free.

## Local verification (2026-11-14)
- `npm run build` (tsc -b + vite build): zero TS errors.
- Throwaway jsdom render test (config kept out of the repo): 7/7 passed —
  Explore renders 6 records + detail aside, Rankings renders 4 sliders + 6 ranked rows,
  Compare shows the "add one more" state at 1 record and tables/charts/SI fallback at 3,
  Materials renders a 8x4 matrix and opens cell detail, Coverage renders the grid and the
  gap interpretation, Timeline groups entries and the milestone filter drops 6 -> 2.
  Re-create with `--config` if needed; deleted afterwards so `tests/**` stays PC1's.

## Next
1. ~~Swap `_stubs.ts` -> `@/lib/*` + `@/store/useIgnis`~~ done in the integration merge
   (`integrate: point PC2 views at the real data layer`); the stub file is deleted.
2. Replace `_ui.tsx` primitives with `@/design-system` (PC3) page by page.
3. Confirm PC3's router exposes these exports: ExplorePage, ComparePage, RankingsPage,
   MaterialsPage, CoveragePage, TimelinePage (all named exports from their feature index).

## Stub swap checklist
- `getExperiments`, `getExperiment`, `getMaterials`, `getTimeline`, `getCoverage`, `getMaterialRisks`,
  `getMaterialMatrix`, `getGaps`, `getInsights`, `defaultWeights`, `rankExperiments`,
  `searchExperiments`, `askSI`, `SCENARIOS`/`getScenario`, `useIgnis`.
- `_ui.tsx` primitives are replaced by `@/design-system` exports (PC3) page by page.
