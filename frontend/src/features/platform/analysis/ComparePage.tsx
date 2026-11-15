import { useCallback, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { client } from '../../../api/client'
import type { EnrichedExperiment } from '../../../api/types'
import { ScoreBadge } from '../../../design-system/components/data-display/ScoreBadge'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'
import { useApi } from '../../../hooks/useApi'
import { formatAtmosphere } from '../../../lib/format'

const MAX_COMPARE = 3

const ROWS: { label: string; value: (record: EnrichedExperiment) => string }[] = [
  { label: 'Platform', value: (record) => record.platform },
  { label: 'Year', value: (record) => (record.year === null ? 'unknown' : String(record.year)) },
  { label: 'Material', value: (record) => record.fuel_material || 'unknown' },
  { label: 'Atmosphere', value: (record) => formatAtmosphere(record.atmosphere) },
  { label: 'Tags', value: (record) => record.safety_tags.join(', ') || 'none' },
  { label: 'Mission implications', value: (record) => record.mission_implications },
]

export function ComparePage() {
  const listFetcher = useCallback(() => client.listExperiments({ sort: 'relevance' }), [])
  const { data: records, error, loading, reload } = useApi(listFetcher, [])
  const [selected, setSelected] = useState<string[]>([])
  const [comparison, setComparison] = useState<EnrichedExperiment[] | null>(null)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [comparing, setComparing] = useState(false)

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= MAX_COMPARE
          ? current
          : [...current, id],
    )
  }

  const runCompare = async () => {
    if (!selected.length) return
    setComparing(true)
    setCompareError(null)
    try {
      setComparison(await client.compare(selected))
    } catch (cause) {
      setCompareError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setComparing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Compare experiments</h1>
          <p className="text-sm text-slate-400">
            Select up to {MAX_COMPARE} experiments for a side-by-side view of their attributes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => reload()}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors disabled:opacity-40"
            disabled={loading}
          >
            <ShieldCheck size={14} className="animate-[spin_1s_linear_infinite]" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {records ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {records.map((record) => (
              <label
                key={record.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-ember-500/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(record.id)}
                  onChange={() => toggle(record.id)}
                  className="mt-1 accent-ember-500 shrink-0"
                />
                <div className="flex-1">
                  <span className="text-sm text-slate-200 block line-clamp-1">{record.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {record.platform} &middot; {record.safety_relevance_score.toFixed(0)}/100
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {selected.length}/{MAX_COMPARE} selected
            </span>
            <button
              type="button"
              onClick={runCompare}
              disabled={!selected.length || comparing}
              className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {comparing ? 'Comparing…' : `Compare ${selected.length} selected`}
            </button>
          </div>

          {compareError ? <ErrorState message={compareError} /> : null}

          {comparison ? (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Comparison results
                </span>
                <span className="text-[10px] font-mono text-slate-400">{comparison.length} experiments</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Attribute
                      </th>
                      {comparison.map((record) => (
                        <th key={record.id} className="p-3 text-left">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-200 line-clamp-1">
                              {record.title}
                            </span>
                            <ScoreBadge score={record.safety_relevance_score} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.label} className="border-b border-white/5 align-top">
                        <th className="p-3 text-left text-[10px] font-normal text-slate-500">
                          {row.label}
                        </th>
                        {comparison.map((record) => (
                          <td key={record.id} className="p-3 text-slate-300 leading-relaxed">
                            {row.value(record)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
