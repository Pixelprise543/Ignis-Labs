import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Facility, FuelType, GravityRegime } from '@/contracts/types'
import {
  getExperiment,
  getExperiments,
  searchExperiments,
  useIgnis,
} from './_stubs'
import {
  ConfidenceBadge,
  EmptyPanel,
  PageHeading,
  RegimeBadge,
  UiButton,
} from './_ui'

const FUEL_TYPES: FuelType[] = ['solid', 'gas', 'liquid', 'droplet', 'dust', 'cool-flame']
const FACILITIES: Facility[] = [
  'ISS-CIR',
  'ISS-MSG',
  'ISS-other',
  'Free-flyer',
  'Drop-tower',
  'Parabolic-flight',
  'Sounding-rocket',
  'Ground',
]
const REGIMES: Array<{ id: GravityRegime; label: string }> = [
  { id: 'microgravity', label: 'Microgravity' },
  { id: 'partial-g', label: 'Partial-g' },
  { id: 'normal-g', label: 'Normal-g' },
]

export function ExplorePage() {
  const experiments = useMemo(() => getExperiments(), [])
  const filters = useIgnis((state) => state.filters)
  const setFilters = useIgnis((state) => state.setFilters)
  const resetFilters = useIgnis((state) => state.resetFilters)
  const compareIds = useIgnis((state) => state.compareIds)
  const toggleCompare = useIgnis((state) => state.toggleCompare)
  const selectedId = useIgnis((state) => state.selectedId)
  const select = useIgnis((state) => state.select)
  const scenario = useIgnis((state) => state.scenario)

  const closeRef = useRef<HTMLButtonElement>(null)

  const visible = useMemo(() => {
    let list = searchExperiments(filters.query, experiments)
    if (filters.regimes.length > 0) {
      list = list.filter((experiment) => filters.regimes.includes(experiment.regime))
    }
    if (filters.fuelTypes.length > 0) {
      list = list.filter((experiment) => filters.fuelTypes.includes(experiment.fuelType))
    }
    if (filters.facilities.length > 0) {
      list = list.filter((experiment) => filters.facilities.includes(experiment.facility))
    }
    list = list.filter((experiment) => {
      const o2 = experiment.conditions.o2Percent
      if (o2 !== null && (o2 < filters.o2Range[0] || o2 > filters.o2Range[1])) return false
      const endYear = experiment.years[1] ?? experiment.years[0]
      return endYear >= filters.yearRange[0] && endYear <= filters.yearRange[1]
    })
    return list
  }, [experiments, filters])

  const selected = selectedId ? getExperiment(selectedId) : undefined
  const compareFull = compareIds.length >= 4

  useEffect(() => {
    if (!selectedId) return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, select])

  const hasFilters =
    filters.query.trim() !== '' ||
    filters.regimes.length > 0 ||
    filters.fuelTypes.length > 0 ||
    filters.facilities.length > 0

  return (
    <div className="space-y-4">
      <PageHeading
        title="Explore experiments"
        description={`Browse the combustion evidence set for ${scenario.label}. Search, filter, open a record, and add up to four experiments to compare.`}
        actions={
          compareIds.length >= 2 ? (
            <Link
              to="/compare"
              className="inline-flex min-h-9 items-center rounded-[4px] border border-[var(--ig-line)] px-3 text-sm text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
            >
              Compare {compareIds.length} experiments
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap items-end gap-2 rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-3">
        <label className="min-w-[220px] flex-1">
          <span className="mb-1 block text-xs text-[var(--ig-muted)]">Search</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setFilters({ query: event.target.value })}
            placeholder="Name, acronym, fuel or tag"
            className="w-full rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2.5 py-1.5 text-sm text-[var(--ig-frost)] placeholder:text-[var(--ig-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          />
        </label>

        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="mb-1 block w-full text-xs text-[var(--ig-muted)]">Gravity regime</legend>
          {REGIMES.map((regime) => {
            const active = filters.regimes.includes(regime.id)
            return (
              <button
                key={regime.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilters({
                    regimes: active
                      ? filters.regimes.filter((entry) => entry !== regime.id)
                      : [...filters.regimes, regime.id],
                  })
                }
                className={`rounded-[4px] border px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)] ${
                  active
                    ? 'border-[var(--ig-flame-blue)] bg-[var(--ig-raised)] text-[var(--ig-frost)]'
                    : 'border-[var(--ig-line)] text-[var(--ig-muted)] hover:bg-[var(--ig-raised)]'
                }`}
              >
                {regime.label}
              </button>
            )
          })}
        </fieldset>

        <label>
          <span className="mb-1 block text-xs text-[var(--ig-muted)]">Fuel</span>
          <select
            value={filters.fuelTypes[0] ?? ''}
            onChange={(event) =>
              setFilters({ fuelTypes: event.target.value ? [event.target.value as FuelType] : [] })
            }
            className="min-h-9 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 text-sm text-[var(--ig-frost)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          >
            <option value="">All fuels</option>
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-[var(--ig-muted)]">Facility</span>
          <select
            value={filters.facilities[0] ?? ''}
            onChange={(event) =>
              setFilters({
                facilities: event.target.value ? [event.target.value as Facility] : [],
              })
            }
            className="min-h-9 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 text-sm text-[var(--ig-frost)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          >
            <option value="">All facilities</option>
            {FACILITIES.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
        </label>

        {hasFilters ? (
          <UiButton variant="ghost" onClick={resetFilters}>
            Clear filters
          </UiButton>
        ) : null}
      </div>

      <p className="text-xs text-[var(--ig-muted)]" role="status">
        {visible.length} of {experiments.length} experiments
        {compareIds.length > 0 ? ` · ${compareIds.length} in compare` : ''}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {visible.length === 0 ? (
            <EmptyPanel
              title="No experiments match those filters"
              message="Clear the search or filters to see the full library again."
              action={
                <UiButton variant="secondary" onClick={resetFilters}>
                  Clear filters
                </UiButton>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)]">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Experiment library with filters applied</caption>
                <thead>
                  <tr className="border-b border-[var(--ig-line)] text-xs text-[var(--ig-muted)]">
                    <th scope="col" className="px-3 py-2 font-medium">Experiment</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">Regime</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Facility</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Fuel</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Years</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">O₂ %</th>
                    <th scope="col" className="px-3 py-2 font-medium">Confidence</th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((experiment) => {
                    const inCompare = compareIds.includes(experiment.id)
                    const isSelected = selectedId === experiment.id
                    return (
                      <tr
                        key={experiment.id}
                        className={`border-b border-[var(--ig-line)] last:border-0 ${
                          isSelected ? 'bg-[var(--ig-raised)]' : 'hover:bg-[var(--ig-raised)]'
                        }`}
                      >
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => select(isSelected ? null : experiment.id)}
                            aria-expanded={isSelected}
                            className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                          >
                            <span className="block font-medium text-[var(--ig-frost)]">
                              {experiment.name}
                            </span>
                            <span className="font-mono text-xs text-[var(--ig-muted)]">
                              {experiment.acronym}
                            </span>
                          </button>
                        </td>
                        <td className="hidden px-3 py-2 sm:table-cell">
                          <RegimeBadge regime={experiment.regime} />
                        </td>
                        <td className="hidden px-3 py-2 text-xs text-[var(--ig-muted)] md:table-cell">
                          {experiment.facility}
                        </td>
                        <td className="hidden px-3 py-2 text-xs text-[var(--ig-muted)] lg:table-cell">
                          {experiment.fuelType}
                        </td>
                        <td className="hidden px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-muted)] lg:table-cell">
                          {experiment.years[0]}–{experiment.years[1] ?? 'now'}
                        </td>
                        <td className="hidden px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)] sm:table-cell">
                          {experiment.conditions.o2Percent ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          <ConfidenceBadge confidence={experiment.confidence} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            aria-pressed={inCompare}
                            disabled={!inCompare && compareFull}
                            title={!inCompare && compareFull ? 'Compare holds four experiments. Remove one first.' : undefined}
                            onClick={() => toggleCompare(experiment.id)}
                            className={`rounded-[4px] border px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)] disabled:cursor-not-allowed disabled:opacity-50 ${
                              inCompare
                                ? 'border-[var(--ig-flame-blue)] bg-[var(--ig-raised)] text-[var(--ig-frost)]'
                                : 'border-[var(--ig-line)] text-[var(--ig-muted)] hover:bg-[var(--ig-raised)]'
                            }`}
                          >
                            {inCompare ? 'In compare' : 'Add to compare'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected ? (
          <aside
            aria-labelledby="experiment-detail-title"
            className="h-fit rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4 lg:sticky lg:top-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[var(--ig-muted)]">{selected.acronym}</p>
                <h2 id="experiment-detail-title" className="text-base font-semibold text-[var(--ig-frost)]">
                  {selected.name}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => select(null)}
                className="rounded-[4px] border border-[var(--ig-line)] px-2 py-1 text-xs text-[var(--ig-muted)] hover:bg-[var(--ig-raised)] hover:text-[var(--ig-frost)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
              >
                Close
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ConfidenceBadge confidence={selected.confidence} />
              <RegimeBadge regime={selected.regime} />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ig-muted)]">{selected.summary}</p>

            <div className="mt-3 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-3 py-2">
              <p className="text-xs font-medium text-[var(--ig-frost)]">Safety takeaway</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ig-muted)]">
                {selected.safetyTakeaway}
              </p>
            </div>

            <h3 className="mt-4 text-xs font-medium text-[var(--ig-frost)]">Metrics</h3>
            <table className="mt-1 w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-[var(--ig-muted)]">
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 font-medium">Metric</th>
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {selected.metrics.map((metric) => (
                  <tr key={metric.key}>
                    <td className="border-b border-[var(--ig-line)] py-1 pr-2 text-[var(--ig-muted)]">
                      {metric.label}
                    </td>
                    <td className="border-b border-[var(--ig-line)] py-1 text-right font-mono tabular-nums text-[var(--ig-frost)]">
                      {metric.value ?? '—'} {metric.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="mt-4 text-xs font-medium text-[var(--ig-frost)]">Findings</h3>
            <ul className="mt-1 space-y-1 text-xs leading-relaxed text-[var(--ig-muted)]">
              {selected.findings.map((finding) => (
                <li key={finding.id} className="border-l border-[var(--ig-line)] pl-2">
                  {finding.text}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-xs font-medium text-[var(--ig-frost)]">Sources</h3>
            <ul className="mt-1 space-y-1 text-xs text-[var(--ig-muted)]">
              {selected.sources.map((source) => (
                <li key={source.title}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--ig-flame-blue)] underline decoration-[var(--ig-line)] underline-offset-2"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}{' '}
                  <span className="text-[var(--ig-muted)]">
                    · {source.org}
                    {source.year ? ` · ${source.year}` : ''}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <UiButton
                variant={compareIds.includes(selected.id) ? 'primary' : 'secondary'}
                onClick={() => toggleCompare(selected.id)}
                disabled={!compareIds.includes(selected.id) && compareFull}
              >
                {compareIds.includes(selected.id) ? 'Remove from compare' : 'Add to compare'}
              </UiButton>
              {compareIds.length >= 2 ? (
                <Link
                  to="/compare"
                  className="inline-flex min-h-9 items-center rounded-[4px] px-3 text-sm text-[var(--ig-flame-blue)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                >
                  Open compare
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
