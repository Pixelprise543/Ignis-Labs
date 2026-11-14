import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GravityRegime } from '@/contracts/types'
import { getExperiments, getTimeline, useIgnis } from '../explore/_stubs'
import { EmptyPanel, PageHeading, UiButton } from '../explore/_ui'

function regimeForGravity(gravityG: number): GravityRegime {
  if (gravityG <= 0.05) return 'microgravity'
  if (gravityG < 0.8) return 'partial-g'
  return 'normal-g'
}

const REGIME_LABEL: Record<GravityRegime, string> = {
  microgravity: 'microgravity',
  'partial-g': 'partial gravity',
  'normal-g': 'normal gravity',
}

/**
 * Decades of records, derived from experiment years. Filters are local to this
 * view on purpose: the shared filter object belongs to Explore.
 */
export function TimelinePage() {
  const scenario = useIgnis((state) => state.scenario)
  const select = useIgnis((state) => state.select)

  const events = useMemo(() => getTimeline(), [])
  const experiments = useMemo(() => getExperiments(), [])
  const experimentById = useMemo(
    () => new Map(experiments.map((experiment) => [experiment.id, experiment])),
    [experiments],
  )

  const [query, setQuery] = useState('')
  const [milestonesOnly, setMilestonesOnly] = useState(false)
  const [scenarioOnly, setScenarioOnly] = useState(false)

  const targetRegime = regimeForGravity(scenario.gravityG)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return events
      .filter((event) => {
        if (milestonesOnly && !event.milestone) return false
        if (scenarioOnly) {
          const relevant = event.experimentIds.some(
            (id) => experimentById.get(id)?.regime === targetRegime,
          )
          if (!relevant) return false
        }
        if (!needle) return true
        return `${event.title} ${event.summary}`.toLowerCase().includes(needle)
      })
      .sort((a, b) => a.year - b.year)
  }, [events, experimentById, milestonesOnly, query, scenarioOnly, targetRegime])

  const groups = useMemo(() => {
    const byDecade = new Map<number, typeof visible>()
    visible.forEach((event) => {
      const decade = Math.floor(event.year / 10) * 10
      const bucket = byDecade.get(decade) ?? []
      bucket.push(event)
      byDecade.set(decade, bucket)
    })
    return Array.from(byDecade.entries()).sort(([a], [b]) => a - b)
  }, [visible])

  const filtered = query.trim() !== '' || milestonesOnly || scenarioOnly

  const reset = () => {
    setQuery('')
    setMilestonesOnly(false)
    setScenarioOnly(false)
  }

  return (
    <div className="space-y-4">
      <PageHeading
        title="Timeline"
        description={`Experiment years in the evidence set, oldest first. Turn on the scenario filter to see only work in the ${REGIME_LABEL[targetRegime]} regime relevant to ${scenario.label}.`}
        actions={
          filtered ? (
            <UiButton variant="ghost" onClick={reset}>
              Clear filters
            </UiButton>
          ) : null
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-3">
        <label className="min-w-[220px] flex-1">
          <span className="mb-1 block text-xs text-[var(--ig-muted)]">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title or summary"
            className="w-full rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2.5 py-1.5 text-sm text-[var(--ig-frost)] placeholder:text-[var(--ig-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          />
        </label>

        <label className="inline-flex min-h-9 items-center gap-2 text-xs text-[var(--ig-frost)]">
          <input
            type="checkbox"
            checked={milestonesOnly}
            onChange={(event) => setMilestonesOnly(event.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--ig-flame-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          />
          Milestones only
        </label>

        <label className="inline-flex min-h-9 items-center gap-2 text-xs text-[var(--ig-frost)]">
          <input
            type="checkbox"
            checked={scenarioOnly}
            onChange={(event) => setScenarioOnly(event.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--ig-flame-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          />
          Relevant to {scenario.label}
        </label>

        <p className="text-xs text-[var(--ig-muted)]" role="status">
          {visible.length} of {events.length} entries
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyPanel
          title="No timeline entries match"
          message="Clear the search or filters to see the full timeline."
          action={
            <UiButton variant="secondary" onClick={reset}>
              Clear filters
            </UiButton>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([decade, entries]) => (
            <section key={decade} aria-labelledby={`decade-${decade}`}>
              <h2
                id={`decade-${decade}`}
                className="text-xs font-medium text-[var(--ig-muted)]"
              >
                <span className="font-mono tabular-nums">{decade}s</span>
                <span className="ml-2 text-[var(--ig-muted)]">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>

              <ol className="mt-2 space-y-2 border-l border-[var(--ig-line)] pl-4">
                {entries.map((event) => (
                  <li key={`${event.year}-${event.title}`} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full border border-[var(--ig-line)] bg-[var(--ig-flame-blue)]"
                    />
                    <article className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-sm tabular-nums text-[var(--ig-frost)]">
                          {event.year}
                        </span>
                        <h3 className="text-sm font-semibold text-[var(--ig-frost)]">{event.title}</h3>
                        {event.milestone ? (
                          <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] px-1.5 py-0.5 text-[11px] text-[var(--ig-frost)]">
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-[var(--ig-flame-blue)]"
                            />
                            Milestone
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--ig-muted)]">
                        {event.summary}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {event.experimentIds.map((id) => {
                          const experiment = experimentById.get(id)
                          return (
                            <li key={id}>
                              <Link
                                to="/explore"
                                onClick={() => select(id)}
                                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 py-1 font-mono text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                              >
                                {experiment?.acronym ?? id}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
