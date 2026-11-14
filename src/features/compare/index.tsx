import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Experiment, SIResponse } from '@/contracts/types'
import { ConditionsRadar, FlameSpeedChart, OxygenLimitChart } from '@/components/charts'
import { askSI, getExperiment, useIgnis } from '../explore/_stubs'
import {
  ConfidenceBadge,
  EmptyPanel,
  Note,
  PageHeading,
  RegimeBadge,
  SkeletonBlock,
  UiButton,
} from '../explore/_ui'

type SIState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; response: SIResponse }
  | { status: 'error'; message: string }

function formatValue(value: number | null, unit = ''): string {
  if (value === null) return '—'
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
  const select = useIgnis((state) => state.select)
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
      <div className="space-y-4">
        <PageHeading
          title="Compare experiments"
          description={`Place two to four experiments side by side for ${scenario.label} and read an evidence-linked comparison.`}
        />
        <EmptyPanel
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
              className="inline-flex min-h-9 items-center rounded-[4px] border border-transparent bg-[var(--ig-flame-blue)] px-3 text-sm font-medium text-[var(--ig-vacuum)] hover:bg-[var(--ig-amber)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
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

  return (
    <div className="space-y-4">
      <PageHeading
        title="Compare experiments"
        description={`${selected.length} experiments side by side for ${scenario.label}. Charts, conditions and the SI comparison use only the records selected here.`}
        actions={
          <>
            {selected.length < 4 ? (
              <Link
                to="/explore"
                className="inline-flex min-h-9 items-center rounded-[4px] border border-[var(--ig-line)] px-3 text-sm text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
              >
                Add experiment
              </Link>
            ) : null}
            <UiButton variant="ghost" onClick={clearCompare}>
              Clear all
            </UiButton>
          </>
        }
      />

      <section aria-label="Selected experiments" className="flex flex-wrap gap-2">
        {selected.map((experiment) => (
          <span
            key={experiment.id}
            className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-hull)] py-1 pl-2.5 pr-1 text-xs"
          >
            <span className="font-mono text-[var(--ig-muted)]">{experiment.acronym}</span>
            <span className="max-w-[180px] truncate text-[var(--ig-frost)]">{experiment.name}</span>
            <button
              type="button"
              onClick={() => toggleCompare(experiment.id)}
              aria-label={`Remove ${experiment.name} from compare`}
              className="rounded-[4px] px-1.5 py-0.5 text-[var(--ig-muted)] hover:bg-[var(--ig-raised)] hover:text-[var(--ig-frost)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
            >
              Remove
            </button>
          </span>
        ))}
      </section>

      <Note>
        Comparisons and chart values are decision-support estimates drawn from recorded experiments,
        not physics simulations. Where a record has no measurement, the table shows an em dash
        instead of a guess.
      </Note>

      <section
        aria-labelledby="compare-conditions-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <h2 id="compare-conditions-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
          Conditions
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Reported conditions for the {selected.length} selected experiments
            </caption>
            <thead>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="col" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Field
                </th>
                {selected.map((experiment) => (
                  <th
                    key={experiment.id}
                    scope="col"
                    className="px-3 py-2 align-top font-medium text-[var(--ig-frost)]"
                  >
                    <span className="block font-mono text-xs text-[var(--ig-muted)]">
                      {experiment.acronym}
                    </span>
                    <span className="block text-sm">{experiment.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Gravity regime
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-3 py-2">
                    <RegimeBadge regime={experiment.regime} />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Gravity
                </th>
                {selected.map((experiment) => (
                  <td
                    key={experiment.id}
                    className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                  >
                    {formatValue(experiment.conditions.gravityG, 'g')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Oxygen
                </th>
                {selected.map((experiment) => (
                  <td
                    key={experiment.id}
                    className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                  >
                    {formatValue(experiment.conditions.o2Percent, '%')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Diluent
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-3 py-2 text-xs text-[var(--ig-frost)]">
                    {experiment.conditions.diluent}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Pressure
                </th>
                {selected.map((experiment) => (
                  <td
                    key={experiment.id}
                    className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                  >
                    {formatValue(experiment.conditions.pressureKPa, 'kPa')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Flow
                </th>
                {selected.map((experiment) => (
                  <td
                    key={experiment.id}
                    className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                  >
                    {formatValue(experiment.conditions.flowCmPerS, 'cm/s')}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Fuel
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-3 py-2 text-xs text-[var(--ig-frost)]">
                    <span className="block">{experiment.fuel}</span>
                    <span className="text-[var(--ig-muted)]">{experiment.fuelType}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Facility
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-3 py-2 text-xs text-[var(--ig-frost)]">
                    {experiment.facility}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--ig-line)]">
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Years
                </th>
                {selected.map((experiment) => (
                  <td
                    key={experiment.id}
                    className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                  >
                    {experiment.years[0]}–{experiment.years[1] ?? 'now'}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Confidence
                </th>
                {selected.map((experiment) => (
                  <td key={experiment.id} className="px-3 py-2">
                    <ConfidenceBadge confidence={experiment.confidence} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="compare-metrics-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <h2 id="compare-metrics-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
          Reported metrics
        </h2>
        {metricRows.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--ig-muted)]">
            None of the selected experiments reports a numeric metric.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Reported metrics for the selected experiments</caption>
              <thead>
                <tr className="border-b border-[var(--ig-line)]">
                  <th scope="col" className="py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                    Metric
                  </th>
                  {selected.map((experiment) => (
                    <th
                      key={experiment.id}
                      scope="col"
                      className="px-3 py-2 font-mono text-xs font-medium text-[var(--ig-muted)]"
                    >
                      {experiment.acronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricRows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--ig-line)] last:border-0">
                    <th scope="row" className="py-2 pr-3 text-xs font-medium text-[var(--ig-frost)]">
                      {row.label}
                      <span className="ml-1 font-mono font-normal text-[var(--ig-muted)]">
                        {row.unit}
                      </span>
                    </th>
                    {selected.map((experiment) => {
                      const metric = experiment.metrics.find((entry) => entry.key === row.key)
                      return (
                        <td
                          key={experiment.id}
                          className="px-3 py-2 font-mono text-xs tabular-nums text-[var(--ig-frost)]"
                        >
                          {metric && typeof metric.value === 'number' ? metric.value : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <FlameSpeedChart experiments={selected} />
        <OxygenLimitChart experiments={selected} />
      </div>
      <ConditionsRadar experiments={selected} />

      <section
        aria-labelledby="compare-si-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="compare-si-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
            SI comparison
          </h2>
          {siState.status === 'ready' ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ig-muted)]">
              <span className="rounded-[4px] border border-[var(--ig-line)] px-1.5 py-0.5 font-mono">
                {siState.response.model}
              </span>
              {siState.response.fallback ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] px-1.5 py-0.5"
                  title="Generated offline from the local dataset. No language-model call was made."
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[var(--ig-amber)]"
                  />
                  Offline fallback
                </span>
              ) : null}
              <span className="font-mono tabular-nums">
                Grounding {Math.round(siState.response.groundingScore * 100)}%
              </span>
              <UiButton variant="ghost" onClick={() => setRegenerateCount((count) => count + 1)}>
                Regenerate
              </UiButton>
            </div>
          ) : (
            <UiButton
              variant="ghost"
              onClick={() => setRegenerateCount((count) => count + 1)}
              disabled={siState.status === 'loading'}
            >
              Regenerate
            </UiButton>
          )}
        </div>

        <div className="mt-3" aria-live="polite">
          {siState.status === 'loading' ? (
            <div className="space-y-2" role="status">
              <span className="sr-only">Generating the comparison</span>
              <SkeletonBlock className="h-3 w-3/4" />
              <SkeletonBlock className="h-3 w-5/6" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          ) : siState.status === 'error' ? (
            <div className="rounded-[4px] border border-[var(--ig-line)] px-3 py-2">
              <p className="text-xs text-[var(--ig-frost)]">
                The comparison could not be generated: {siState.message}
              </p>
              <p className="mt-1 text-xs text-[var(--ig-muted)]">
                Try Regenerate. If it keeps failing, read the conditions table above — it uses the
                same records.
              </p>
            </div>
          ) : siState.status === 'ready' ? (
            <>
              <div className="text-sm leading-relaxed text-[var(--ig-muted)] [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--ig-frost)] [&_li]:mt-1 [&_li]:border-l [&_li]:border-[var(--ig-line)] [&_li]:pl-2 [&_strong]:text-[var(--ig-frost)] [&_ul]:mt-2 [&_ul]:space-y-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-[var(--ig-frost)]">{children}</h3>
                    ),
                    p: ({ children }) => <p className="mt-2 text-sm">{children}</p>,
                  }}
                >
                  {siState.response.answerMarkdown}
                </ReactMarkdown>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-medium text-[var(--ig-frost)]">Cited experiments</h3>
                {citations.length === 0 ? (
                  <p className="mt-1 text-xs text-[var(--ig-muted)]">
                    The answer cites no experiment from this comparison.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {citations.map((experiment) => (
                      <li key={experiment.id}>
                        <Link
                          to="/explore"
                          onClick={() => select(experiment.id)}
                          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 py-1 text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                        >
                          <span aria-hidden="true" className="font-mono text-[var(--ig-flame-blue)]">
                            #
                          </span>
                          {experiment.acronym}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {siState.response.invalidCitationsRemoved > 0 ? (
                  <p className="mt-2 text-xs text-[var(--ig-muted)]">
                    {siState.response.invalidCitationsRemoved} citation
                    {siState.response.invalidCitationsRemoved === 1 ? ' was' : 's were'} removed
                    because they did not match the dataset.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-xs text-[var(--ig-muted)]">
              Select at least two experiments to generate a comparison.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="compare-evidence-heading" className="space-y-3">
        <h2 id="compare-evidence-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
          Evidence behind each record
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {selected.map((experiment) => (
            <article
              key={experiment.id}
              className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--ig-frost)]">{experiment.name}</h3>
                <span className="font-mono text-xs text-[var(--ig-muted)]">
                  {experiment.acronym}
                </span>
                <ConfidenceBadge confidence={experiment.confidence} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ig-muted)]">
                {experiment.summary}
              </p>
              <p className="mt-2 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-3 py-2 text-xs leading-relaxed text-[var(--ig-frost)]">
                <span className="block font-medium">Safety takeaway</span>
                {experiment.safetyTakeaway}
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--ig-muted)]">
                {experiment.findings.map((finding) => (
                  <li key={finding.id} className="border-l border-[var(--ig-line)] pl-2">
                    {finding.text}
                    <span className="ml-1 font-mono text-[10px] text-[var(--ig-muted)]">
                      {finding.id}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="mt-2 space-y-1 text-xs text-[var(--ig-muted)]">
                {experiment.sources.map((source) => (
                  <li key={`${source.title}-${source.org}`}>
                    {source.title} · {source.org}
                    {source.year ? ` · ${source.year}` : ''}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
