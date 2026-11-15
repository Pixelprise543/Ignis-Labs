import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '../api/client'
import type { Weights } from '../api/types'
import { ScoreBadge } from '../components/ScoreBadge'
import { DEFAULT_WEIGHTS, WeightSliders } from '../components/WeightSliders'
import { ErrorState } from '../components/ui/ErrorState'
import { Loading } from '../components/ui/Loading'
import { useApi } from '../hooks/useApi'

const BAR_FIELDS: { key: 'relevance' | 'confidence' | 'recency'; color: string }[] = [
  { key: 'relevance', color: 'bg-ember-500' },
  { key: 'confidence', color: 'bg-sky-400' },
  { key: 'recency', color: 'bg-emerald-400' },
]

export function RankingsPage() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const fetcher = useCallback(() => client.getRankings(weights), [weights])
  const { data, error, loading, reload } = useApi(fetcher, [weights])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Rankings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Weighted score = relevance × w + confidence × w + recency × w.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <WeightSliders weights={weights} onChange={setWeights} />

        <div className="space-y-3">
          {loading ? <Loading /> : null}
          {error ? <ErrorState message={error} onRetry={reload} /> : null}

          {data?.map((record) => (
            <article key={record.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-mono text-sm text-slate-500">#{record.rank}</span>
                  <div>
                    <Link
                      to={`/experiments/${record.id}`}
                      className="font-semibold text-slate-100 hover:text-ember-300"
                    >
                      {record.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      {record.platform} · {record.year ?? 'year unknown'}
                    </p>
                  </div>
                </div>
                <ScoreBadge score={record.safety_relevance_score} />
              </div>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                {BAR_FIELDS.map((field) => (
                  <div key={field.key}>
                    <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
                      <span>{field.key}</span>
                      <span className="font-mono">
                        {record.score_breakdown[field.key].toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-0.5 h-1 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${field.color}`}
                        style={{ width: `${record.score_breakdown[field.key] * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
