# Liquid Glass Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert every UI surface in Ignis from flat solid fills to translucent, blurred, softly rimmed Liquid Glass panels, without changing a single line of app logic, routing, store, scoring, simulator, Ask Ignis behavior, or dataset.

**Architecture:** One glass recipe lives in `src/design-system/theme.css` as CSS custom properties plus a small set of `@layer components` primitives (`.ig-glass`, `.ig-glass-nav`, `.ig-glass-overlay`, `.ig-glass-scrim`, `.ig-glass-tint`, `.ig-solid-chip`). Components and pages consume those primitives and a matching set of Tailwind utilities (`bg-ig-glass-control`, `border-ig-glass-control-rim`, …). A single fixed NASA backdrop (`src/app/Backdrop.tsx`) sits behind everything so the blur has something to refract. Depth comes from a 1px rim plus a translucent sheet — never from a shadow or a glow.

**Tech Stack:** Vite, React 18, TypeScript strict, Tailwind CSS v4, react-router-dom, zustand, recharts, framer-motion, lucide-react, vitest, @playwright/test. No new dependencies.

**Spec:** `IGNIS_TRANSFORMATION_PROMPT.md` (project rules) and the user's Liquid Glass prompt (delivered in conversation, summarised in Global Constraints below).

## Global Constraints

Copied verbatim from the user's glass prompt; every task implicitly includes these.

- Edit files in place. Do not recreate the project. Do not reinstall dependencies. Do not add dependencies.
- Do not change app logic, routing, zustand stores, scoring, simulator math, Ask Ignis behavior, or the dataset.
- Do not alter, hide, or restyle the `verified` / `curated` / `illustrative` badges, the citation chips, or the "decision-support estimates, not physics simulations" label. They stay visible and legible on every surface.
- Never invent data. Nothing new is presented as a NASA fact.
- `backdrop-filter` must not sit on an element that also carries a border and content. Use the `::before` technique (`.ig-glass`, `.ig-glass-nav`).
- Never nest `backdrop-filter` (`.ig-glass-overlay` flattens nested sheets).
- Colour is never the only signal. Severity keeps its icon plus its word.
- No hardcoded hex/rgb surface colours left in components. Surface values live only in `theme.css` (and the two documented exceptions in `app.css`: the backdrop scrim and the print sheet).
- Glass intensity default: 20px blur, 115–118% saturation; 12px on phones.
- Dark only. Sentence case. Visible focus rings. `prefers-reduced-motion` and `prefers-reduced-transparency` respected. Usable at 375px and 1440px.
- Test at 390×844, 768×1024, 1440×900.
- TypeScript strict typecheck, lint, and production build must all pass.
- Never claim something was tested that was not executed.

## Review Focus

Inputs and conditions the spec implies but no task's tests exercise — each gets a check in the task that owns the code.

1. **`backdrop-filter` unsupported** (older Firefox, some Linux WebKit builds). The sheet must fall back to a solid warm fill, not a transparent one, or text lands on raw photo. Owned by Task 1 (`@supports not` block) — check by disabling `backdrop-filter` in devtools and confirming panels stay legible.
2. **`prefers-reduced-transparency: reduce`** set by the OS. Panels must go solid. Owned by Task 1 — check via devtools emulation.
3. **A drawer, palette, or tooltip opened on top of a glass panel.** Nested blur must not occur and the overlay must stay legible over the brightest part of the photo. Owned by Tasks 2 and 8 — open Ask Ignis over the Home hero.
4. **Text over the brightest photo pixel** (the top-centre pillar, ~#c9a06a behind a 0.5-opacity photo). `--ig-muted` must clear 4.5:1 and `--ig-frost` 7:1. Owned by Task 11 — verified by sampling real rendered pixels, not by arithmetic alone.
5. **Print / PDF export** of Brief and Playbook. Glass pseudo-elements must not print as grey boxes and badges must survive grayscale. Owned by Tasks 1 and 10 — check via Playwright `page.pdf()` or print preview.
6. **Grayscale.** Severity must stay readable with colour stripped. Owned by Task 2 — check with a grayscale filter.

---

### Task 1: Glass recipe foundation

Already drafted in the working tree. This task closes it out and proves the fallbacks.

**Files:**
- Modify: `src/design-system/theme.css` (done: tokens, `@theme inline` glass entries, `@layer components` primitives, mobile blur reduction, `@supports not`, `prefers-reduced-transparency`)
- Modify: `src/app/app.css` (done: `.ig-backdrop`, `.ig-backdrop-photo`, `.ig-backdrop::after` scrim, `.ig-app`, extended `@media print`)
- Create: `src/app/Backdrop.tsx` (done)
- Modify: `src/app/App.tsx` (done: `<Backdrop />` + `.ig-app` wrapper)
- Add: `public/hero-pillars-of-creation.jpg` (done, byte-for-byte, 963,113 bytes)

**Interfaces:**
- Produces: CSS classes `.ig-glass`, `.ig-glass--borderless`, `.ig-glass--solid`, `.ig-glass-nav`, `.ig-glass-overlay`, `.ig-glass-scrim`, `.ig-glass-tint`, `.ig-solid-chip`; Tailwind colour utilities `bg-ig-glass-{control,hover,pressed,field,sunken,scrim}`, `border-ig-glass-{control-rim,field-rim,rim,rim-strong}`; radii `rounded-{panel,control,field,pill}`. Every later task uses these and must not invent new surface tokens.

- [ ] **Step 1: Verify the backdrop asset is unmodified**
  Run: `node -e "console.log(require('fs').statSync('public/hero-pillars-of-creation.jpg').size)"`
  Expected: `963113`
- [ ] **Step 2: Verify the unsupported-blur fallback**
  In `npm run dev`, devtools → Rendering → disable "backdrop-filter". Panels must keep a near-solid warm fill and all body text must stay readable. Record a screenshot.
- [ ] **Step 3: Verify the reduced-transparency path**
  Devtools → Rendering → emulate `prefers-reduced-transparency: reduce`. Panels go solid; no blur remains.
- [ ] **Step 4: Confirm no component hardcodes a surface colour**
  Run: `rg -n "#[0-9a-fA-F]{3,8}|rgba?\(" src/design-system src/app --glob '!*.css'`
  Expected: no matches in `.tsx` files.
- [ ] **Step 5: Commit**
  `git add src/design-system/theme.css src/app/app.css src/app/Backdrop.tsx src/app/App.tsx public/hero-pillars-of-creation.jpg` then `git commit -m "pc3: liquid glass recipe, backdrop layer and print rules"`

### Task 2: Design-system components

**Files:**
- Modify: `src/design-system/Panel.tsx`, `Card.tsx`, `Badge.tsx`, `Button.tsx`, `Tabs.tsx`, `Drawer.tsx`, `Tooltip.tsx`, `Skeleton.tsx`, `Collapsible.tsx`, `CitationChip.tsx`

**Interfaces:**
- Consumes: Task 1's primitives.
- Produces: `Badge` gains an optional `variant?: "tint" | "solid"` prop (default `"tint"`). `SeverityBadge` and `ConfidenceBadge` pass `variant="solid"`. All existing props and exports are unchanged.

- [ ] **Step 1: Panel / Card / Stat → `.ig-glass rounded-panel`** (remove `border border-ig-line bg-ig-hull` / `bg-ig-vacuum`). `Card` with `bordered={false}` gets `.ig-glass--borderless`.
- [ ] **Step 2: Badge → single `--tint` styling path.** `toneTint` maps each `BadgeTone` to its token; `variant="tint"` renders `.ig-glass-tint`, `variant="solid"` renders `.ig-solid-chip`. Severity and confidence badges use `solid`. Keep every icon and label exactly as-is.
- [ ] **Step 3: Button → glass controls.** Primary stays solid gold with `--ig-on-accent` ink. Secondary/outline/ghost/tertiary use `bg-ig-glass-control` / `bg-ig-glass-field` with `border-ig-glass-control-rim` and `hover:bg-ig-glass-hover` / `active:bg-ig-glass-pressed`.
- [ ] **Step 4: Tabs → segmented glass control.** Container becomes a rounded glass field; the active tab gets a raised fill plus `text-ig-flame-blue`; inactive stays `text-ig-muted` with `hover:bg-ig-glass-hover`. Active state is signalled by fill **and** colour, so it is not colour-only. Arrow-key handling and `aria-selected` are untouched.
- [ ] **Step 5: Drawer → floating glass panel.** Scrim `ig-glass-scrim`; panel `ig-glass-overlay` with `rounded-panel` and a margin so it floats. Focus trap, Escape, and focus restore are untouched.
- [ ] **Step 6: Tooltip → `ig-glass-overlay rounded-control`.**
- [ ] **Step 7: Skeleton → `bg-ig-glass-control`; EmptyState → `.ig-glass rounded-panel`.**
- [ ] **Step 8: Collapsible → panel tone gets `.ig-glass rounded-panel`; `hover:bg-ig-glass-hover`.**
- [ ] **Step 9: CitationChip → `.ig-glass-tint` with `--tint: var(--ig-line)` when resolved, `--tint: var(--ig-alarm)` when unresolved. Keep the `FileText` icon and the "unresolved" wording.**
- [ ] **Step 10: Grayscale + fallback check.** Load `/app/explore` and `/app/insights`, apply a grayscale filter, and confirm each severity badge still reads. Then disable `backdrop-filter` again.
- [ ] **Step 11: Commit** `git commit -m "pc3: glass design-system components"`

### Task 3: Shell — AppShell, ScenarioBar, CorporateShell, ErrorBoundary

**Files:**
- Modify: `src/app/AppShell.tsx` (18 flat surface uses), `src/app/ScenarioBar.tsx` (5), `src/app/corporate/CorporateShell.tsx` (11), `src/app/ErrorBoundary.tsx` (1)

- [ ] **Step 1: Remove every `bg-ig-vacuum` root fill in the shells** so the backdrop shows through. Shell roots become transparent.
- [ ] **Step 2: SideRail + MobileHeader + MobileTabs + MoreSheet → `.ig-glass-nav`** with `rounded-*` as appropriate. On mobile the rail becomes a floating bottom tab bar (Task 12 in the original prompt's spec) — keep the existing breakpoint logic, only change surfaces.
- [ ] **Step 3: ScenarioBar → glass.** Segmented control on `bg-ig-glass-field`; `fieldClass` inputs to `border-ig-glass-field-rim bg-ig-glass-field`; the "assumption" warning keeps `text-ig-amber` plus its icon.
- [ ] **Step 4: CorporateShell nav + ErrorBoundary card → glass.**
- [ ] **Step 5: Check 375px and 1440px.** No layout shift on load, rail/tab-bar swap still works, scenario switching still re-ranks.
- [ ] **Step 6: Commit** `git commit -m "pc3: glass app shell, scenario bar and corporate shell"`

### Task 4: Charts

**Files:**
- Modify: `src/components/charts/chartTheme.ts` (12 hardcoded hex), `FlatTooltip.tsx`, `ChartFrame.tsx`
- Read-only: `FlameSpeedChart.tsx`, `OxygenLimitChart.tsx`, `ConditionsRadar.tsx`, `markers.tsx`

- [ ] **Step 1: `chartTheme.ts`** — replace the 12 hex fallbacks with `var(--ig-*, #fallback)` pairs so SVG attributes still resolve, or with the token values themselves. Keep `REGIME_STYLES` colour + shape + label triples exactly as they are; colour must never carry regime alone.
- [ ] **Step 2: `FlatTooltip` → `ig-glass-overlay`.** Recharts renders tooltips inside the chart container, which is inside a glass panel — confirm the nested-blur guard flattens it.
- [ ] **Step 3: `ChartFrame`** — the frame's own surface becomes glass; the data-table toggle and the summary line stay.
- [ ] **Step 4: Verify charts at 390px and 1440px** on `/app/compare` and `/app/rankings`. Axis labels and grid lines stay readable; no gradient was introduced into any chart.
- [ ] **Step 5: Commit** `git commit -m "pc2: glass chart theme, tooltip and frame"`

### Task 5: Assistant — Ask Ignis drawer and literature panel

**Files:**
- Modify: `src/features/assistant/AskIgnisDrawer.tsx` (9 flat uses), `src/features/assistant/NasaLiteraturePanel.tsx` (1)

- [ ] **Step 1: Drawer chrome → glass.** Composer, message bubbles, and the offline/grounded `Badge`s keep their current tones (they become tinted chips automatically).
- [ ] **Step 2: Citation chips inside answers stay `CitationChip`** — do not restyle them locally.
- [ ] **Step 3: Open the drawer over the Home hero** and confirm legibility over the brightest photo region and that no nested blur occurs.
- [ ] **Step 4: Commit** `git commit -m "pc3: glass assistant drawer and literature panel"`

### Task 6: PC3 feature pages

**Files:**
- Modify: `src/features/home/index.tsx`, `home/Orb.tsx`, `insights/index.tsx`, `insights/InsightCard.tsx`, `playbook/index.tsx`, `simulator/index.tsx`, `brief/index.tsx`, `glossary/index.tsx`, `method/index.tsx`, `palette/CommandPalette.tsx`

- [ ] **Step 1: Home** — hero, stat cards, entry points to glass. `Orb.tsx`: keep the flat solid circle → amber teardrop morph, the pause button, and the `prefers-reduced-motion` static state. Replace only the 2 hardcoded hex with tokens. No gradient, no glow.
- [ ] **Step 2: Insights + InsightCard** — cards to glass; the severity stripe must keep its icon and label.
- [ ] **Step 3: Playbook** — phase steps to glass; every step keeps its evidence chips.
- [ ] **Step 4: Simulator** — inputs to `bg-ig-glass-field`; the risk bar keeps discrete solid steps (no continuous ramp); the "decision-support estimates, not physics simulations" label stays visible and unedited.
- [ ] **Step 5: Brief** — glass on screen, and the print path verified in Task 10.
- [ ] **Step 6: Glossary + Method** — long-form reading surfaces use `.ig-glass--solid` so prose sits on a calmer sheet. Method keeps its limitations section verbatim.
- [ ] **Step 7: CommandPalette** — `ig-glass-overlay` + `ig-glass-scrim`. Keyboard navigation unchanged.
- [ ] **Step 8: Commit** `git commit -m "pc3: glass feature pages"`

### Task 7: PC2 feature pages

**Files:**
- Modify: `src/features/compare/index.tsx` (7 flat uses, 19 borders), `src/features/corporate/{HomePage,PricingPage,ProductPage,SolutionsPage,TechnologyPage,AboutPage}.tsx`
- Read-only (inherit glass via Panel/Card): `explore/`, `rankings/`, `materials/`, `coverage/`, `timeline/`

- [ ] **Step 1: Compare** — the side-by-side columns and overlay controls to glass. Table hairlines may stay `border-ig-line`.
- [ ] **Step 2: Six corporate pages** — hero blocks and cards to glass; keep the marketing copy untouched.
- [ ] **Step 3: Confirm the inherited pages.** Load `/app/explore`, `/app/rankings`, `/app/materials`, `/app/coverage`, `/app/timeline` and confirm panels are glass with no extra edits needed. If a page uses a raw `div` surface, convert it.
- [ ] **Step 4: Verify `materials/` heatmap and `coverage/` grid** still use discrete solid steps and the SVG diagonal `<pattern>` for "no data". No continuous ramp.
- [ ] **Step 5: Commit** `git commit -m "pc2: glass compare, corporate pages and inherited views"`

### Task 8: Nested-blur and overlay audit

- [ ] **Step 1:** Open every overlay in turn (Ask Ignis, command palette, experiment drawer, tooltip, mobile More sheet) and confirm in devtools that no element inside an `.ig-glass-overlay` computes a non-`none` `backdrop-filter`.
- [ ] **Step 2:** Confirm no element carries both `backdrop-filter` and a content border. Run: `rg -n "backdrop-filter" src --glob '!*.css'` → expect no matches.
- [ ] **Step 3: Commit** any fixes.

### Task 9: Contract and docs

**Files:**
- Modify: `AGENTS.md` (FLAT RULES sentence)
- Modify: `src/design-system/NOTES.md` or create it if absent
- Modify: stale comments in `Button.tsx`, `chartTheme.ts`, `Skeleton.tsx`, `Collapsible.tsx`, `app.css`

- [ ] **Step 1: Amend the FLAT RULES paragraph in `AGENTS.md`** to the new SURFACE RULES: no glow, no drop shadow, no continuous colour ramp, colour never the only signal; blur is permitted only on the `::before` sheet of a `.ig-glass*` primitive; every surface value lives in `theme.css`.
- [ ] **Step 2:** Fix every comment that still claims "flat by design / no blurs" where the code now uses glass.
- [ ] **Step 3:** Write `NOTES.md` in the design-system folder: the recipe, the mapping table from flat utility → glass utility, and the fallbacks.
- [ ] **Step 4: Commit** `git commit -m "docs: amend surface rules for glass and record the recipe"`

### Task 10: Build, test and verification gate

- [ ] **Step 1:** `npx tsc --noEmit` → zero errors.
- [ ] **Step 2:** `npm run lint` → zero errors.
- [ ] **Step 3:** `npm run build` → succeeds; note each route chunk's gzipped size and flag anything over ~250 KB.
- [ ] **Step 4:** `npm test` → existing unit tests pass. No test was modified to make glass pass.
- [ ] **Step 5:** Playwright at 390×844, 768×1024, 1440×900 across all 13 routes: screenshot each, and assert zero console errors.
- [ ] **Step 6: Pixel-sample contrast.** For each viewport, sample the rendered background behind representative text nodes (top, middle, bottom of the viewport) and compute WCAG contrast for `--ig-frost`, `--ig-muted`, and each solid chip against its actual backdrop. Record the measured ratios.
- [ ] **Step 7: Fix any failing pair** by adjusting the scrim opacity or the glass base alpha — never by changing the text colour of a badge whose meaning depends on it. Re-measure and record before/after.
- [ ] **Step 8: Print check.** `page.pdf()` (or print preview) on `/app/brief` and `/app/playbook`; confirm no grey glass boxes and legible grayscale badges.
- [ ] **Step 9: Reduced-motion + reduced-transparency check** with Playwright's `emulateMedia`.
- [ ] **Step 10: Demo flow.** Walk the 90-second flow: Mars → rankings re-sort → open top experiment → add a second to Compare → read the SI comparison → Materials hot cells → Simulator 34% O₂ on the Moon → Ask Ignis "Is a 34% oxygen cabin riskier on the Moon?" → cited answer → Brief. Offline, no API key.
- [ ] **Step 11: Commit** `git commit -m "pc3: verification pass for glass surfaces"`

### Task 11: Final report

- [ ] **Step 1:** Produce the report the user's prompt requires: files changed; intentionally-left hardcoded colours (with the reason for each); a done/not-done checklist of every surface; what was tested vs not tested; every contrast failure fixed with before/after numbers; any scrim added with before/after; and anything still needing a user decision.
- [ ] **Step 2:** Run `graphify update .` so the local graph matches the tree.
- [ ] **Step 3:** End with the Graph check line: symbols verified, stubs used, contract-vs-graph mismatches.

---

## Git handling

All work happens on a new local branch `glass-surfaces` cut from `main` at `0a5f167`. Commits happen locally as each task completes. **Pushing is not part of this plan** — pushing to `main` requires operator approval under AGENTS.md O7, and will be asked for separately at the end.

`IGNIS_TRANSFORMATION_PROMPT.md` has an uncommitted §20 addition (the user's earlier work). It is never staged, reverted, or reformatted by this plan.

## Definition of done

`npx tsc --noEmit`, `npm run lint` and `npm run build` all pass with zero errors; every surface listed in Task 11's checklist is glass; no hardcoded surface hex remains outside `theme.css`; contrast measured on real pixels passes AA; the 90-second demo works offline; no gradient, glow or drop shadow was introduced; every badge, citation and honesty label is untouched; `graphify-out/` is not staged.
