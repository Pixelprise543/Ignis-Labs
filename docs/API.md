# Ignis API Reference

Reference for the modules under `src/lib/`. Every module is a pure function over
the static dataset; nothing imports the experiment files directly, nothing
mutates shared state, and every citation that leaves this layer resolves to a
real experiment id (validated at build time by `validate:data`).

## Data access — `src/lib/data.ts`

Single source of truth for experiment, material, glossary and timeline records.

| Function | Returns | Notes |
|---|---|---|
| `getExperiments()` | `Experiment[]` | Copy of every experiment, narrative order |
| `getExperiment(id)` | `Experiment \| undefined` | O(1) lookup by experiment id |
| `getFindings()` | `Finding[]` | Every finding flattened out of its experiment |
| `getFinding(id)` | `{ experiment, finding } \| undefined` | Finding plus its owning experiment |
| `getMaterials()` | `Material[]` | Copy of the material catalogue |
| `getMaterial(id)` | `Material \| undefined` | O(1) lookup by material id |
| `getGlossary()` | `GlossaryTerm[]` | Copy of every glossary term |
| `getGlossaryTerm(id)` | `GlossaryTerm \| undefined` | O(1) lookup by term id |
| `getTimeline()` | `TimelineEvent[]` | One event per start year, derived from records |

The dataset modules under `data/experiments/` are never imported by views — only
through this module. That keeps lookups O(1) and prevents any view from
mutating the shared arrays.

## Scoring — `src/lib/scoring.ts`

Transparent, additive experiment ranking. No single opaque number — every
component is computed from dataset fields so a reader can argue with a score
and see where it came from.

### `rankExperiments(experiments, weights, scenario)`

Returns `RankedExperiment[]` — each entry carries the experiment, four
component scores (0–100), a composite, and a rationale string.

| Component | Weight in composite | What it measures |
|---|---|---|
| `hazardSeverity` | configurable | Gravity/O₂/pressure/fuel match to scenario |
| `exploration` | configurable | Tag points, measured metrics, findings |
| `evidence` | configurable | Confidence tier, source count, finding count |
| `recency` | configurable | Years since last activity (4 pts/year decay) |

### `defaultWeights`

```ts
{ hazardSeverity: 0.4, exploration: 0.25, evidence: 0.2, recency: 0.15 }
```

Weights are normalised at use time, so the UI can expose four independent
sliders. An all-zero vector degrades to equal weights rather than NaN.

### Honesty in scoring

For partial-gravity scenarios (lunar, Mars), every microgravity record is scored
down and the rationale says it is an extrapolation. Scoring it up would be a
lie with a number attached.

## Simulator — `src/lib/simulator.ts`

A transparent what-if risk estimator, **not a physics simulation**.

### `simulateRisk(input): SimResult`

Input: `{ materialId, gravityG, o2Percent, pressureKPa, flowCmPerS }`

Output: `{ risk, level, drivers, nearestExperimentIds, caveats }`

- `risk` — 0–100 composite: material baseline + four named adjustments
- `level` — `info`/`caution`/`high`/`critical` (25/45/70 thresholds)
- `drivers[]` — each driver has `factor`, `direction` (`raises`/`lowers`),
  `weight`, `explanation`, `evidenceIds[]`
- `nearestExperimentIds[]` — up to 3 closest matches by gravity, fuel, O₂,
  pressure, flow distance
- `caveats[]` — always includes "decision-support estimate, not a physics
  simulation"; adds partial-gravity, ventilation-heuristic, high-O₂,
  low-pressure and unknown-material caveats where relevant

### Driver weights

| Driver | Factor | Weight basis |
|---|---|---|
| Material baseline | raises | `material.baseFlammability` (0–100 qualitative index) |
| Gravity | raises | 12 (microgravity), 6 (partial-gravity), null (normal-g) |
| Oxygen | raises/lowers | `(o2Percent − 21) × 1.2`, clamped ±30 |
| Pressure | raises | `(60 − pressureKPa) × 0.2`, clamped 0–10 (below 60 kPa only) |
| Ventilation | raises | `flowCmPerS × 0.4`, clamped 0–12 |

The ventilation term is a heuristic — no experiment in the dataset reports a
measured flow rate, so every simulator run carries that caveat.

## Coverage — `src/lib/coverage.ts`

Gravity × oxygen evidence grid. The grid is deliberately fixed, including empty
cells — the empty cell **is** the finding.

### Bands

| Gravity band | g range | O₂ bands |
|---|---|---|
| `microgravity` | < 0.01 | ≤21%, 21–30%, >30%, not specified |
| `partial-gravity` | 0.01–0.9 | ≤21%, 21–30%, >30%, not specified |
| `normal-gravity` | ≥ 0.9 | ≤21%, 21–30%, >30%, not specified |

### Functions

| Function | Returns | Notes |
|---|---|---|
| `getCoverage()` | `CoverageCell[]` | All 12 cells (3 gravity × 4 O₂), empty cells included |
| `getPartialGravityExperiments()` | `Experiment[]` | Records in the `partial-g` regime |
| `hasPartialGravityData()` | `boolean` | Whether any partial-gravity record exists |
| `maxMeasuredPartialGravityG()` | `number \| null` | Highest measured partial-gravity g, or null |
| `getGaps(scenario)` | `CoverageCell[]` | Empty cells in the scenario's gravity band |

### Coverage fact

Mars gravity (0.38 g) has **no record at all**. Lunar gravity (0.16 g) has two
records: `luci` (measured, 21% O₂) and `fm2` (a plan, 21%/34% O₂). Everything
else in the partial-gravity row is a gap.

## Insights — `src/lib/insights.ts`

Curated rules, not generated prose. Each insight encodes one transferable
lesson from the dataset, states the scenarios it applies to, and cites finding
ids that actually exist. Citations are validated at module load — a missing
finding id throws a build error.

### `getInsights(scenario): Insight[]`

Returns rules that apply to the scenario, most urgent first (by severity, then
stable id order).

| Insight | Applies to | Typical severity |
|---|---|---|
| `ventilation-controls-spread` | All scenarios | high |
| `oxygen-enrichment` | O₂ ≥ 25% | high → critical at ≥50% |
| `suppression-does-not-transfer` | All scenarios | high |
| `extinguished-is-not-out` | All scenarios | high |
| `concealed-fire` | All scenarios | high |
| `screening-does-not-qualify` | All scenarios | caution |
| `smoke-is-the-first-threat` | All scenarios | high |
| `pressure-extinction-limit` | Pressure < 60 kPa | high → critical below 40 kPa |
| `scale-changes-the-fire` | All scenarios | caution |
| `partial-gravity-evidence-thin` | Lunar/Mars/custom | caution → high ≥0.3g |
| `no-partial-gravity-data` | Lunar/Mars/custom (if no data) | high |

## Severity — `src/lib/severity.ts`

| Function | Returns | Notes |
|---|---|---|
| `levelForRisk(risk: number)` | `Severity` | 0–24 info, 25–44 caution, 45–69 high, 70–100 critical |
| `severityRank(severity)` | `number` | info=0, caution=1, high=2, critical=3 |

## Materials — `src/lib/materials.ts`

| Function | Returns | Notes |
|---|---|---|
| `getMaterialRisks(scenario)` | `MaterialRisk[]` | Risk per material for the scenario |
| `getMaterialMatrix()` | `MaterialMatrix` | Material × scenario risk grid |

Each `MaterialRisk` carries `risk` (0–100), `level` (Severity), `rationale` and
`evidenceIds[]`. Material baselines are qualitative indices for planning, not
measured ignition thresholds.

## Playbook — `src/lib/playbook.ts`

| Function | Returns | Notes |
|---|---|---|
| `getPlaybook(scenarioId)` | `Playbook` | Crew response: detect, isolate, suppress, ventilate, recover |

Each step carries `phase`, `action`, `rationale`, `evidenceIds[]`. Every step
links to real experiment finding ids. Caveats are returned separately.

## Brief — `src/lib/brief.ts`

| Function | Returns | Notes |
|---|---|---|
| `buildBriefMarkdown(scenario, weights, compareIds)` | `string` | One-click Mission Safety Brief markdown |

Includes scenario values and assumptions, top risks, ranked experiments,
evidence gaps, crew response, sources and limitations. Print mode strips shell
chrome and goes light for paper.

## SI assistant — `src/lib/si.ts` and `src/lib/siFallback.ts`

| Function | Returns | Notes |
|---|---|---|
| `askSI(request): Promise<SIResponse>` | `SIResponse` | Never throws; offline fallback on failure |

The assistant is grounded **only** in the dataset. Every citation is checked
against real experiment ids before reaching the UI. Invalid citations are
removed and counted in `invalidCitationsRemoved`. `fallback: true` means the
deterministic offline normaliser answered, not a language model.

## Search — `src/lib/search.ts`

| Function | Returns | Notes |
|---|---|---|
| `searchExperiments(query, exps)` | `Experiment[]` | Synonym-expanded fuzzy search over names, acronyms, findings, tags |

## Scenarios — `src/lib/scenarios.ts`

| Export | Notes |
|---|---|
| `SCENARIOS` | ISS cabin, lunar habitat, Mars transit, EVA suit, Custom |
| `getScenario(id)` | Returns a copy; unknown ids fall back to ISS |
| `customScenario(g, o2, kPa)` | Builds a custom scenario (clamped to valid ranges) |
| `regimeFor(gravityG)` | `microgravity` / `partial-g` / `normal-g` |

Lunar, Mars and custom carry `assumption: true` — notional habitat design
points, not measured cabin atmospheres.

## Citations — `src/lib/citations.ts`

Validates every experiment id cited by insights, playbooks, the simulator and
the SI assistant against the dataset. Invalid ids are counted and surfaced in
the UI as `invalidCitationsRemoved`.

## Validation — `npm run validate:data`

Enforces per-record: full contract shape (zod), unique experiment/finding/metric
ids, non-empty sources with URLs, confidence enum, `years[0] <= years[1]`, at
least one metric and one finding. Across the catalogue: every evidence id
resolves, glossary `related` ids resolve, and the coverage grid lists each
experiment once.

Added rules for the 30-record dataset: `value: null` needs a `note` of 12+
characters; `pressureKPa` must be `> 0` when present; `verified`/`curated`
sources must be on `nasa.gov`; finding id must start with `<experiment-id>-f`;
no two records may share a finding sentence; `regime` must match the numeric
`gravityG` band; summary and takeaway must not contain filler markers
(`TODO`, `TBD`, `lorem ipsum`, `placeholder`).

It cannot check whether a sentence is true — that is what the `verified` /
`curated` split is for.
