import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Microscope } from 'lucide-react'
import { client } from '../../../api/client'
import type { Weights } from '../../../api/types'
import { DEFAULT_WEIGHTS, WeightSliders } from '../../../design-system/components/forms/WeightSliders'
import { ScoreBadge } from '../../../design-system/components/data-display/ScoreBadge'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'
import { useApi } from '../../../hooks/useApi'
import { formatYear } from '../../../lib/format'

const BAR_FIELDS: { key: 'relevance' | 'confidence' | 'recency'; label: string; color: string }[] = [
  { key: 'relevance', label: 'Relevance', color: 'bg-ember-500' },
  { key: 'confidence', label: 'Confidence', color: 'bg-sky-400' },
  { key: 'recency', label: 'Recency', color: 'bg-emerald-400' },
]

export function RankingsPage() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const fetcher = useCallback(() => client.getRankings(weights), [weights])
  const { data, error, loading, reload } = useApi(fetcher, [weights])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Weighted rankings</h1>
          <p className="text-sm text-slate-400">
            Rank experiments by weighted safety relevance. Adjust the weights to reflect your research priorities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => reload()}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors disabled:opacity-40"
            disabled={loading}
          >
            <Microscope size={14} className="animate-[spin_1s_linear_infinite]" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Weights panel */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <WeightSliders weights={weights} onChange={setWeights} />
        </div>

        {/* Results panel */}
        <div className="space-y-5">
          {loading ? <Loading /> : null}
          {error ? <ErrorState message={error} onRetry={reload} /> : null}

          {data ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Ranked results
                </span>
                <span className="text-[10px] font-mono text-slate-400">{data.length} records</span>
              </div>
              <div className="space-y-3">
                {data.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-ember-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-xs text-slate-500">
                          #{record.rank}
                        </span>
                        <div>
                          <Link
                            to={`/app/research/experiments/${record.id}`}
                            className="text-sm font-semibold text-slate-200 hover:text-ember-300 line-clamp-1"
                          >
                            {record.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {record.platform} &middot; {formatYear(record.year)}
                          </p>
                        </div>
                      </div>
                      <ScoreBadge score={record.safety_relevance_score} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {BAR_FIELDS.map((field) => {
                        const breakdown = record.score_breakdown[field.key]
                        return (
                          <div key={field.key} className="p-2 rounded-lg border border-white/10 bg-white/5">
                            <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                              <span>{field.label}</span>
                              <span className="font-mono">{breakdown.toFixed(2)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full ${field.color}`}
                                style={{ width: `${breakdown * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {record.rationale}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Scoring methodology */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-ember-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Scoring methodology
          </h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          Weighted score = 100 × (relevance × w₁ + confidence × w₂ + recency × w₃).
          Default weights: relevance 0.5, confidence 0.3, recency 0.2.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Relevance
            </p>
            <p className="text-sm text-slate-200">Safety relevance score (0–100)</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 bg-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Confidence
            </p>
            <p className="text-sm text-slate-200">Data completeness across fields</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 bg-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Recency
            </p>
            <p className="text-sm text-slate-200">Publication year (30-year span)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
