# Plan: fluid layout + light mode for Ignis

Status: awaiting approval
Owner: PC3 (Experience)
Written: 2026-11-15

## Primary goal

A visitor can open Ignis on a phone, a laptop, or a wall display and see the same
product with nothing cut off and nothing to scroll sideways, in a light interface
they can read outdoors, and still find any of the 13 research views in two clicks.

## Where things stand (measured, not assumed)

These numbers come from the running build (`npm run build`, preview on :4180,
Playwright probing the real DOM). They are the baseline this plan has to move.

- Workspace content was capped at `max-w-[1440px]`, so 1440px+ screens had dead
  margins. **Changed**: the shell is now fluid; marketing keeps its reading cap.
- Charts took fixed pixel heights (280 / 320). **Changed**: they now fill the
  panel width and scale height with the viewport:
  `clamp(220px, 24vw, 360px)` and `clamp(260px, 30vw, 420px)`. Measured 220px /
  260px at 375px wide, 343px at 1440px.
- Chart data: **no experiment in the dataset reports a numeric flame-spread or
  limiting-oxygen value**, so all three Compare charts show their honest empty
  state. Sizing work is verified against the canvas class + the empty state, but
  the charts themselves currently have nothing to draw. See "Not now".
- Remaining horizontal overflow at 375px (ancestor-aware), found on `/app/compare`:
  the conditions table has a 499px minimum content width inside a 307px panel.
  `/app/rankings` has a 5px overflow on the weight-slider row. The scenario
  control is a hidden-scrollbar strip (481px of buttons in 331px).
- Everything else: `/app`, explore, materials, coverage, timeline, insights,
  playbook, simulator, brief, glossary, method, and all marketing routes measured
  clean at 1440px and 375px.
- Theme is dark-only: `index.html` sets `data-theme="dark"` and
  `color-scheme: dark`; `theme.css` defines one palette; ~40 hardcoded hex
  fallbacks live in chart, material and orb components.

## Autonomy contract (what "no input needed" means)

I will do these without asking again:

- Edit files inside my owned paths (`src/app`, `src/design-system`,
  `src/features/*` for home/insights/playbook/simulator/brief/glossary/method/
  assistant/palette, `src/components/charts`, `docs`, `e2e`, `public`, README).
- Run `npx tsc -b`, `npm run build`, `npm test`, `npx playwright test`,
  `npm run validate:data`, `npm run lint` as often as needed.
- Commit per phase and push to `main` (Vercel deploys production from `main`).
- Nudge a hex value to pass WCAG AA, as long as the hue family and token names
  stay the same.

I will stop and report instead of guessing when:

- A fix would need a new dependency, a contract change, or a data change that
  alters a scientific claim.
- A phase cannot go green after three attempts (I revert that phase, record why,
  and continue with the next phase).
- A brand colour would have to move more than a small nudge to pass contrast.

Every phase ends with a green build and its own commit. If the whole run dies
halfway, `main` is always a working product.

---

## Phase 0 — Documentation and evidence lock

**How this serves the primary goal:** it fixes the measured baseline so later
phases can prove they improved it instead of arguing about it.

What I collect and write down (most is already above):

1. The exact token file `src/design-system/theme.css` and every consumer of the
   tokens: `grep -rn "var(--ig-" src`.
2. Every hardcoded colour: `grep -rn "#[0-9a-fA-F]\{3,8\}" src`.
3. The shell breakpoints: `src/app/AppShell.tsx` (rail at `lg`, bottom tabs below
   it), `src/app/corporate/CorporateShell.tsx` (marketing chrome).
4. The e2e expectations that must keep passing: `e2e/smoke.spec.ts`.
5. The written design rules to obey: `docs/DESIGN.md` plus the theme header.

Deliverable: a short `Evidence` section appended to this file with the grep
outputs summarised (counts, file paths), so the executor never re-derives them.

Verification: every file path cited above exists; `npm run build` is green before
any behaviour change.

Anti-pattern guard: do not treat `graphify-out/` as evidence — it does not exist
in this checkout. Do not invent API names; read the file.

---

## Phase 1 — Finish the fluid layout

**How this serves the primary goal:** this is the "nothing cut off, nothing to
scroll sideways" half of the goal.

Tasks:

1. `src/features/compare/index.tsx` — below `sm`, stop rendering the two wide
   tables. Render one stacked block per experiment (acronym + name, then
   label/value rows for conditions and metrics) from the same data the table
   uses. Keep the tables at `sm` and up. Reuse the existing `formatValue`,
   `RegimeBadge`, `ConfidenceBadge`.
2. `src/features/rankings/index.tsx` — find the 5px overflow on the weight row
   (`min-w-0 flex-1` child wider than its parent) and let the label shrink
   (`min-w-0` on the text, `shrink-0` on the number).
3. `src/app/ScenarioBar.tsx` — replace the hidden-scrollbar strip with a
   wrapping segmented control below `sm` so all five scenarios are visible
   without swiping. Keep the single row from `sm` up.
4. `src/features/assistant/AskIgnisDrawer.tsx` — make the question box grow with
   its content (set `height` from `scrollHeight` on change, cap at ~8rem) so long
   questions are not trapped in a 2-row box. Drawer keeps `w-full` under `sm`.
5. `src/app/corporate/CorporateShell.tsx` — keep the 1200px reading column
   (a 2560px-wide paragraph is a worse read), but let the header, hero and card
   grids use the full width. Document the exception in `docs/DESIGN.md`.
6. `src/design-system/theme.css` — keep `overflow-x: clip` on `html`, and add a
   comment explaining why it is `clip` and not `hidden`.

Verification checklist:

- Ancestor-aware overflow probe (skips nodes inside any `overflow-x`
  auto/scroll/hidden/clip ancestor) returns zero offenders on every route at
  320, 375, 768, 1024, 1440, 1920 and 2560px.
- Compare at 375px: no table is wider than its panel; all four selected
  experiments readable.
- Scenario bar at 375px: five scenario buttons visible, no horizontal scroll.
- `npx tsc -b` and `npm run build` green; `npx playwright test` green.

Anti-pattern guard: do not hide overflow with `overflow-x: hidden` on a page
container (it breaks `position: sticky`), and do not delete data from the narrow
layout — every value present in the table must still be reachable in the cards.

---

## Phase 2 — Light palette in the tokens

**How this serves the primary goal:** this is the "light interface" half.

What changes: `src/design-system/theme.css` `:root`, and `index.html`
(`data-theme`, `color-scheme`, `theme-color`).

Starting proposal (every pair gets measured in Phase 4, not eyeballed):

| token | dark today | light proposal | job |
|---|---|---|---|
| `--ig-vacuum` | `#1A1512` | `#F5EFE7` | app background (warm paper) |
| `--ig-hull` | `#231D18` | `#FFFCF8` | panels and tables |
| `--ig-raised` | `#2E2620` | `#EBE2D6` | hover / selected |
| `--ig-line` | `#40362D` | `#D6C9B8` | 1px borders |
| `--ig-frost` | `#F6EFE6` | `#221B15` | primary text |
| `--ig-muted` | `#B3A394` | `#6B5B4B` | secondary text |
| `--ig-flame-blue` | `#E3B76B` | `#8F5606` | brand / links / primary button |
| `--ig-quench` | `#8DBF6A` | `#4E7A2E` | low risk, partial-g |
| `--ig-amber` | `#F5B942` | `#A86400` | caution, normal-g |
| `--ig-ember` | `#EE7B3A` | `#C2410C` | high risk |
| `--ig-alarm` | `#F06A6E` | `#B3261E` | critical |
| `--ig-on-accent` | `#1A1512` | `#FFF8EE` | text on gold |

New token: `--ig-scrim` (solid overlay for the drawer, the mobile sheet and the
palette backdrop) so overlays stay legible on paper instead of washing out.

Verification: `npm run build` green; every `--ig-*` name still resolves (grep
shows no missing var); no gradient, glow, blur or shadow introduced
(`grep -rn "gradient\|drop-shadow\|blur(" src` returns nothing new).

Anti-pattern guard: do not rename tokens (`flame-blue` keeps its name even though
it is gold — the contract depends on it) and do not add a dark-mode branch yet.

---

## Phase 3 — De-hardcode the components

**How this serves the primary goal:** a half-converted UI is worse than either
theme; this removes every dark assumption that would leave a black box or
invisible text on paper.

Targets, each with its own light value:

- `src/components/charts/chartTheme.ts` — hex fallbacks in `REGIME_STYLES`,
  `CHART_TOKENS`, `SERIES_STYLES`.
- `src/components/charts/OxygenLimitChart.tsx` — tooltip cursor fill.
- `src/components/charts/FlatTooltip.tsx` — verify border/text on paper.
- `src/features/materials/index.tsx` — `RISK_STYLES` fallbacks, `HatchSwatch`,
  `NoDataCell` pattern fills, and the per-cell text colour (dark ink on the two
  pale steps, cream ink on ember/alarm; new `--ig-on-<level>` tokens if needed).
- `src/features/home/Orb.tsx` — `GOLD` / `AMBER` constants for the flame orb.
- `src/design-system/Drawer.tsx` — backdrop uses `--ig-scrim`.
- `src/app/AppShell.tsx` — `MoreSheet` backdrop uses `--ig-scrim`.
- `src/app/corporate/CorporateShell.tsx` — mobile menu backdrop uses `--ig-scrim`.
- `src/app/app.css` — print block: confirm the paper rules still make sense when
  the screen is already light (they should collapse to a no-op).

Verification: grep for `#[0-9a-fA-F]{3,8}` under `src` returns only the token
file and the print block. Chart legends still pair colour with shape and label.
Material cells still pair colour with an SVG shape and a number.

Anti-pattern guard: do not encode risk with a continuous ramp — four discrete
solid steps stay. Do not let colour become the only signal anywhere.

---

## Phase 4 — Contrast and accessibility proof

**How this serves the primary goal:** a light theme that fails contrast is not a
light theme, it is a readability bug.

Tasks:

1. Automated pass: for every route, at 1440px and 375px, walk visible text
   nodes, resolve the effective background by walking ancestors, compute WCAG
   contrast, and list every pair under 4.5:1 (3:1 for text ≥24px or ≥18.66px
   bold).
2. Fix by nudging the token, then re-run until zero failures.
3. Check non-text signals: focus ring on paper, `::selection`, scrollbar colour,
   chart grid/axis lines, material cell numbers, badge text on every tone.
4. Keyboard pass: tab through `/app` and one dense view; every focus stop is
   visible on paper.

Verification: the contrast script reports 0 failures on 13 platform routes + 6
marketing routes × 2 widths; screenshots of `/app`, `/app/compare`,
`/app/materials` at 375 and 1440 saved for the report.

Anti-pattern guard: do not fix contrast by shrinking text below 14px body /
12px metadata. Do not use opacity on text to "soften" it.

---

## Phase 5 — Navigation that fits in two clicks

**How this serves the primary goal:** the "find any view in two clicks" half.

Tasks:

1. `src/app/AppShell.tsx` `RailGroups` — add a small filter field above the
   groups ("Find a view"), matching labels case-insensitively; while filtering,
   groups open automatically and show only matches; Escape clears. Announce the
   result count for screen readers.
2. Add an explicit "Expand all / Collapse all" control next to the filter, so a
   newcomer can see the whole map once without hunting.
3. `MoreSheet` (mobile) — same filter, same auto-open behaviour.
4. Keep the current rule: only the group containing the active page opens on
   arrival.
5. `src/features/palette/CommandPalette.tsx` — confirm it still lists every view
   after the rail changes (it reads the same `PLATFORM_ROUTES`).

Verification: type "mat" in the rail filter and get Materials first; clear and
the groups return to folded; the mobile sheet matches; keyboard-only run
completes without a mouse; `e2e/smoke.spec.ts` updated for the new control.

Anti-pattern guard: no new state library, no persisted filter, no hidden routes.

---

## Phase 6 — Ship and prove

**How this serves the primary goal:** the user-visible outcome only exists once
it is live.

1. Update `docs/DESIGN.md` (light palette, scrim, fluid rules, marketing cap
   exception) and `src/app/NOTES.md` (what changed, what to watch).
2. Extend `e2e/smoke.spec.ts`: light theme attribute is set; no horizontal
   overflow on `/app/compare` at 375px; rail filter narrows the list; Material
   cells expose a text alternative.
3. Full battery: `npx tsc -b`, `npm run build`, `npm test`,
   `npx playwright test`, `npm run validate:data`, `npm run lint`.
4. Push `main`, wait for the Vercel production deploy, then fetch the live URL
   and confirm the served bundle matches the local `dist` (same hashes).
5. Report: what shipped, the contrast numbers, the overflow matrix result, and
   anything deferred.

Anti-pattern guard: no force-push, no `git add -A`, no edits outside owned paths,
no deleting pages.

---

## Not now (needs your call, not mine)

- **Compare charts have no data.** No experiment reports a numeric flame-spread
  or limiting-oxygen value, so all three Compare charts render the honest empty
  state. Fixing it means either adding verified numeric metrics to the dataset
  (data change, honesty rule) or plotting a metric that does exist (for example
  burn duration against gravity). Both change scientific claims, so I will not
  do either without a decision.
- Bookmarks UI, onboarding tour, extra experiments beyond the current 20.
- A real dark mode toggle: this plan converts to light only, as asked.
- Any new dependency, including a chart library swap.
