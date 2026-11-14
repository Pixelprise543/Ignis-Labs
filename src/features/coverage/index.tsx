import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { CoverageCell } from '@/contracts/types'
import {
  COVERAGE_GRAVITY_BANDS,
  COVERAGE_O2_BANDS,
  O2_NOT_REPORTED_BAND,
  getCoverage,
  getGaps,
} from '@/lib/coverage'
import { SCENARIOS } from '@/lib/scenarios'
import { askSI } from '@/lib/si'
import { useIgnis } from '@/store/useIgnis'
import { Button, Skeleton } from '@/design-system'
import { Note, PageHeading } from '../explore/_shared'

type InterpretState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; markdown: string; fallback: boolean; model: string }
  | { status: 'error'; message: string }

/**
 * Band labels come from the coverage module, so this page cannot invent a band
 * the data layer does not produce. The maps only change casing and symbols for
 * display.
 */
const GRAVITY_LABELS: Record<string, string> = {
  microgravity: 'Microgravity',
  'partial-gravity': 'Partial gravity',
  'normal-gravity': 'Normal gravity',
}

const O2_LABELS: Record<string, string> = {
  '<= 21%': '≤ 21%',
  '21-30%': '21–30%',
  '> 30%': '> 30%',
  'not specified': 'Not specified',
}

function formatGravity(band: string): string {
  return GRAVITY_LABELS[band] ?? band
}

function formatO2(band: string): string {
  return O2_LABELS[band] ?? band
}

function GravityHatch() {
  const id = `gap-hatch-${useId()}`
  return (
    <svg
      width="100%"
      height="44"
      viewBox="0 0 64 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block"
    >
      <defs>
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--ig-vacuum, #1A1512)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ig-line, #40362D)" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="64" height="44" fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * Gravity × oxygen evidence grid. Cells are counts of recorded experiments, so
 * this page makes research gaps visible instead of implying "no data = safe".
 */
export function CoveragePage() {
  const scenario = useIgnis((state) => state.scenario)
  const select = useIgnis((state) => state.select)

  const coverage = useMemo(() => getCoverage(), [])
  const gaps = useMemo(() => getGaps(scenario), [scenario])

  // Axes come from the module's band metadata, so the grid cannot drift from
  // getCoverage() and the empty "not specified" oxygen band stays visible.
  const gravityBands = useMemo(() => COVERAGE_GRAVITY_BANDS.map((band) => band.id), [])
  const o2Bands = useMemo(
    () => [...COVERAGE_O2_BANDS.map((band) => band.id), O2_NOT_REPORTED_BAND],
    [],
  )

  const [selected, setSelected] = useState<{ gravityBand: string; o2Band: string } | null>(null)
  const [interpret, setInterpret] = useState<InterpretState>({ status: 'idle' })
  const [requestCount, setRequestCount] = useState(0)

  const cellFor = (gravityBand: string, o2Band: string): CoverageCell | undefined =>
    coverage.find((cell) => cell.gravityBand === gravityBand && cell.o2Band === o2Band)

  const selectedCell = selected ? cellFor(selected.gravityBand, selected.o2Band) : undefined

  const filledCells = coverage.filter((cell) => cell.count > 0)
  const gapCount = coverage.filter((cell) => cell.gap).length
  const experimentTotal = coverage.reduce((sum, cell) => sum + cell.count, 0)

  const gravityBandForScenario =
    COVERAGE_GRAVITY_BANDS.find((band) => band.matches(scenario.gravityG))?.id ?? 'microgravity'

  // Nearby evidence grounds the interpretation without citing empty cells.
  const nearbyEvidence = useMemo(() => {
    const ids = coverage
      .filter((cell) => cell.gravityBand === gravityBandForScenario)
      .flatMap((cell) => cell.experimentIds)
    return Array.from(new Set(ids)).slice(0, 4)
  }, [coverage, gravityBandForScenario])

  const gapContext = useMemo(() => {
    if (gaps.length === 0) {
      return `The grid has no empty cells in the ${scenario.label} gravity band.`
    }
    const list = gaps
      .slice(0, 4)
      .map((cell) => `${formatGravity(cell.gravityBand)} with ${formatO2(cell.o2Band)} oxygen`)
      .join('; ')
    return `The grid has ${gapCount} empty cells in total. Near ${scenario.label}, nothing covers: ${list}. Treat these as untested combinations, not safe ones.`
  }, [gaps, gapCount, scenario.label])

  useEffect(() => {
    let cancelled = false
    setInterpret({ status: 'loading' })
    askSI({
      mode: 'interpret',
      experimentIds: nearbyEvidence,
      scenario,
      context: gapContext,
    })
      .then((response) => {
        if (cancelled) return
        setInterpret({
          status: 'ready',
          markdown: response.answerMarkdown,
          fallback: response.fallback,
          model: response.model,
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setInterpret({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'The interpretation could not be generated.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [nearbyEvidence, scenario, gapContext, requestCount])

  const scenarioLabel = (id: string): string =>
    SCENARIOS.find((entry) => entry.id === id)?.label ?? id

  return (
    <div className="space-y-4">
      <PageHeading
        title="Evidence coverage"
        description={`Where the dataset has evidence and where it is silent, mapped by gravity and oxygen. ${experimentTotal} experiments fill ${filledCells.length} of ${coverage.length} combinations.`}
        actions={
          <Button variant="tertiary" onClick={() => setRequestCount((count) => count + 1)}>
            Re-interpret gaps
          </Button>
        }
      />

      <Note tone="caution">
        An empty cell means no experiment in this evidence set covers that combination — not that the
        combination is safe. Gaps are the most useful thing this page shows.
      </Note>

      <section
        aria-labelledby="coverage-grid-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="coverage-grid-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
            Gravity × oxygen coverage
          </h2>
          <ul className="flex flex-wrap items-center gap-3 text-xs text-[var(--ig-muted)]">
            <li className="inline-flex items-center gap-1.5">
              <span className="inline-block h-4 w-5 rounded-[2px] border border-[var(--ig-line)] bg-[var(--ig-raised)]" />
              Has evidence
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="inline-block h-4 w-5 overflow-hidden rounded-[2px] border border-[var(--ig-line)]">
                <GravityHatch />
              </span>
              No evidence
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[var(--ig-flame-blue)]">◆</span>
              Includes {scenario.label}
            </li>
          </ul>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Number of experiments by gravity band and oxygen band. Empty cells are research gaps.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-[var(--ig-line)] py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Gravity
                </th>
                {o2Bands.map((band) => (
                  <th
                    key={band}
                    scope="col"
                    className="border-b border-[var(--ig-line)] px-1.5 py-2 text-center text-xs font-medium text-[var(--ig-muted)]"
                  >
                    {formatO2(band)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gravityBands.map((gravityBand) => (
                <tr key={gravityBand} className="border-b border-[var(--ig-line)] last:border-0">
                  <th scope="row" className="py-1.5 pr-3 text-left text-xs font-medium text-[var(--ig-frost)]">
                    {formatGravity(gravityBand)}
                  </th>
                  {o2Bands.map((o2Band) => {
                    const cell = cellFor(gravityBand, o2Band)
                    const isSelected =
                      selected?.gravityBand === gravityBand && selected.o2Band === o2Band
                    const relevant = cell?.relevantScenarios.includes(scenario.id) ?? false
                    const label = `${formatGravity(gravityBand)} gravity, ${formatO2(o2Band)} oxygen`
                    if (!cell || cell.gap) {
                      return (
                        <td key={o2Band} className="px-0.5 py-1.5">
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={`${label}: no experiments. Show details.`}
                            onClick={() =>
                              setSelected(isSelected ? null : { gravityBand, o2Band })
                            }
                            className={`block w-full overflow-hidden rounded-[2px] border text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-frost)] ${
                              isSelected
                                ? 'border-[var(--ig-frost)]'
                                : 'border-[var(--ig-line)] hover:border-[var(--ig-muted)]'
                            }`}
                          >
                            <span className="relative block">
                              <GravityHatch />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--ig-muted)]">
                                Gap
                              </span>
                              {relevant ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute right-1 top-0.5 text-[10px] text-[var(--ig-flame-blue)]"
                                >
                                  ◆
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </td>
                      )
                    }
                    return (
                      <td key={o2Band} className="px-0.5 py-1.5">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={`${label}: ${cell.count} experiment${cell.count === 1 ? '' : 's'}. Show details.`}
                          onClick={() => setSelected(isSelected ? null : { gravityBand, o2Band })}
                          className={`relative flex h-11 w-full items-center justify-center rounded-[2px] border font-mono text-sm tabular-nums text-[var(--ig-frost)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-frost)] ${
                            isSelected
                              ? 'border-[var(--ig-frost)] bg-[var(--ig-raised)]'
                              : 'border-[var(--ig-line)] bg-[var(--ig-raised)] hover:border-[var(--ig-muted)]'
                          }`}
                        >
                          {cell.count}
                          {relevant ? (
                            <span
                              aria-hidden="true"
                              className="absolute right-1 top-0.5 text-[10px] text-[var(--ig-flame-blue)]"
                            >
                              ◆
                            </span>
                          ) : null}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-xs text-[var(--ig-muted)]">
          {filledCells.length} covered combinations · {gapCount} gaps · {scenario.label} sits in the{' '}
          {formatGravity(gravityBandForScenario)} band.
        </p>
      </section>

      {selectedCell ? (
        <section
          aria-labelledby="coverage-detail-heading"
          className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
          style={{ borderLeft: '2px solid var(--ig-flame-blue)' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="coverage-detail-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
                {formatGravity(selectedCell.gravityBand)} gravity · {formatO2(selectedCell.o2Band)} oxygen
              </h2>
              <p className="mt-1 text-xs text-[var(--ig-muted)]">
                {selectedCell.count === 0
                  ? 'No experiment in the set covers this combination.'
                  : `${selectedCell.count} experiment${selectedCell.count === 1 ? '' : 's'} cover this combination.`}
                {selectedCell.relevantScenarios.length > 0
                  ? ` Relevant to ${selectedCell.relevantScenarios.map(scenarioLabel).join(', ')}.`
                  : ''}
              </p>
            </div>
            <Button variant="tertiary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>

          {selectedCell.count === 0 ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ig-muted)]">
              This is a research gap. Before relying on behaviour in this regime, look for evidence at
              the nearest covered cell, and treat any extrapolation as an assumption to verify.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {selectedCell.experimentIds.map((id) => (
                <li key={id}>
                  <Link
                    to="/explore"
                    onClick={() => select(id)}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 py-1 font-mono text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                  >
                    {id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section
        aria-labelledby="coverage-si-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="coverage-si-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
            What's missing
          </h2>
          {interpret.status === 'ready' ? (
            <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--ig-muted)]">
              <span className="rounded-[4px] border border-[var(--ig-line)] px-1.5 py-0.5 font-mono">
                {interpret.model}
              </span>
              {interpret.fallback ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] px-1.5 py-0.5"
                  title="Generated offline from the local dataset. No language-model call was made."
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--ig-amber)]" />
                  Offline fallback
                </span>
              ) : null}
            </span>
          ) : null}
        </div>

        <div className="mt-3" aria-live="polite">
          {interpret.status === 'loading' ? (
            <div className="space-y-2" role="status">
              <span className="sr-only">Interpreting the coverage gaps</span>
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ) : interpret.status === 'error' ? (
            <p className="text-xs text-[var(--ig-frost)]">
              The interpretation could not be generated: {interpret.message} Use the gap list above
              instead.
            </p>
          ) : interpret.status === 'ready' ? (
            <div className="text-sm leading-relaxed text-[var(--ig-muted)] [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--ig-frost)] [&_li]:mt-1 [&_p]:mt-2 [&_strong]:text-[var(--ig-frost)] [&_ul]:mt-2 [&_ul]:space-y-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-[var(--ig-frost)]">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mt-2 text-sm">{children}</p>,
                }}
              >
                {interpret.markdown}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>

        {nearbyEvidence.length > 0 ? (
          <div className="mt-3">
            <h3 className="text-xs font-medium text-[var(--ig-frost)]">Nearest evidence cited</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {nearbyEvidence.map((id) => (
                <li key={id}>
                  <Link
                    to="/explore"
                    onClick={() => select(id)}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 py-1 font-mono text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
                  >
                    {id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  )
}
