import { useCallback, useState } from 'react'
import { client } from '../api/client'
import type { InsightResponse } from '../api/types'
import { AskPanel } from '../components/AskPanel'
import { CitationChip } from '../components/CitationChip'
import { ErrorState } from '../components/ui/ErrorState'
import { Loading } from '../components/ui/Loading'
import { useApi } from '../hooks/useApi'

export function InsightsPage() {
  const listFetcher = useCallback(() => client.listExperiments({ sort: 'relevance' }), [])
  const { data: records, error, loading, reload } = useApi(listFetcher, [])
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<InsightResponse | null>(null)
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const ask = async (question: string) => {
    if (!selected.length) {
      setAskError('Select at least one experiment first.')
      return
    }
    setAsking(true)
    setAskError(null)
    try {
      setResult(
        await client.insights({
          experiment_ids: selected,
          question: question.trim() || undefined,
        }),
      )
    } catch (cause) {
      setAskError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Insights</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ask a question grounded in the experiments you select. Citations are validated
          against real ids.
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
              <span className="text-slate-200">{record.title}</span>
            </label>
          ))}
        </div>
      ) : null}

      <AskPanel onSubmit={ask} disabled={asking} />
      {askError ? <ErrorState message={askError} /> : null}

      {result ? (
        <section className="card">
          <h2 className="text-sm font-semibold text-slate-200">Answer</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{result.insight}</p>
          {result.citations.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.citations.map((citation) => (
                <CitationChip key={citation} id={citation} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
