# Ignis — fire-safety intelligence for microgravity

Ignis turns decades of NASA microgravity combustion research into fire-safety
answers for the Moon and Mars. Pick a scenario once — ISS cabin, lunar habitat,
Mars transit, EVA suit, or your own gravity/oxygen/pressure — and every ranking,
insight, material risk, simulator baseline, playbook and brief follows it.

Built for the NASA Space Apps 2026 challenge *"Flame in Freefall: SI-Powered Fire
Safety Insights from Microgravity Combustion Data"*.

## What it does

- **Summarize** — evidence-linked insights in plain language, each naming the
  experiments it rests on.
- **Rank** — transparent 0–100 scores with adjustable weights and a published
  breakdown, never a single opaque number.
- **Interpret** — a what-if risk estimator, a five-phase crew playbook, an
  evidence-coverage map, and a one-click mission safety brief.
- **Ask** — a grounded assistant that answers only from the dataset, cites
  experiment ids, and works offline with no API key.

## Quick start

Requires Node 20+.

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # tsc -b + vite build
npm test           # vitest unit tests
npm run validate:data
```

Playwright smoke tests use the installed Chrome channel, so no browser download
is required:

```bash
npx playwright test --workers=1
```

## 90-second demo

1. Open **Home**, then choose **Mars transit** in the scenario bar. The Flame Orb
   morphs from a sphere to a teardrop, the top insights re-sort, the URL updates.
2. Open **Rankings** (PC2) and read the score breakdown, or **Insights** for the
   severity-grouped evidence list.
3. Run **Simulator → 34% O2 lunar cabin**. Read the risk number, then the
   explained drivers and their score shares.
4. Open **Ask Ignis** and ask *"Is a 34% oxygen cabin riskier on the Moon?"* — the
   answer is cited and labeled **Offline fallback**.
5. Open **Brief** and copy or print the mission safety brief. In print mode the
   shell chrome disappears and the sheet goes light for paper.

## Honesty rules

Ignis never presents an invented number as NASA fact.

- Every experiment carries a confidence badge:
  - **verified** — read from a cited NASA source the team retrieved;
  - **curated** — summarized from a cited source, numbers kept qualitative;
  - **illustrative** — placeholder for a gap, never to be quoted as a result.
- Metrics with no published value show "not published", never a guess.
- Scores, material risks and simulator output are labeled **decision-support
  estimates, not physics simulations**.
- The assistant validates every citation against the dataset; rejected ids are
  counted in `invalidCitationsRemoved` and surfaced in the UI.

## Stack

Vite · React 18 · TypeScript strict · Tailwind CSS v4 · react-router-dom ·
zustand · recharts · framer-motion · lucide-react · fuse.js · zod · cmdk ·
react-markdown · vitest · Playwright.

## Project layout

```
src/
  app/            shell, router, scenario bar, offline SI fallback (PC3)
  contracts/      frozen TypeScript contract (PC1)
  design-system/  flat primitives + Ember Professional theme (PC3)
  features/       one folder per route (PC2 / PC3)
  lib/            data, scoring, insights, materials, coverage, simulator,
                  playbook, brief (PC1)
  store/          zustand store + URL sync (PC1)
data/             experiment records, glossary, materials (PC1)
e2e/              Playwright smoke tests (PC3)
docs/             design and demo notes (PC3)
```

Each route is lazy-loaded. A feature folder that does not exist yet renders the
shell's empty state; it never breaks the build.

## Known limits

- The dataset is small and unevenly weighted toward microgravity. Partial-gravity
  and high-oxygen coverage is thin, and the UI says so.
- Partial-gravity scenarios are extrapolations, not measurements.
- The simulator is arithmetic over qualitative indices, not a fire model.
- Nothing here uses live vehicle telemetry.
- Absence of a risk signal is not evidence of safety.

See `/method` in the app and [`data/SCHEMA.md`](data/SCHEMA.md) for details.

## Design and demo notes

- [`docs/DESIGN.md`](docs/DESIGN.md) — Ember Professional tokens, flat rules,
  accessibility, motion.
- [`docs/DEMO.md`](docs/DEMO.md) — the demo script, expected result at each
  step, and fallbacks if a teammate's page is missing.

## Team

Three parallel agents, disjoint file ownership, separate branches:
`pc1-core` (data + intelligence), `pc2-explore` (data views),
`pc3-experience` (design system, shell, assistant, SI tools, polish).
