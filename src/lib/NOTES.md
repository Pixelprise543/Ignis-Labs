# PC1 core notes - decisions and next steps

Short recovery log for the data + intelligence layer. Newest decision first.
Read `AGENTS.md` at the repo root for the frozen contract and ownership rules.

## Decisions

- **graphify-out/ is never committed.** graphify's appended AGENTS.md block says to
  commit `graphify-out/graph.json`. That contradicts protocol G3 and the frozen
  `.gitignore`. The contract wins; the graph stays local and gitignored. Reported on
  every STATUS / REPORT FOR OPERATOR.
- **Scenarios are presets, not measurements.** `assumption: true` marks a notional
  habitat design point (lunar, Mars, custom). The UI must badge those. Only ISS cabin
  and the EMU suit pressure are operational values.
- **Every Experiment carries a confidence tier.** `verified` = a number I read in a
  cited NASA source; `curated` = summarised from a cited source, numbers kept
  qualitative (`value: null`) unless stated; `illustrative` = invented placeholder for
  a gap we want visible. Never mix: a single invented number demotes the experiment to
  `illustrative`.
- **Metrics with no confidently-known number use `value: null` plus a `note`.** Charts
  and tables must render "no data" rather than a guess. This is deliberate: the
  coverage map exists to show where the evidence is thin.
- **Scoring is transparent arithmetic, not a black box.** Every weight and every
  sub-score is published on `/method`; `rationale` is generated from the same numbers
  the UI shows, so the text can never diverge from the bar.
- **SI never throws.** `askSI` resolves to a precomputed offline answer with
  `fallback: true` when there is no key, no network, or a rejected response. Citation
  ids are checked against the dataset and invalid ones are counted in
  `invalidCitationsRemoved`.

## Next steps

- Phase 1A: `src/lib/scenarios.ts` (done)
- Phase 1B: `data/experiments.ts` - 20+ experiments, real sources
- Phase 1C: `src/lib/data.ts` accessors
- Phase 1D: `src/store/useIgnis.ts`
- Phase 1E: `src/lib/scoring.ts`, `src/lib/search.ts`
- Phase 1F: `src/lib/si.ts` + `data/si-fallback.ts`
- Phase 1G: insights, materials, coverage, simulator, playbook, brief
- Phase 1H: `scripts/validate-data.ts` real gate, `tests/*`

## Traps

- PowerShell 5.1 turns `git` stderr into red error text. A push that says
  `Cloning into...` or `Everything up-to-date` is not a failure.
- `python3` does not exist on this machine; use `python`.
- `npm create vite` resolves a relative path against the current working directory, not
  against the folder you named.
