import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { MaterialRisk, Scenario, ScenarioId, Severity } from '@/contracts/types'
import { getMaterials, SCENARIOS, useIgnis } from '@/app/data'
import { getMaterialRiskList } from '@/lib/materials'
import { Note, PageHeading, UiButton } from '../explore/_ui'

const RISK_STYLES: Record<Severity, { label: string; color: string; range: string }> = {
  info: { label: 'Low', color: 'var(--ig-quench, #8DBF6A)', range: '0–34' },
  caution: { label: 'Moderate', color: 'var(--ig-amber, #F5B942)', range: '35–54' },
  high: { label: 'High', color: 'var(--ig-ember, #EE7B3A)', range: '55–74' },
  critical: { label: 'Critical', color: 'var(--ig-alarm, #F06A6E)', range: '75–100' },
}

const RISK_ORDER: Severity[] = ['info', 'caution', 'high', 'critical']

/**
 * Shape carries the severity too, so the four colour steps are never the only
 * signal inside a cell.
 */
function RiskShape({ level, size = 10 }: { level: Severity; size?: number }) {
  const half = size / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {level === 'info' ? (
        <circle cx={half} cy={half} r={half - 0.5} fill="currentColor" />
      ) : level === 'caution' ? (
        <polygon points={`${half},0.5 ${size - 0.5},${size - 1} 0.5,${size - 1}`} fill="currentColor" />
      ) : level === 'high' ? (
        <polygon points={`${half},0.5 ${size - 0.5},${half} ${half},${size - 0.5} 0.5,${half}`} fill="currentColor" />
      ) : (
        <rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="currentColor" />
      )}
    </svg>
  )
}

function RiskLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ig-muted)]">
      {RISK_ORDER.map((level) => {
        const style = RISK_STYLES[level]
        return (
          <li key={level} className="inline-flex items-center gap-1.5">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-[2px] text-[var(--ig-vacuum)]"
              style={{ backgroundColor: style.color }}
            >
              <RiskShape level={level} size={8} />
            </span>
            <span className="text-[var(--ig-frost)]">{style.label}</span>
            <span className="font-mono tabular-nums">{style.range}</span>
          </li>
        )
      })}
      <li className="inline-flex items-center gap-1.5">
        <HatchSwatch />
        <span className="text-[var(--ig-frost)]">No data</span>
      </li>
    </ul>
  )
}

function HatchSwatch() {
  const id = useId()
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill="var(--ig-hull, #231D18)" />
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ig-line, #40362D)" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width="15" height="15" fill={`url(#${id})`} stroke="var(--ig-line, #40362D)" />
    </svg>
  )
}

function NoDataCell({ label }: { label: string }) {
  const id = useId()
  return (
    <span
      className="flex h-10 w-full items-center justify-center"
      title={`${label}: no evidence in the set`}
    >
      <svg width="100%" height="40" viewBox="0 0 64 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="var(--ig-vacuum, #1A1512)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ig-line, #40362D)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="64" height="40" fill={`url(#${id})`} />
      </svg>
      <span className="sr-only">{label}: no data</span>
    </span>
  )
}

export function MaterialsPage() {
  const materials = useMemo(() => getMaterials(), [])
  const matrix = useMemo(() => getMaterialRiskList(), [])
  const scenario = useIgnis((state) => state.scenario)
  const setScenario = useIgnis((state) => state.setScenario)
  const select = useIgnis((state) => state.select)

  const [selected, setSelected] = useState<{ materialId: string; scenarioId: ScenarioId } | null>(null)

  const columns = useMemo(() => SCENARIOS.filter((entry) => entry.id !== 'custom'), [])
  const riskFor = (materialId: string, scenarioId: ScenarioId): MaterialRisk | undefined =>
    matrix.find((row) => row.materialId === materialId && row.scenarioId === scenarioId)

  const orderedMaterials = useMemo(() => {
    const currentRisks = new Map(
      matrix
        .filter((row) => row.scenarioId === scenario.id)
        .map((row) => [row.materialId, row.risk] as const),
    )
    return [...materials].sort(
      (a, b) => (currentRisks.get(b.id) ?? 0) - (currentRisks.get(a.id) ?? 0),
    )
  }, [materials, matrix, scenario.id])

  const currentRisks = matrix.filter((row) => row.scenarioId === scenario.id)
  const criticalCount = currentRisks.filter((row) => row.level === 'critical').length
  const highCount = currentRisks.filter((row) => row.level === 'high').length
  const worst = currentRisks.reduce<MaterialRisk | undefined>(
    (best, row) => (best === undefined || row.risk > best.risk ? row : best),
    undefined,
  )
  const worstMaterial = worst ? materials.find((material) => material.id === worst.materialId) : undefined

  const selectedMaterial = selected ? materials.find((material) => material.id === selected.materialId) : undefined
  const selectedScenario: Scenario | undefined = selected
    ? SCENARIOS.find((entry) => entry.id === selected.scenarioId)
    : undefined
  const selectedRisk: MaterialRisk | undefined =
    selected && selectedMaterial ? riskFor(selectedMaterial.id, selected.scenarioId) : undefined

  const summaryParts = [
    `${materials.length} materials across ${columns.length} scenarios.`,
    strongSummary(criticalCount, highCount),
    worstMaterial && worst ? `Highest for ${scenario.label}: ${worstMaterial.name} at ${worst.risk}.` : '',
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <PageHeading
        title="Material risks"
        description="How each material rates for the selected scenario. Rows are sorted by the current scenario, and you can switch scenario from any cell."
        actions={
          <Link
            to="/method"
            className="inline-flex min-h-9 items-center rounded-[4px] border border-[var(--ig-line)] px-3 text-sm text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          >
            How scoring works
          </Link>
        }
      />

      <Note>
        Every cell is a decision-support estimate, not a physics simulation. The risk index combines
        a material flammability base with scenario oxygen, gravity and pressure — the same
        placeholder formula shown in Method. Use it to prioritise questions, not to certify hardware.
      </Note>

      <section
        aria-labelledby="material-matrix-heading"
        className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="material-matrix-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
              Flammability-risk matrix
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ig-muted)]">
              {summaryParts.join(' ')}
            </p>
          </div>
          <RiskLegend />
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Material by scenario flammability risk. Colour, shape and a numeric value all encode the
              same severity.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-[var(--ig-line)] py-2 pr-3 text-xs font-medium text-[var(--ig-muted)]">
                  Material
                </th>
                <th scope="col" className="hidden border-b border-[var(--ig-line)] px-3 py-2 text-xs font-medium text-[var(--ig-muted)] lg:table-cell">
                  Used for
                </th>
                {columns.map((column) => {
                  const current = column.id === scenario.id
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      aria-current={current ? 'true' : undefined}
                      className={`border-b border-[var(--ig-line)] px-2 py-2 text-center align-bottom text-xs font-medium ${
                        current ? 'text-[var(--ig-frost)]' : 'text-[var(--ig-muted)]'
                      }`}
                      style={current ? { borderTop: '2px solid var(--ig-flame-blue)' } : undefined}
                    >
                      <span className="block">{column.label}</span>
                      <span className="mt-0.5 block font-mono text-[10px] font-normal text-[var(--ig-muted)]">
                        {column.gravityG}g · {column.o2Percent}% O₂
                      </span>
                      {current ? (
                        <span className="mt-0.5 inline-block rounded-[2px] border border-[var(--ig-line)] px-1 text-[10px] text-[var(--ig-flame-blue)]">
                          Current
                        </span>
                      ) : null}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {orderedMaterials.map((material) => {
                const currentRisk = riskFor(material.id, scenario.id)
                return (
                  <tr key={material.id} className="border-b border-[var(--ig-line)] last:border-0">
                    <th scope="row" className="py-1.5 pr-3 text-left align-middle">
                      <span className="block text-xs font-medium text-[var(--ig-frost)]">
                        {material.name}
                      </span>
                      <span className="text-[10px] text-[var(--ig-muted)]">
                        {material.category}
                        {currentRisk ? ` · base ${material.baseFlammability}` : ''}
                      </span>
                    </th>
                    <td className="hidden px-3 py-1.5 align-middle text-xs text-[var(--ig-muted)] lg:table-cell">
                      {material.usedFor}
                    </td>
                    {columns.map((column) => {
                      const risk = riskFor(material.id, column.id)
                      const isSelected =
                        selected?.materialId === material.id && selected.scenarioId === column.id
                      const label = `${material.name}, ${column.label}`
                      if (!risk) {
                        return (
                          <td key={column.id} className="px-1 py-1.5">
                            <NoDataCell label={label} />
                          </td>
                        )
                      }
                      const style = RISK_STYLES[risk.level]
                      return (
                        <td key={column.id} className="px-1 py-1.5">
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={`${label}: risk ${risk.risk} of 100, ${style.label.toLowerCase()}. Show details.`}
                            title={`${label} — ${style.label} (${risk.risk}/100). ${risk.rationale}`}
                            onClick={() =>
                              setSelected(
                                isSelected ? null : { materialId: material.id, scenarioId: column.id },
                              )
                            }
                            className={`flex h-10 w-full min-w-[56px] items-center justify-center gap-1.5 rounded-[2px] font-mono text-xs tabular-nums text-[var(--ig-vacuum)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-frost)] ${
                              isSelected ? 'outline outline-2 outline-offset-1 outline-[var(--ig-frost)]' : ''
                            }`}
                            style={{ backgroundColor: style.color }}
                          >
                            <RiskShape level={risk.level} />
                            {risk.risk}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <details className="mt-3 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-[var(--ig-frost)]">
            Data table (text alternative)
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <caption className="sr-only">All material risk values by scenario</caption>
              <thead>
                <tr className="text-[var(--ig-muted)]">
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 pr-3 font-medium">Material</th>
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 pr-3 font-medium">Scenario</th>
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 pr-3 text-right font-medium">Risk</th>
                  <th scope="col" className="border-b border-[var(--ig-line)] py-1 font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => {
                  const material = materials.find((entry) => entry.id === row.materialId)
                  const column = columns.find((entry) => entry.id === row.scenarioId)
                  return (
                    <tr key={`${row.materialId}-${row.scenarioId}`}>
                      <td className="border-b border-[var(--ig-line)] py-1 pr-3 text-[var(--ig-frost)]">
                        {material?.name ?? row.materialId}
                      </td>
                      <td className="border-b border-[var(--ig-line)] py-1 pr-3 text-[var(--ig-muted)]">
                        {column?.label ?? row.scenarioId}
                      </td>
                      <td className="border-b border-[var(--ig-line)] py-1 pr-3 text-right font-mono tabular-nums text-[var(--ig-frost)]">
                        {row.risk}
                      </td>
                      <td className="border-b border-[var(--ig-line)] py-1 text-[var(--ig-muted)]">
                        {RISK_STYLES[row.level].label}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {selectedMaterial && selectedRisk && selectedScenario ? (
        <section
          aria-labelledby="material-detail-heading"
          className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4"
          style={{ borderLeft: '2px solid var(--ig-flame-blue)' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="material-detail-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
                {selectedMaterial.name} in {selectedScenario.label}
              </h2>
              <p className="mt-1 text-xs text-[var(--ig-muted)]">
                {selectedMaterial.usedFor} · {selectedMaterial.category}
              </p>
            </div>
            <UiButton variant="ghost" onClick={() => setSelected(null)}>
              Close
            </UiButton>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 font-mono text-sm tabular-nums text-[var(--ig-vacuum)]"
              style={{ backgroundColor: RISK_STYLES[selectedRisk.level].color }}
            >
              <RiskShape level={selectedRisk.level} size={12} />
              {selectedRisk.risk}
            </span>
            <span className="text-sm text-[var(--ig-frost)]">
              {RISK_STYLES[selectedRisk.level].label} risk
            </span>
            <span className="font-mono text-xs text-[var(--ig-muted)]">
              {selectedScenario.gravityG}g · {selectedScenario.o2Percent}% O₂ ·{' '}
              {selectedScenario.pressureKPa} kPa
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ig-muted)]">
            {selectedRisk.rationale}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ig-muted)]">{selectedMaterial.notes}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--ig-muted)]">Evidence</span>
            {selectedRisk.evidenceIds.map((id) => (
              <Link
                key={id}
                to="/explore"
                onClick={() => select(id)}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-2 py-1 font-mono text-xs text-[var(--ig-frost)] hover:bg-[var(--ig-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
              >
                {id}
              </Link>
            ))}
            {selectedScenario.id !== scenario.id ? (
              <UiButton variant="secondary" onClick={() => setScenario(selectedScenario)}>
                Switch scenario to {selectedScenario.label}
              </UiButton>
            ) : null}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="material-list-heading" className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4">
        <h2 id="material-list-heading" className="text-sm font-semibold text-[var(--ig-frost)]">
          Materials in the set
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {orderedMaterials.map((material) => (
            <li key={material.id} className="rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] p-2">
              <p className="text-xs font-medium text-[var(--ig-frost)]">{material.name}</p>
              <p className="mt-0.5 text-[11px] text-[var(--ig-muted)]">{material.category}</p>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-[var(--ig-muted)]">
                base {material.baseFlammability} · {material.evidenceIds.length} evidence
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function strongSummary(criticalCount: number, highCount: number): string {
  if (criticalCount > 0 && highCount > 0) {
    return `${criticalCount} critical and ${highCount} high-risk cells for the current scenario.`
  }
  if (criticalCount > 0) return `${criticalCount} critical cells for the current scenario.`
  if (highCount > 0) return `${highCount} high-risk cells for the current scenario.`
  return 'No high or critical cells for the current scenario.'
}
