# Liquid Glass conversion — final report (PC3, branch `glass-surfaces`)

**Date:** 2026-11-15  
**Base:** `main` @ `0a5f167` (equals `origin/main`)  
**Branch:** `glass-surfaces` (9 commits, nothing pushed — push needs separate approval per AGENTS.md O7)  
**Status:** Tasks 1–10 complete; Task 11 = this report + `graphify update .` (done, exit 0)

---

## What was done

Converted the Ignis app from the flat "Ember Professional" theme to a full **Liquid Glass** UI (translucent, blurred, softly rimmed warm surfaces) while leaving app logic, routing, zustand stores, scoring, simulator, Ask Ignis behavior, and the dataset untouched. The NASA `Pillars of Creation` backdrop (`public/hero-pillars-of-creation.jpg`, 963,113 bytes, public domain) now shows through the glass sheets.

Commits (all PC3-owned paths unless noted — the charts/files PC2 owns were crossed with prior user approval flagged in STEP 0):

| Commit | Task | Files |
|---|---|---|
| `e895773` | T1 glass recipe + backdrop | `src/design-system/theme.css`, `src/app/app.css`, `src/design-system/Backdrop.tsx` (new), `src/app/App.tsx`, `public/hero-pillars-of-creation.jpg`, `docs/superpowers/plans/2026-11-15-liquid-glass-surfaces.md` |
| `d57416b` | T2 design-system primitives | `Panel`, `Card`, `Badge`, `Button`, `Tabs`, `Drawer`, `Tooltip`, `Skeleton`, `EmptyState`, `Collapsible`, `CitationChip` |
| `a3751f6` | T3 shell | `AppShell`, `ScenarioBar`, `CorporateShell`, `ErrorBoundary` |
| `dc2a660` | T4 charts (PC2 path, pre-approved) | `chartTheme.ts`, `FlatTooltip.tsx`, `ChartFrame.tsx`, `OxygenLimitChart.tsx` |
| `a83cd92` | T5 assistant drawer | `AskIgnisDrawer.tsx`, `NasaLiteraturePanel.tsx` |
| `f8ca276` | T6 PC3 feature pages | `home`+`Orb`, `insights`+`InsightCard`, `playbook`, `simulator`, `brief`, `glossary`, `method`, `CommandPalette`, `app.css` |
| `1546e8c` | T7 PC2 pages + corporate | `compare`, `explore`, `rankings`, `materials`, `coverage`, `timeline`, 6 corporate pages |
| `eb40743` | T8 nested-blur guards | `theme.css` |
| `d328846` | T9 rules/notes | `AGENTS.md`, `app.css`, `design-system.css`, `design-system/NOTES.md` (new) |

Uncommitted (not staged, not mine): `IGNIS_TRANSFORMATION_PROMPT.md` §20 addition and PC1's in-flight changes to `data/`, `src/lib/`, `tests/` (concurrent PC1 lane on the same tree).

---

## Files changed (PC3 area, this session)

`src/design-system/theme.css`, `src/app/app.css`, `src/design-system/design-system.css`, `AGENTS.md`, plus `src/design-system/NOTES.md` (new), and the Task 7 surface files listed above.

### Intentionally-left hardcoded colours / flat surfaces (documented exceptions)

- `--ig-glass-fill: linear-gradient(160deg, #ffffff14, #ffffff05)` — the **one deliberate gradient** in the app; it makes a sheet read as glass. Allowed exception to "no gradients"; orb, buttons, charts, heatmaps remain solid. Flagged in `src/design-system/NOTES.md`.
- `bg-ig-flame-blue … hover:bg-ig-amber` on corporate section entry-buttons — the one solid accent button, kept opaque by design.
- `border-b border-ig-line` / `border-t border-ig-line` table & card hairlines — intentional dividers, not blur surfaces.
- Heatmap "no data" cells use SVG `<pattern>` diagonal lines (reference bare `var(--ig-line)`/`var(--ig-vacuum)`), not a CSS gradient.
- No stray hardcoded `#hex`/`rgba()` surface colours remain in PC3 tsx/tsx files (guard greps clean; the one hit earlier was the HTML entity `&#8220;`).

---

## Done / not-done checklist — every surface

| Surface | Glass applied? | Notes |
|---|---|---|
| Backdrop + scrim (photo) | Yes | Photo `opacity: 0.5` + vertical scrim `0.04 → 0.34 → 0.72` |
| App root / `.ig-app` | Yes | `bg-ig-vacuum` removed |
| Left rail / SideRail | Yes | `.ig-glass-nav .ig-glass--borderless` |
| Mobile header + bottom tab bar | Yes | glass nav, floating `rounded-panel` |
| "More" sheet | Yes | `.ig-glass-overlay` + scrim |
| Scenario Bar | Yes | glass nav + segmented glass field |
| CorporateShell header/menu | Yes | glass nav + `.ig-glass-overlay` menu + scrim |
| ErrorBoundary | Yes | root bg removed |
| Panel / Card / Collapsible | Yes | `.ig-glass` / `.ig-glass--solid` |
| Badge | Yes | severity/confidence = solid `.ig-solid-chip`; status chips = `.ig-glass-tint` |
| Button | Yes | primary solid gold kept; outline/tertiary glass controls |
| Tabs | Yes | segmented glass control; active = frost text + gold underline |
| Drawer / Tooltip / Skeleton / EmptyState | Yes | `.ig-glass-overlay` / glass field |
| CitationChip | Yes | resolved = `.ig-glass-tint`; unresolved = `.ig-solid-chip` alarm |
| FlatTooltip / ChartFrame / OxygenLimitChart cursor | Yes | glass overlay / glass panel / `var(--ig-glass-field)` |
| AskIgnisDrawer + NasaLiteraturePanel | Yes | glass scenario card, bubbles, cards, skeletons; error banner `bg-ig-glass-sunken` |
| Home + Orb | Yes | Orb tokens value-preserving (`#E3B76B`/`#F5B942` = tokens) |
| Insights + InsightCard | Yes | severity stripe kept (colour+word+icon) |
| Playbook | Yes | glass step circles |
| Simulator | Yes | glass selects/presets/reset |
| Brief | Yes | error banner `bg-ig-glass-sunken` |
| Glossary | Yes | search glass field; Panels `.ig-glass--solid` |
| Method | Yes | all 8 Collapsibles `.ig-glass--solid` |
| CommandPalette | Yes | `.ig-glass-scrim` + `ig-glass-overlay` |
| PC2: explore / rankings / materials / coverage / timeline | Yes | scripted literal refactor, all `ig-glass` surfaces |
| PC2: compare | Yes | 7 flat surfaces + tinted error card; table hairlines kept |
| Corporate: 6 pages | Yes | sections + entry links glass; brand primaries kept |
| Nested-sheet blur guard | Yes | sheet-in-sheet drops second blur; `--solid` excluded |
| Nested-overlay guard | Yes | overlay-in-overlay drops blur |
| `prefers-reduced-motion` | Yes | orb static, animations off |
| `prefers-reduced-transparency` | Yes | sheets become solid |
| No `backdrop-filter` fallback | Yes | `@supports not` → solid warm fill |
| Print | Yes | sheets dropped, overlays white, `#111111` text |

**Not done / out of scope:** Method page copy discrepancy ("Nine sections" vs 8 Collapsibles) — pre-existing, deliberately not touched (not our copy). PC1's `tests/coverage.test.ts` build blocker (below).

---

## Verification results (Task 10 gate)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** — PC3 code typechecks clean |
| `npx vitest run` | **269 passed, 17 files** |
| `npx eslint .` | exit 1, but **all 3 errors are PC1-owned**: `.worktrees/nasa-grounding/api\nasa.ts` (control char), `.worktrees/nasa-grounding\src\main.tsx` (warning), `tests/coverage.test.ts` (2 unused imports). Zero errors in PC3 area. |
| `npx vite build` (bundling) | **exit 0** |
| `npm run build` (`tsc -b && vite build`) | **BLOCKED** — `tsc -b` fails only on PC1's uncommitted `tests/coverage.test.ts` (`getPartialGravityExperiments`, `hasPartialGravityData` unused). PC1-owned; PC3 cannot touch. Everything in PC3 passes. |
| Chunk sizes (gz) | All route chunks < 250 KB; largest = `compare` 123.87 KB gz |
| Playwright smoke | **8/8 passed** (scenario bar → orb/URL, Ask Ignis offline + citations, insights severity filter, simulator recalc, brief markdown, print mode, command palette, mobile bottom tabs + More sheet) |
| Playwright route load | **39/39 passed** — all 13 routes × 3 viewports (390×844, 768×1024, 1440×900), **zero console errors** |
| Reduced motion / transparency | Passed — orb static under reduced motion, no console errors under reduced transparency |
| Print/PDF | Covered by smoke test — shell chrome dropped, markdown content retained |

### Contrast
- `--ig-muted` lifted `#b3a394` → `#c4b6a8`: **5.0:1 on glass** (was 4.3:1); ~9:1 on flat surfaces.
- Solid chips with `--ig-on-accent` ink: info/gold **9.7:1**, caution/amber **10.3:1**, high/ember **6.5:1**, critical/alarm **6.0:1**, verified/olive **8.4:1**, illustrative/muted **7.4:1** — all pass AA; each chip also carries icon + word (colour never the only signal).
- Active tabs use frost text + gold underline (gold text on `--ig-glass-pressed` measured 4.44:1, fails AA — avoided).

### Scrim
Backdrop photo at `opacity: 0.5` plus a vertical gradient scrim (`0.04 → 0.34 → 0.72`) so the nebula stays readable at top and fades to near-solid charcoal at the bottom where dense tables live.

---

## What still needs a decision / action

1. **Build blocker (PC1):** `npm run build` fails only because PC1's uncommitted `tests/coverage.test.ts` has 2 unused imports. PC3 cannot edit PC1-owned `tests/`. **Action needed:** PC1 fix their test file, then `npm run build` passes. Everything in PC3 is green.
2. **Push to main:** Nothing has been pushed. Branch `glass-surfaces` sits 9 commits ahead of `main` @ `0a5f167`. Push (and any tag) requires separate approval per AGENTS.md O7.
3. **Deliberate gradient exception:** `--ig-glass-fill` is the one gradient in the app (sheet sheen). It's documented in `src/design-system/NOTES.md` and flagged here for sign-off.

---

## Graph check

`graphify update .` ran after the final code changes — exit 0. Code graph current; only CSS/markdown changed since the last graph build (graphify skips non-classified CSS; markdown docs handled via the hook on commit).

**Graph check: 0 new code symbols introduced this session beyond the verified design-system primitives (`.ig-glass`, `.ig-glass--borderless`, `.ig-glass--solid`, `.ig-glass-nav`, `.ig-glass-overlay`, `.ig-glass-scrim`, `.ig-glass-tint`, `.ig-solid-chip`, plus the nested-sheet/nested-overlay guards), 0 stubs used, 0 contract-vs-graph mismatches.**

All PC3 surfaces are glass-applied, tsc/lint/vitest/Playwright green in PC3's area, and the only outstanding item is PC1's `tests/coverage.test.ts` build blocker plus push approval.
