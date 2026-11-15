import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Flame, Microscope, ShieldCheck, Link as LinkIcon, ArrowRight, Copy } from 'lucide-react'
import { client } from '../../../api/client'
import { ScoreBadge } from '../../../design-system/components/data-display/ScoreBadge'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'
import { useApi } from '../../../hooks/useApi'
import { formatAtmosphere, formatYear } from '../../../lib/format'
import { SeverityBadge } from '../shared/SeverityBadge'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const experimentId = id ?? ''
  const fetcher = useCallback(() => client.getExperiment(experimentId), [experimentId])
  const { data, error, loading, reload } = useApi(fetcher, [experimentId])

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return null

  const severity =
    data.safety_relevance_score >= 85 ? 'critical' : data.safety_relevance_score >= 70 ? 'high' : data.safety_relevance_score >= 55 ? 'caution' : 'info'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/app/research" className="hover:text-slate-200 transition-colors">
          Research Explorer
        </Link>
        <span>/</span>
        <span className="text-slate-300">{data.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="flex-1 lg:max-w-2xl space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-slate-500">
                    {data.id.replace('mock-', '')}
                  </span>
                  <SeverityBadge severity={severity} />
                </div>
                <h1 className="text-xl lg:text-2xl font-semibold text-slate-100 mb-2">
                  {data.title}
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {data.ai_summary}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <ScoreBadge score={data.safety_relevance_score} />
                <Link
                  to={`/app/research/experiments/${data.id}`}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-ember-400 hover:text-ember-300"
                >
                  View source <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 text-xs">
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Platform
                </p>
                <p className="text-sm text-slate-200">{data.platform}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Year
                </p>
                <p className="text-sm text-slate-200">{formatYear(data.year)}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Fuel / material
                </p>
                <p className="text-sm text-slate-200">{data.fuel_material || 'material unknown'}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Atmosphere
                </p>
                <p className="text-sm font-mono text-slate-200">{formatAtmosphere(data.atmosphere)}</p>
              </div>
            </div>
          </div>

          {/* Key findings */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Microscope size={16} className="text-ember-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Key findings
              </h3>
            </div>
            <ul className="space-y-3">
              {data.key_findings.length ? (
                data.key_findings.map((finding, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 mt-0.5 text-ember-400">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{finding}</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No findings recorded.</p>
              )}
            </ul>
          </div>

          {/* AI summary */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon size={16} className="text-ember-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                AI summary
              </h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{data.ai_summary}</p>
          </div>

          {/* Rationale */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-ember-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Safety rationale
              </h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{data.rationale}</p>
          </div>

          {/* Mission implications */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className="text-ember-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Mission implications
              </h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{data.mission_implications}</p>
          </div>

          {/* Abstract & source */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon size={16} className="text-ember-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Abstract &amp; source
              </h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              {data.abstract || 'No abstract recorded.'}
            </p>
            {data.source_url ? (
              <div className="flex items-center gap-2">
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-ember-400 hover:text-ember-300"
                >
                  Open source ↗
                  <LinkIcon size={12} aria-hidden="true" />
                </a>
              </div>
            ) : null}
          </div>

          {/* Safety tags */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Safety tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.safety_tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Citations & related */}
        <div className="lg:w-96 flex-none space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Citations
            </h3>
            <div className="space-y-2">
              {data.safety_tags.map((tag) => (
                <div key={tag} className="flex items-start gap-2">
                  <span className="shrink-0 mt-1 text-xs text-slate-400">
                    [{tag}]
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Experiment tagged with {tag}.
                  </p>
                </div>
              ))}
              <div className="flex items-start gap-2 pt-4 border-t border-white/10">
                <span className="shrink-0 mt-1 text-xs text-slate-400">
                  [{data.id.replace('mock-', '')}]
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Primary source record for this experiment.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigator.clipboard.writeText(data.source_url)}
                className="flex items-center gap-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-slate-300 hover:bg-white/10 transition-colors"
              >
                <Copy size={14} aria-hidden="true" />
                Copy source URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SparklesIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 2L3 14h9l-1 8 10-12H13z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
