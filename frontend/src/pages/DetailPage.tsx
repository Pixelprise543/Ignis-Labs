import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { client } from '../api/client'
import { ScoreBadge } from '../components/ScoreBadge'
import { ErrorState } from '../components/ui/ErrorState'
import { Loading } from '../components/ui/Loading'
import { useApi } from '../hooks/useApi'
import { formatAtmosphere, formatYear } from '../lib/format'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const experimentId = id ?? ''
  const fetcher = useCallback(() => client.getExperiment(experimentId), [experimentId])
  const { data, error, loading, reload } = useApi(fetcher, [experimentId])

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return null

  return (
    <div className="space-y-6">
      <Link to="/" className="text-xs text-slate-400 hover:text-ember-300">
        ← back to experiments
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-100">{data.title}</h1>
          <ScoreBadge score={data.safety_relevance_score} />
        </div>
        <p className="text-sm text-slate-400">
          {data.platform} · {formatYear(data.year)} · {data.fuel_material || 'material unknown'}
        </p>
        <p className="font-mono text-xs text-slate-500">{formatAtmosphere(data.atmosphere)}</p>
      </header>

      <section className="card">
        <h2 className="text-sm font-semibold text-ember-300">AI summary</h2>
        <p className="mt-2 text-sm text-slate-200">{data.ai_summary}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-sm font-semibold text-slate-200">Why it ranks here</h2>
          <p className="mt-2 text-sm text-slate-300">{data.rationale}</p>
        </section>
        <section className="card">
          <h2 className="text-sm font-semibold text-slate-200">Mission implications</h2>
          <p className="mt-2 text-sm text-slate-300">{data.mission_implications}</p>
        </section>
      </div>

      <section className="card">
        <h2 className="text-sm font-semibold text-slate-200">Key findings</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {data.key_findings.length ? (
            data.key_findings.map((finding) => <li key={finding}>{finding}</li>)
          ) : (
            <li className="text-slate-500">No findings recorded.</li>
          )}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-slate-200">Abstract</h2>
        <p className="mt-2 text-sm text-slate-300">{data.abstract || 'No abstract recorded.'}</p>
        {data.source_url ? (
          <a
            href={data.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-ember-400 hover:text-ember-300"
          >
            Source ↗
          </a>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-1.5">
        {data.safety_tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
