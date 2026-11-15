import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Experiment, SIResponse } from '@/contracts/types'
import { ConditionsRadar, FlameSpeedChart, OxygenLimitChart } from '@/components/charts'
import { getExperiment } from '@/lib/data'
import { askSI } from '@/lib/si'
import { useIgnis } from '@/store/useIgnis'
import {
  Button,
  Card,
  CardContent,
  ConfidenceBadge,
  EmptyState,
  Panel,
  Skeleton,
  Tooltip,
} from '@/design-system'
import { PageHeading, Note, RegimeBadge } from '../explore/_shared'

type SIState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; response: SIResponse }
  | { status: 'error'; message: string }

function formatValue(value: number | null, unit = ''): string {
  if (value === null) return 'ΓÇö'
  return `${value}${unit ? ` ${unit}` : ''}`
}

/**
 * 2-4 experiments side by side. The selection lives in the store, so Explore,
 * Rankings and Compare stay in sync; the page only renders what is selected.
 */
export function ComparePage() {
  const compareIds = useIgnis((state) => state.compareIds)
  const clearCompare = useIgnis((state) => state.clearCompare)
  const toggleCompare = useIgnis((state) => state.toggleCompare)
  const scenario = useIgnis((state) => state.scenario)

  const selected = useMemo(
    () =>
      compareIds
        .map((id) => getExperiment(id))
        .filter((experiment): experiment is Experiment => Boolean(experiment)),
    [compareIds],
  )

  const [siState, setSiState] = useState<SIState>({ status: 'idle' })
  const [regenerateCount, setRegenerateCount] = useState(0)

  useEffect(() => {
    if (selected.length < 2) {
      setSiState({ status: 'idle' })
      return
    }
    let cancelled = false
    setSiState({ status: 'loading' })
    askSI({
      mode: 'compare',
      experimentIds: selected.map((experiment) => experiment.id),
      scenario,
    })
      .then((response) => {
        if (!cancelled) setSiState({ status: 'ready', response })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setSiState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'The assistant could not produce a comparison.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [selected, scenario, regenerateCount])

  // Union of metric labels in first-seen order so every row lines up.
  const metricRows = useMemo(() => {
    const rows: Array<{ key: string; label: string; unit: string }> = []
    selected.forEach((experiment) => {
      experiment.metrics.forEach((metric) => {
        if (!rows.some((row) => row.key === metric.key)) {
          rows.push({ key: metric.key, label: metric.label, unit: metric.unit })
        }
      })
    })
    return rows
  }, [selected])

  if (selected.length < 2) {
    return (
      <div className="space-y-6">
        <PageHeading
          title="Compare experiments"
          description={`Place two to four experiments side by side for ${scenario.label} and read an evidence-linked comparison.`}
        />
        <EmptyState
          title={
            selected.length === 0
              ? 'No experiments selected'
              : 'Add one more experiment to compare'
          }
          message={
            selected.length === 0
              ? 'Open Explore, add two to four experiments to the compare tray, then return here.'
              : `You have ${selected[0].acronym} selected. Comparisons need at least two records.`
          }
          action={
            <Link
              to="/explore"
              className="inline-flex min-h-10 items-center gap-2 rounded-control border border-transparent bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
            >
              Browse experiments
            </Link>
          }
        />
      </div>
    )
  }

  const citations =
    siState.status === 'ready'
      ? siState.response.citations
          .map((id) => getExperiment(id))
          .filter((experiment): experiment is Experiment => Boolean(experiment))
      : []

  /**
   * Below 640px, four experiment columns cannot fit without a horizontal
   * scrollbar. The same fields render as one stacked block per experiment
   * instead of shrinking the table until the numbers wrap.
   */
  const conditionFields: Array<{ label: string; value: (experiment: Experiment) => ReactNode }> = [
    { label: 'Gravity regime', value: (experiment) => <RegimeBadge regime={experiment.regime} /> },
    {
      label: 'Gravity',
      value: (experiment) => <span className="ig-num">{formatValue(experiment.conditions.gravityG, 'g')}</span>,
    },
    {
      label: 'Oxygen',
      value: (experiment) => <span className="ig-num">{formatValue(experiment.conditions.o2Percent, '%')}</span>,
    },
    { label: 'Diluent', value: (experiment) => experiment.conditions.diluent },
    {
      label: 'Pressure',
      value: (experiment) => (
        <span className="ig-num">{formatValue(experiment.conditions.pressureKPa, 'kPa')}</span>
      ),
    },
    {
      label: 'Flow',
      value: (experiment) => (
        <span className="ig-num">{formatValue(experiment.conditions.flowCmPerS, 'cm/s')}</span>
      ),
    },
    {
      label: 'Fuel',
      value: (experiment) => (
        <>
          {experiment.fuel}
          <span className="block text-[11px] text-ig-muted">{experiment.fuelType}</span>
        </>
      ),
    },
    { label: 'Facility', value: (experiment) => experiment.facility },
    {
      label: 'Years',
      value: (experiment) => (
        <span className="ig-num">
          {experiment.years[0]}ΓÇô{experiment.years[1] ?? 'now'}
        </span>
      ),
    },
    { label: 'Confidence', value: (experiment) => <ConfidenceBadge confidence={experiment.confidence} /> },
  ]

  return (
    <div className="space-y-8">
      <PageHeading
        title="Compare experiments"
        description={`${selected.length} experiments side by side for ${scenario.label}. Charts, conditions and the SI comparison use only the records selected here.`}
        actions={
          <>
            {selected.length < 4 ? (
              <Tooltip label="Adds another experiment from the library to this side-by-side comparison.">
                <Link
                  to="/explore"
                  className="inline-flex min-h-10 items-center gap-2 rounded-control border border-ig-glass-control-rim bg-ig-glass-control px-4 text-sm font-medium text-ig-frost hover:bg-ig-glass-hover"
                >
                  Add experiment
                </Link>
              </Tooltip>
            ) : null}
            <Tooltip label="Removes all experiments from compare.">
              <Button variant="outline" onClick={clearCompare} size="sm">
                Clear all
              </Button>
            </Tooltip>
          </>
        }
      />

      <section aria-label="Selected experiments" className="flex flex-wrap gap-2">
        {selected.map((experiment) => (
          <Tooltip key={experiment.id} label={`Removes ${experiment.name} from compare.`}>
            <Card
              key={experiment.id}
              bordered
              padding="none"
              className="flex items-center gap-2 rounded-control px-3 py-2 text-sm cursor-default"
            >
              <CardContent>
                <span className="font-mono text-xs text-ig-muted">{experiment.acronym}</span>
                <span className="max-w-[180px] truncate text-xs text-ig-frost">{experiment.name}</span>
                <button
                  type="button"
                  onClick={() => toggleCompare(experiment.id)}
                  aria-label={`Remove ${experiment.name} from compare`}
                  className="ml-auto rounded-control p-1 text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-flame-blue"
                >
                  ├ù
                </button>
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </section>

      <Note>
        Comparisons and chart values are decision-support estimates drawn from recorded experiments,
        not physics simulations. Where a record has no measurement, the table shows an em dash
        instead of a guess.
      </Note>

      <Panel
        title="Conditions"
        description={`Reported conditions for the ${selected.length} selected experiments`}
      >
        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Reported conditions for the {selected.length} selected experiments
            </caption>
            <thead>
              <tr className="border-b border-ig-line">
                <th scope="col" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Field
                </th>
                {selected.map((experiment) => (
                  <th
                    key={experiment.id}
                    scope="col"
                    className="px-2 py-3 sm:px-4 align-top font-medium text-ig-frost"
                  >
                    <span className="block font-mono text-[10px] text-ig-muted uppercase tracking-wider">
                      {experiment.acronym}
                    </span>
                    <span className="block text-xs">{experiment.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Gravity regime
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4">
                    <RegimeBadge regime={experiment.regime} />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Gravity
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost">
                    {formatValue(experiment.conditions.gravityG, 'g')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Oxygen
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost">
                    {formatValue(experiment.conditions.o2Percent, '%')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Diluent
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 text-xs text-ig-frost">
                    {experiment.conditions.diluent}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Pressure
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost">
                    {formatValue(experiment.conditions.pressureKPa, 'kPa')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Flow
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost">
                    {formatValue(experiment.conditions.flowCmPerS, 'cm/s')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Fuel
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 text-xs text-ig-frost">
                    <span className="block">{experiment.fuel}</span>
                    <span className="block mt-0.5 text-[10px] text-ig-muted">{experiment.fuelType}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Facility
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 text-xs text-ig-frost">
                    {experiment.facility}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ig-line">
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Years
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost">
                    {experiment.years[0]}ΓÇô{experiment.years[1] ?? 'now'}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                  Confidence
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-2 py-3 sm:px-4">
                    <ConfidenceBadge confidence={experiment.confidence} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3 sm:hidden">
          {selected.map((experiment) => (
            <section
              key={experiment.id}
              aria-label={experiment.name}
              className="rounded-control border border-ig-line bg-ig-vacuum p-3"
            >
              <p className="font-mono text-[11px] text-ig-muted">{experiment.acronym}</p>
              <h3 className="text-sm font-semibold text-ig-frost">{experiment.name}</h3>
              <dl className="mt-2 divide-y divide-ig-line border-t border-ig-line text-xs">
                {conditionFields.map((field) => (
                  <div key={field.label} className="flex items-start justify-between gap-4 py-1.5">
                    <dt className="text-ig-muted">{field.label}</dt>
                    <dd className="text-right text-ig-frost">{field.value(experiment)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Panel>

      <Panel
        title="Reported metrics"
        description="Numeric metrics reported across the selected experiments"
      >
        {metricRows.length === 0 ? (
          <p className="mt-4 text-xs text-ig-muted text-center">
            None of the selected experiments reports a numeric metric.
          </p>
        ) : (
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Reported metrics for the selected experiments</caption>
              <thead>
                <tr className="border-b border-ig-line">
                  <th scope="col" className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">
                    Metric
                  </th>
                  {selected.map((experiment) => (
                    <th
                      key={experiment.id}
                      scope="col"
                      className="px-2 py-3 sm:px-4 font-mono text-[10px] font-medium text-ig-muted uppercase tracking-wider"
                    >
                      {experiment.acronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricRows.map((row) => (
                  <tr key={row.key} className="border-b border-ig-line last:border-0">
                    <th scope="row" className="py-3 pr-4 text-xs font-medium text-ig-frost">
                      {row.label}
                      <span className="ml-1 font-mono text-[10px] font-normal text-ig-muted">
                        {row.unit}
                      </span>
                    </th>
                    {selected.map((experiment) => {
                      const metric = experiment.metrics.find((entry) => entry.key === row.key)
                      return (
                        <td
                          key={experiment.id}
                          className="px-2 py-3 sm:px-4 font-mono text-xs tabular-nums text-ig-frost"
                        >
                          {metric && typeof metric.value === 'number' ? metric.value : 'ΓÇö'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {metricRows.length === 0 ? null : (
          <div className="mt-4 space-y-3 sm:hidden">
            {selected.map((experiment) => (
              <section
                key={experiment.id}
                aria-label={experiment.name}
                className="rounded-control border border-ig-line bg-ig-vacuum p-3"
              >
                <p className="font-mono text-[11px] text-ig-muted">{experiment.acronym}</p>
                <h3 className="text-sm font-semibold text-ig-frost">{experiment.name}</h3>
                <dl className="mt-2 divide-y divide-ig-line border-t border-ig-line text-xs">
                  {metricRows.map((row) => {
                    const metric = experiment.metrics.find((entry) => entry.key === row.key)
                    return (
                      <div key={row.key} className="flex items-start justify-between gap-4 py-1.5">
                        <dt className="text-ig-muted">
                          {row.label}
                          <span className="ml-1 font-mono text-[11px]">{row.unit}</span>
                        </dt>
                        <dd className="ig-num text-right text-ig-frost">
                          {metric && typeof metric.value === 'number' ? metric.value : 'ΓÇö'}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </section>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <FlameSpeedChart experiments={selected} />
        <OxygenLimitChart experiments={selected} />
      </div>
      <ConditionsRadar experiments={selected} />

      <Panel
        title="SI comparison"
        description="AI-generated comparison of the selected experiments"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-ig-muted">
            {siState.status === 'ready' ? (
              <>
                <span className="rounded-control border border-ig-glass-field-rim bg-ig-glass-field px-2 py-0.5 font-mono">
                  {siState.response.model}
                </span>
                {siState.response.fallback ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-control border border-ig-glass-control-rim bg-ig-glass-control px-2 py-0.5"
                    title="Generated offline from the local dataset. No language-model call was made."
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ig-amber" />
                    Offline fallback
                  </span>
                ) : null}
                <span className="font-mono tabular-nums">
                  Grounding {Math.round(siState.response.groundingScore * 100)}%
                </span>
              </>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRegenerateCount((count) => count + 1)}
              disabled={siState.status === 'loading'}
            >
              Regenerate
            </Button>
          </div>
        </div>

        <div className="mt-4" aria-live="polite">
          {siState.status === 'loading' ? (
            <div className="space-y-3" role="status">
              <span className="sr-only">Generating the comparison</span>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : siState.status === 'error' ? (
            <Card bordered padding="md" className="ig-glass-tint [--tint:var(--ig-amber)]">
              <CardContent>
                <p className="text-xs text-ig-frost">
                  The comparison could not be generated: {siState.message}
                </p>
                <p className="mt-1 text-xs text-ig-muted">
                  Try Regenerate. If it keeps failing, read the conditions table above ΓÇö it uses the
                  same records.
                </p>
              </CardContent>
            </Card>
          ) : siState.status === 'ready' ? (
            <>
              <div className="overflow-x-auto text-sm leading-relaxed text-ig-muted [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-ig-frost [&_li]:mt-1 [&_li]:border-l [&_li]:border-ig-line [&_li]:pl-3 [&_strong]:text-ig-frost [&_ul]:mt-2 [&_ul]:space-y-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-ig-frost">{children}</h3>
                    ),
                    p: ({ children }) => <p className="mt-3 text-sm">{children}</p>,
                  }}
                >
                  {siState.response.answerMarkdown}
                </ReactMarkdown>
              </div>

              <div className="mt-6">
                <h3 className="text-[10px] font-medium text-ig-frost uppercase tracking-wider">
                  Cited experiments
                </h3>
                {citations.length === 0 ? (
                  <p className="mt-2 text-xs text-ig-muted">
                    The answer cites no experiment from this comparison.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {citations.map((experiment) => (
                      <li key={experiment.id}>
                        <Link
                          to="/explore"
                          onClick={() => {
                            // No-op: link navigation handled by router
                          }}
                          className="inline-flex items-center gap-1.5 rounded-control border border-ig-glass-control-rim bg-ig-glass-control px-2.5 py-1 text-xs text-ig-frost hover:bg-ig-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-flame-blue"
                        >
                          <span aria-hidden="true" className="font-mono text-[10px] text-ig-flame-blue">
                            #
                          </span>
                          {experiment.acronym}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {siState.response.invalidCitationsRemoved > 0 ? (
                  <p className="mt-3 text-xs text-ig-muted">
                    {siState.response.invalidCitationsRemoved} citation
                    {siState.response.invalidCitationsRemoved === 1 ? ' was' : 's were'} removed
                    because they did not match the dataset.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-4 text-xs text-ig-muted text-center">
              Select at least two experiments to generate a comparison.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Evidence behind each record"
        description="Source findings and references for every selected experiment"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {selected.map((experiment) => (
            <Card key={experiment.id} bordered padding="md">
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-ig-frost">{experiment.name}</h3>
                    <span className="font-mono text-[10px] text-ig-muted">{experiment.acronym}</span>
                    <ConfidenceBadge confidence={experiment.confidence} />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ig-muted">
                  {experiment.summary}
                </p>
                <div className="mt-4 rounded-control border border-ig-glass-field-rim bg-ig-glass-field px-3 py-3">
                  <p className="text-[10px] font-medium text-ig-frost uppercase tracking-wider">
                    Safety takeaway
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ig-frost">
                    {experiment.safetyTakeaway}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-xs leading-relaxed text-ig-muted">
                  {experiment.findings.map((finding) => (
                    <li key={finding.id} className="border-l-2 border-ig-line pl-3">
                      {finding.text}
                      <span className="ml-2 font-mono text-[10px] text-ig-muted">
                        [{finding.id}]
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 space-y-1 text-[10px] text-ig-muted">
                  {experiment.sources.map((source) => (
                    <li key={`${source.title}-${source.org}`}>
                      {source.title} ┬╖ {source.org}
                      {source.year ? ` ┬╖ ${source.year}` : ''}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  )
}
