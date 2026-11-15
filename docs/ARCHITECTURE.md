# Ignis Architecture

Three parallel agents (PC1 Core, PC2 Explore, PC3 Experience) build one app in
parallel, disciplined by a frozen contract, hard file ownership, and separate
git branches. Collisions are prevented by ownership — nobody edits a file
outside their own paths.

## PC ownership

| PC | Role | Owns |
|---|---|---|
| **PC1 Core** | Scaffold, data, intelligence | `package.json`, configs, `src/main.tsx`, `src/contracts/**`, `src/lib/**`, `src/store/**`, `data/**`, `scripts/**`, `tests/**`, `AGENTS.md`, theme.css (Phase 0 only) |
| **PC2 Explore** | Data views | `src/features/explore|compare|rankings|materials|coverage|timeline/**`, `src/components/charts/**` |
| **PC3 Experience** | Design system, shell, assistant, tools, polish | `src/app/**`, `src/design-system/**` (after Phase 0), `src/features/home|insights|playbook|simulator|brief|glossary|method|assistant|palette/**`, `public/**`, `e2e/**`, `README.md`, `docs/**` |

`graphify-out/` is never committed. Only PC1 runs graphify.

## Module contract — `src/contracts/types.ts`

The frozen TypeScript contract that every module imports from
`@/contracts/types`. Nobody edits it after Phase 0. Key types:

- `Experiment` — id, name, acronym, summary, facility, regime, years,
  fuelType, fuel, conditions, metrics, findings, safetyTakeaway, sources,
  confidence, tags
- `Scenario` — iss, lunar, mars, eva, custom presets with gravity/O₂/pressure
- `ScoreWeights` / `RankedExperiment` — scoring inputs and outputs
- `Insight` — severity, scenarios, evidenceIds, confidence, recommendation
- `Material` / `MaterialRisk` — flammability index and per-scenario risk
- `SimInput` / `SimResult` — simulator input and explained output
- `CoverageCell` — gravity × oxygen evidence grid cell
- `GlossaryTerm`, `TimelineEvent`, `Playbook`, `SIRequest` / `SIResponse`

## Frozen module API

PC1 provides (`@/lib/*`):

| Module | Exports |
|---|---|
| `@/lib/data` | `getExperiments`, `getExperiment(id)`, `getMaterials`, `getTimeline`, `getGlossary`, `getGlossaryTerm(id)` |
| `@/lib/scenarios` | `SCENARIOS`, `getScenario(id)`, `customScenario(g, o2, kPa)` |
| `@/lib/scoring` | `defaultWeights`, `rankExperiments(exps, weights, scenario)` |
| `@/lib/search` | `searchExperiments(query, exps)` |
| `@/lib/insights` | `getInsights(scenario)` |
| `@/lib/materials` | `getMaterialRisks(scenario)`, `getMaterialMatrix()` |
| `@/lib/simulator` | `simulateRisk(input): SimResult` |
| `@/lib/coverage` | `getCoverage()`, `getGaps(scenario)` |
| `@/lib/playbook` | `getPlaybook(id)` |
| `@/lib/brief` | `buildBriefMarkdown(scenario, weights, compareIds): string` |
| `@/lib/si` | `askSI(req): Promise<SIResponse>` (never throws) |
| `@/store/useIgnis` | zustand: scenario, weights, filters, compareIds, bookmarks, drawer, palette |
| `@/store/urlSync` | `initUrlSync()` — scenario, compareIds, selectedId, filters ↔ URL query |

PC2 provides (`src/features/<name>/index.tsx`):

`ExplorePage`, `ComparePage`, `RankingsPage`, `MaterialsPage`,
`CoveragePage`, `TimelinePage`; and from `@/components/charts`:
`FlameSpeedChart`, `OxygenLimitChart`, `ConditionsRadar`.

PC3 provides (`src/app/**`, `src/design-system/**`):

`App`, `routes`, `Button`, `Badge`, `SeverityBadge`, `ConfidenceBadge`,
`Panel`, `Stat`, `Tabs`, `Drawer`, `Tooltip`, `Skeleton`, `EmptyState`,
`Term`, `CitationChip`; and feature pages:
`HomePage`, `InsightsPage`, `PlaybookPage`, `SimulatorPage`, `BriefPage`,
`GlossaryPage`, `MethodPage`, `AskIgnisDrawer`, `CommandPalette`,
`ErrorBoundary`.

## Data flow

```
ScenarioBar (PC3 store) ───┐
                           ▼
Views read store.scenario ─┼─► Rankings: rankExperiments(exps, weights, scenario)
                           ├─► Insights: getInsights(scenario)
                           ├─► Simulator: simulateRisk({..., scenario values})
                           ├─► Materials: getMaterialRisks(scenario)
                           ├─► Coverage: getGaps(scenario)
                           ├─► Playbook: getPlaybook(scenario.id)
                           └─► Brief: buildBriefMarkdown(scenario, ...)
```

The scenario bar is a global segmented control. Changing it re-scores
rankings, re-filters insights, re-baselines the simulator, updates the Flame
Orb, and updates material risks — everywhere, instantly.

## Routes

| Route | Page | PC |
|---|---|---|
| `/` | Marketing home | PC3 |
| `/product`, `/solutions`, `/technology`, `/pricing`, `/about` | Marketing | PC3 |
| `/app` | Mission overview (hero + Flame Orb + top insights) | PC3 |
| `/app/explore` | Searchable experiment library + detail drawer | PC2 |
| `/app/compare` | 2–4 experiments side by side + chart overlay + SI comparison | PC2 |
| `/app/rankings` | Ranked experiments, weight sliders, score breakdown | PC2 |
| `/app/materials` | Material × scenario risk matrix (heatmap) | PC2 |
| `/app/coverage` | Evidence-coverage map (gravity × oxygen) + SI gap interpretation | PC2 |
| `/app/timeline` | Decades of microgravity combustion research, filterable | PC2 |
| `/app/insights` | Evidence-linked fire-safety insights by severity | PC3 |
| `/app/playbook` | Crew response playbook per scenario | PC3 |
| `/app/simulator` | What-if risk estimator with explained drivers | PC3 |
| `/app/brief` | One-click Mission Safety Brief (markdown + print-to-PDF) | PC3 |
| `/app/glossary` | Plain-language combustion terms with inline tooltips | PC3 |
| `/app/method` | How scoring, confidence, SI grounding, simulator work + limitations | PC3 |

Right drawer "Ask Ignis" on every page. Ctrl/Cmd+K command palette everywhere.

## Design system — `src/design-system/`

Liquid Glass theme (amended 2026-11-15 from the original flat rules):

- Sheets are translucent warm-charcoal (`rgba(28,22,18,0.58)`) plus a faint
  two-stop white sheen and a 1px inset rim
- Blur lives on `::before`, never on the element that carries the rim and
  content; two blurs are never stacked
- No glow, no drop shadow, no continuous colour ramps, no gradient on the orb,
  buttons, charts or heatmaps
- Depth from the 1px rim, vacuum/hull/raised steps, and layered translucency
- Radius: 12px panels, 8px controls/fields, 999px pills
- Dark only; `color-scheme: dark` on `<html>`

## Honesty rule

Never present invented numbers as NASA fact. Every experiment carries
confidence: `verified` (from a cited NASA source actually retrieved),
`curated` (summarized from a cited source), `illustrative` (placeholder). The
UI shows a badge everywhere. Derived outputs (scores, material risks,
simulator) are labeled "decision-support estimates, not physics simulations."

## Git rules

- Branches: `pc1-core`, `pc2-explore`, `pc3-experience`
- Commit small, push to your branch only: `git add <owned paths> && git commit && git push`
- Never `git add -A`, never force-push, never repo-wide formatters
- To pull teammates: `git fetch origin && git merge origin/<branch> --no-edit`
- Pushing to `main`, tags and merges need operator approval

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (localhost:5173) |
| `npm run build` | `tsc -b` + Vite production build |
| `npm run preview` | Serve the built `dist` locally |
| `npm test` | Vitest unit tests (278 tests) |
| `npm run lint` | ESLint |
| `npm run validate:data` | Data integrity validation (zod + cross-reference) |
| `npx playwright test` | E2E smoke tests |
| `npx tsc -b` | TypeScript project references build |

## Build tiers

| Tier | What |
|---|---|
| P0 (demo-critical) | Scaffold, contract, 20+ experiments, store, scoring, search, SI with offline fallback, shell + Scenario Bar, Home, Explore, Rankings, Compare, Insights, Ask Ignis |
| P1 (wow factor) | Materials matrix, Coverage gaps, Simulator, Playbook, Brief export, Glossary + tooltips, Command palette, Timeline, URL state sync |
| P2 (polish) | Method page, onboarding, bookmarks, print styles, e2e smoke test, extra experiments (~30), performance pass, README/docs |

## Known limits

- The dataset is small and unevenly weighted toward microgravity. Partial-gravity
  and high-oxygen coverage is thin, and the UI says so.
- Partial-gravity scenarios are extrapolations, not measurements.
- The simulator is arithmetic over qualitative indices, not a fire model.
- Nothing here uses live vehicle telemetry.
- Absence of a risk signal is not evidence of safety.
