import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Sparkles, Microscope, ArrowRight } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../../api/mock/experiments.mock'
import { client } from '../../../api/client'
import type { InsightResponse } from '../../../api/types'
import { CitationChip } from '../../../design-system/components/data-display/CitationChip'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'
import { useApi } from '../../../hooks/useApi'

export function InsightsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<{ q?: string; tag?: string }>({
    q: searchParams.get('q') || undefined,
    tag: searchParams.get('tag') || undefined,
  })
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<InsightResponse | null>(null)
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState<string | null>(null)

  const listFetcher = useCallback(() => client.listExperiments({ sort: 'relevance' }), [])
  const { data: records, error, loading, reload } = useApi(listFetcher, [])

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

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  // Group insights by severity for display
  const severityGroups = useMemo(() => {
    const groups: Record<string, typeof MOCK_EXPERIMENTS> = { critical: [], high: [], caution: [], info: [] }
    for (const record of records ?? []) {
      const score = record.safety_relevance_score
      if (score >= 85) groups.critical.push(record)
      else if (score >= 70) groups.high.push(record)
      else if (score >= 55) groups.caution.push(record)
      else groups.info.push(record)
    }
    return groups
  }, [records])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Scientific Insights</h1>
          <p className="text-sm text-slate-400">
            Ask research questions grounded in selected experiments. Every answer cites verified
            record IDs — no hallucinated references.
          </p>
        </div>
      </div>

      {/* Severity overview */}
      <div className="grid md:grid-cols-4 gap-3">
        {[
          { key: 'critical', label: 'Critical (85+)', count: severityGroups.critical.length, color: 'text-ember-400' },
          { key: 'high', label: 'High (70+)', count: severityGroups.high.length, color: 'text-amber-400' },
          { key: 'caution', label: 'Caution (55+)', count: severityGroups.caution.length, color: 'text-amber-300' },
          { key: 'info', label: 'Info', count: severityGroups.info.length, color: 'text-slate-300' },
        ].map((group) => (
          <div
            key={group.key}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              {group.label}
            </span>
            <span className="text-2xl font-bold text-slate-200">{group.count}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: Experiment selection */}
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Select experiments
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Filter
              </span>
              <select
                value={query.tag ?? ''}
                onChange={(event) =>
                  setQuery((prev) => ({ ...prev, tag: event.target.value || undefined }))
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-ember-500/60"
              >
                <option value="">All safety tags</option>
                {['flammability', 'flame-spread', 'extinction', 'suppression', 'smoldering', 'detection', 'cabin-atmosphere', 'material-selection'].map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {loading ? <Loading /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {records ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {records.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No experiments match your filters.</p>
                ) : (
                  records.map((record) => (
                    <div
                      key={record.id}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                        selected.includes(record.id)
                          ? 'border-ember-500/50 bg-ember-500/5'
                          : 'border-white/10 bg-white/5 hover:border-ember-500/40 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(record.id)}
                        onChange={() => toggle(record.id)}
                        className="accent-ember-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-200 block line-clamp-1">
                          {record.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {record.platform} &middot; {record.safety_relevance_score.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {selected.length} selected
              </span>
            </div>
          </div>

          {/* Ask form */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Ask Ignis
            </h3>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const textarea = event.currentTarget.elements.namedItem('question') as HTMLTextAreaElement
                ask(textarea.value)
              }}
              className="space-y-3"
            >
              <textarea
                name="question"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-ember-500/60 resize-none"
                placeholder="What does this imply for cabin fire response?"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Grounded: answers cite only the selected experiment IDs.
                </span>
                <button
                  type="submit"
                  disabled={asking || !selected.length}
                  className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {asking ? 'Generating…' : 'Ask Ignis'}
                </button>
              </div>
              {askError && (
                <div className="mt-3 rounded-lg border border-ember-500/30 bg-ember-500/5 p-3">
                  <p className="text-sm text-ember-300">{askError}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-5">
          {asking && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <Loading label="Generating evidence-linked insight…" />
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-ember-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Answer
                </h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
                {result.insight}
              </p>
              {result.citations.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Citations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.citations.map((citation) => (
                      <CitationChip key={citation} id={citation} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !asking && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-slate-500">
              <Microscope size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-sm">No insights yet.</p>
              <p className="text-xs mt-1">
                Select experiments and ask a question to generate an evidence-linked answer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Browse by severity */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Browse by severity
          </h3>
          <Link
            to="/app/analysis?tab=rankings"
            className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
          >
            View rankings <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'critical', label: 'Critical', records: severityGroups.critical },
            { key: 'high', label: 'High', records: severityGroups.high },
            { key: 'caution', label: 'Caution', records: severityGroups.caution },
            { key: 'info', label: 'Info', records: severityGroups.info },
          ].map((group) => (
            <div key={group.key} className="p-3 rounded-lg border border-white/10 bg-white/5">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                <span className={`font-mono ${group.key === 'critical' ? 'text-ember-400' : group.key === 'high' ? 'text-amber-400' : group.key === 'caution' ? 'text-amber-300' : 'text-slate-300'}`}>
                  {group.label}
                </span>
              </h4>
              <div className="space-y-2">
                {group.records.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start gap-2"
                  >
                    <span className="shrink-0 mt-0.5 text-[10px] text-slate-500">
                      •
                    </span>
                    <Link
                      to={`/app/research/experiments/${record.id}`}
                      className="text-xs text-slate-200 hover:text-ember-300 line-clamp-1"
                    >
                      {record.title}
                    </Link>
                  </div>
                ))}
                {group.records.length > 3 && (
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    +{group.records.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
