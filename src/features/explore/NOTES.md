# PC2 Explore — working notes

## State
- Branch: `pc2-explore`, cut from `origin/main` at tag `scaffold-v1` (`8f2b119`); chart kit `8a632a4`.
- P0 tag `p0-done-pc2` pushed at `46d7b8c`; branch merged `origin/pc3-experience` (carries PC1 `src/lib` + `src/store`).
- Ownership: `src/components/charts/**`, `src/features/{explore,compare,rankings,materials,coverage,timeline}/**`.
- All six pages now import the real modules. `_stubs.ts` and `_ui.tsx` are deleted.
  Page-level helpers that the design system does not provide live in `src/features/explore/_shared.tsx`
  (`PageHeading`, `Note`, `ScoreBar`, `RegimeBadge`).

## Real modules consumed (verified in source, not guessed)
- `@/lib/data` — `getExperiments`, `getExperiment`, `getMaterials`, `getTimeline`.
- `@/lib/search` — `searchExperiments`.
- `@/lib/scoring` — `rankExperiments`, `defaultWeights`.
- `@/lib/materials` — `getMaterialRisks`, `getMaterialMatrix` (returns `{ scenarios, rows }`).
- `@/lib/coverage` — `getCoverage`, `getGaps`; band labels come from the returned cells.
- `@/lib/severity` — `levelForRisk` (25 / 45 / 70 thresholds) shared with the simulator.
- `@/lib/scenarios` — `SCENARIOS`, `regimeFor`.
- `@/lib/si` — `askSI` (`mode: 'compare'` on Compare, `mode: 'interpret'` on Coverage).
- `@/store/useIgnis` — scenario, weights, filters, compareIds, select, toggleCompare.
- `@/design-system` — `Button`, `ConfidenceBadge`, `EmptyState`, `Skeleton`.

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
- Materials heatmap uses the module's `{scenarios, rows}` shape; cells carry colour + shape + number,
  and "no data" is an SVG diagonal `<pattern>`, never a CSS gradient.
- Coverage derives axis order from `getCoverage()` cells and formats band ids for display
  (`microgravity` -> "Microgravity", `<= 21%` -> "≤ 21%", `not specified` -> "Not specified").
- Timeline uses `regimeFor()` from `@/lib/scenarios`, so its scenario filter matches the rest of the app.
- Filter/search controls read/write `useIgnis` only, so PC1's URL sync picks them up for free.

## Local verification (2026-11-14, after the stub swap)
- `npx tsc -b`: zero errors.
- `npm run build`: passes; route chunks well under 250 kB gzip (largest: compare 124 kB gzip).
- `npm run validate:data`: 20 experiments, 45 findings, 8 materials, 21 glossary terms, 12 coverage cells.
- Throwaway jsdom smoke test (config kept out of the repo, deleted afterwards): 8/8 passed —
  Explore lists records, Rankings lists ranked rows, Compare shows the "two to four" empty state and
  renders charts + SI comparison for `acme-bre` + `bass`, Materials renders both tables,
  Coverage renders the grid + gap copy, Timeline renders >5 entries.
- ESLint clean on all PC2 paths.

## Known issues outside my ownership
- `.gitignore` line 16 is `coverage`, which also ignores `src/features/coverage/`. Needs `/coverage`
  (root-only) from PC1; until then commit that folder with `git add -f`.

## Next
1. Watch for `p0-done-pc3`, then run the O5 INTEGRATE actions.
2. Merge teammates' branches again before integrating if they move.
