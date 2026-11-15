import { useCallback, useState } from 'react'
import { client } from '../api/client'
import type { EnrichedExperiment } from '../api/types'
import { ScoreBadge } from '../components/ScoreBadge'
import { ErrorState } from '../components/ui/ErrorState'
import { Loading } from '../components/ui/Loading'
import { useApi } from '../hooks/useApi'
import { formatAtmosphere } from '../lib/format'

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
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Compare</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pick up to {MAX_COMPARE} experiments for a side-by-side view.
        </p>
      </header>

      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {records ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {records.map((record) => (
            <label
              key={record.id}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm hover:border-ember-500/40"
            >
              <input
                type="checkbox"
                checked={selected.includes(record.id)}
                onChange={() => toggle(record.id)}
                className="mt-1 accent-ember-500"
              />
              <span>
                <span className="text-slate-200">{record.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {record.platform} · {record.safety_relevance_score.toFixed(0)}/100
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={runCompare}
        disabled={!selected.length || comparing}
        className="rounded-lg bg-ember-600 px-4 py-2 text-sm font-medium text-white hover:bg-ember-500 disabled:opacity-40"
      >
        {comparing ? 'Comparing…' : `Compare ${selected.length} selected`}
      </button>

      {compareError ? <ErrorState message={compareError} /> : null}

      {comparison ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-white/10 p-2 text-left text-xs text-slate-500">
                  Attribute
                </th>
                {comparison.map((record) => (
                  <th key={record.id} className="border-b border-white/10 p-2 text-left">
                    <span className="block text-slate-200">{record.title}</span>
                    <ScoreBadge score={record.safety_relevance_score} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="align-top">
                  <th className="border-b border-white/5 p-2 text-left text-xs font-normal text-slate-500">
                    {row.label}
                  </th>
                  {comparison.map((record) => (
                    <td key={record.id} className="border-b border-white/5 p-2 text-slate-300">
                      {row.value(record)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
