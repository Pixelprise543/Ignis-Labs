# PC2 Explore — working notes

## State
- Branch: `pc2-explore` (created from an empty repo; `scaffold-v1` not published yet).
- Build only: `src/components/charts/**`, `src/features/{explore,compare,rankings,materials,coverage,timeline}/**`.
- No npm, no `package.json`, no config edits until PC1's scaffold lands.

## Decisions
- Charts are presentational and take `Experiment[]`; they import types only from `@/contracts/types` (frozen contract is the truth source).
- Regime identity = color + marker shape + legend label. Recharts built-in symbols: circle (microgravity), diamond (partial-g), square (normal-g).
- Colors are `var(--token, #fallback)` strings so theme.css stays authoritative; SVG attributes still resolve if the token is missing.
- Every chart is wrapped in `ChartFrame`: visible text summary, `role="img"` label, and a `<details>` data table. No color-only meaning.
- Missing measurements are omitted, never defaulted to 0 (radar drops incomplete condition rows and reports how many).
- No gradients/glows/shadows: solid fills, 1px grid lines, flat tooltip.

## Next
1. `/explore` page: filters via `useIgnis` + `searchExperiments`, dense table, detail drawer, add-to-compare.
2. `/rankings`: `defaultWeights` / `rankExperiments`, weight sliders, score breakdown.
3. `/compare`: 2–4 experiments, both charts, `askSI({ mode: 'compare' })`.
4. `/materials`: discrete heatmap with SVG hatch for no-data cells.
5. `/coverage`: gravity × O2 grid + gaps.
6. `/timeline`.

## When `scaffold-v1` exists
- `git fetch origin --tags`; if there is no merge base, merge `origin/main` with `--allow-unrelated-histories`
  (never rebase a pushed branch; force-push is forbidden).
- Run `graphify hook install` and `graphify .`, verify PC1/PC3 symbols before importing them,
  and delete any `_stubs.ts` in the same commit that switches to the real import.
