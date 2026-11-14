import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { ScoreWeights } from '@/contracts/types'
import { getExperiments } from '@/lib/data'
import { rankExperiments } from '@/lib/scoring'
import { useIgnis } from '@/store/useIgnis'
import { Button, EmptyState } from '@/design-system'
import { Note, PageHeading, RegimeBadge, ScoreBar } from '../explore/_shared'

const FACTORS: Array<{ key: keyof ScoreWeights; label: string; help: string }> = [
  { key: 'hazardSeverity', label: 'Hazard severity', help: 'How much fire risk the reported behaviour implies.' },
  { key: 'exploration', label: 'Exploration value', help: 'How much the experiment adds to the knowledge base.' },
  { key: 'evidence', label: 'Evidence strength', help: 'Source count, findings and confidence level.' },
  { key: 'recency', label: 'Recency', help: 'How recent the experiment is.' },
]

export function RankingsPage() {
  const experiments = useMemo(() => getExperiments(), [])
  const weights = useIgnis((state) => state.weights)
  const setWeights = useIgnis((state) => state.setWeights)
  const resetWeights = useIgnis((state) => state.resetWeights)
  const scenario = useIgnis((state) => state.scenario)
  const compareIds = useIgnis((state) => state.compareIds)
  const toggleCompare = useIgnis((state) => state.toggleCompare)
  const select = useIgnis((state) => state.select)

  const ranked = useMemo(
    () => rankExperiments(experiments, weights, scenario),
    [experiments, weights, scenario],
  )

  const compareFull = compareIds.length >= 4

  return (
    <div className="space-y-4">
      <PageHeading
        title="Rankings"
        description={`Experiments ranked for ${scenario.label}. Adjust the weights to see how the order responds.`}
        actions={
          <Button variant="tertiary" onClick={resetWeights}>
            Reset weights
          </Button>
        }
      />

      <Note>
        Scores are decision-support estimates, not physics simulations. Each factor is a transparent
        formula over recorded fields; change the weights to change the composite.
      </Note>

      <section
        aria-labelledby="weights-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <h2 id="weights-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
          Weights
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FACTORS.map((factor) => {
            const inputId = `weight-${factor.key}`
            return (
              <div key={factor.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor={inputId} className="text-xs text-[var(--ig-frost)]">
                    {factor.label}
                  </label>
                  <span className="font-mono text-xs tabular-nums text-[var(--ig-muted)]">
                    {Math.round(weights[factor.key] * 100)}%
                  </span>
                </div>
                <input
                  id={inputId}
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights[factor.key]}
                  onChange={(event) =>
                    setWeights({ ...weights, [factor.key]: Number(event.target.value) })
                  }
                  aria-describedby={`${inputId}-help`}
                  className="mt-2 w-full accent-[var(--ig-flame-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                />
                <p id={`${inputId}-help`} className="mt-1 text-[11px] leading-relaxed text-[var(--ig-muted)]">
                  {factor.help}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {ranked.length === 0 ? (
        <EmptyState
          title="No experiments to rank"
          message="The evidence set is empty. Add experiments before ranking."
        />
      ) : (
        <ol className="space-y-2" aria-label={`Ranked experiments for ${scenario.label}`}>
          {ranked.map((entry, index) => {
            const inCompare = compareIds.includes(entry.experiment.id)
            return (
              <li
                key={entry.experiment.id}
                className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-3"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span className="mt-0.5 w-7 shrink-0 font-mono text-sm tabular-nums text-[var(--ig-muted)]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-[var(--ig-frost)]">
                        {entry.experiment.name}
                      </h2>
                      <span className="font-mono text-xs text-[var(--ig-muted)]">
                        {entry.experiment.acronym}
                      </span>
                      <RegimeBadge regime={entry.experiment.regime} />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--ig-muted)]">
                      {entry.rationale}
                    </p>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <ScoreBar label="Hazard" value={entry.scores.hazardSeverity} />
                      <ScoreBar label="Exploration" value={entry.scores.exploration} />
                      <ScoreBar label="Evidence" value={entry.scores.evidence} />
                      <ScoreBar label="Recency" value={entry.scores.recency} />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-mono text-lg tabular-nums text-[var(--ig-frost)]">
                        {Math.round(entry.composite)}
                      </p>
                      <p className="text-[11px] text-[var(--ig-muted)]">composite</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Link
                        to="/explore"
                        onClick={() => select(entry.experiment.id)}
                        className="inline-flex min-h-8 items-center rounded-[4px] border border-[var(--ig-line)] px-2 text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        aria-pressed={inCompare}
                        disabled={!inCompare && compareFull}
                        onClick={() => toggleCompare(entry.experiment.id)}
                        className={`inline-flex min-h-8 items-center rounded-[4px] border px-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)] disabled:cursor-not-allowed disabled:opacity-50 ${
                          inCompare
                            ? 'border-[var(--ig-flame-blue)] bg-[var(--ig-raised)] text-[var(--ig-frost)]'
                            : 'border-[var(--ig-line)] text-[var(--ig-muted)] hover:bg-[var(--ig-raised)]'
                        }`}
                      >
                        {inCompare ? 'In compare' : 'Add to compare'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
