import { useState, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Flame, BarChart3, Timeline, Layers, Microscope } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../../api/mock/experiments.mock'
import { ExperimentQuery, Platform, SafetyTag } from '../../../api/types'
import { PLATFORMS, SAFETY_TAGS } from '../../../api/types'
import { client } from '../../../api/client'
import { useApi } from '../../../hooks/useApi'
import { FilterBar } from '../../../design-system/components/forms/FilterBar'
import { O2VsScoreChart } from '../../../design-system/components/charts/O2VsScoreChart'
import { ScoreByPlatformChart } from '../../../design-system/components/charts/ScoreByPlatformChart'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'
import { PlatformChart } from '../shared/PlatformChart'
import { formatYear } from '../../../lib/format'

const TABS = [
  { key: 'overview', label: 'Overview', icon: Flame },
  { key: 'experiments', label: 'Experiments', icon: BarChart3 },
  { key: 'timeline', label: 'Timeline', icon: Timeline },
  { key: 'coverage', label: 'Coverage', icon: Layers },
] as const

type TabKey = (typeof TABS)[number]['key']

export function ExplorePage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<ExperimentQuery>({
    q: searchParams.get('q') || undefined,
    platform: (searchParams.get('platform') as Platform) || undefined,
    tag: (searchParams.get('tag') as SafetyTag) || undefined,
    sort: 'relevance',
  })
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const fetcher = useCallback(() => client.listExperiments(query), [query])
  const { data, error, loading, reload } = useApi(fetcher, [query])

  const platforms = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const record of data ?? []) {
      counts[record.platform] = (counts[record.platform] || 0) + 1
    }
    return counts
  }, [data])

  const tags = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const record of data ?? []) {
      for (const t of record.safety_tags) {
        counts[t] = (counts[t] || 0) + 1
      }
    }
    return counts
  }, [data])

  const byYear = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const record of data ?? []) {
      if (record.year !== null) {
        counts[record.year] = (counts[record.year] || 0) + 1
      }
    }
    return counts
  }, [data])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Research Explorer</h1>
          <p className="text-sm text-slate-400">
            Search, filter, and explore microgravity combustion experiment records.
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

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-ember-500 text-ember-300'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} className="mr-2" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab data={data ?? []} loading={loading} error={error} platforms={platforms} tags={tags} byYear={byYear} />
      )}

      {activeTab === 'experiments' && (
        <ExperimentsTab
          query={query}
          setQuery={setQuery}
          data={data}
          loading={loading}
          error={error}
          reload={reload}
        />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab data={data ?? []} loading={loading} error={error} />
      )}

      {activeTab === 'coverage' && (
        <CoverageTab
          loading={loading}
          error={error}
          platforms={platforms}
          tags={tags}
        />
      )}
    </div>
  )
}

function OverviewTab({
  data,
  loading,
  error,
  platforms,
  tags,
  byYear,
}: {
  data: typeof MOCK_EXPERIMENTS
  loading: boolean
  error: string | null
  platforms: Record<string, number>
  tags: Record<string, number>
  byYear: Record<number, number>
}) {
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <PlatformChart title="Safety relevance by platform" subtitle="Mean safety relevance score across records">
            <ScoreByPlatformChart records={data} />
          </PlatformChart>
          <PlatformChart title="O₂ fraction vs safety relevance" subtitle="Oxygen concentration against scored relevance">
            <O2VsScoreChart records={data} />
          </PlatformChart>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Dataset snapshot</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total records</span>
              <span className="font-mono text-slate-200">{data.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Platforms</span>
              <span className="font-mono text-slate-200">{Object.keys(platforms).length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Safety tags</span>
              <span className="font-mono text-slate-200">{Object.keys(tags).length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Year range</span>
              <span className="font-mono text-slate-200">
                {data.length > 0 ? `${Math.min(...data.map((r) => r.year ?? 0))} – ${Math.max(...data.map((r) => r.year ?? 0))}` : '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Records by year</h3>
          <div className="space-y-2">
            {Object.entries(byYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, count]) => (
                <div key={year} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{year}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1/3 rounded-full bg-white/10" />
                    <span className="font-mono text-slate-200">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExperimentsTab({
  query,
  setQuery,
  data,
  loading,
  error,
  reload,
}: {
  query: ExperimentQuery
  setQuery: (next: ExperimentQuery) => void
  data: typeof MOCK_EXPERIMENTS | null
  loading: boolean
  error: string | null
  reload: () => void
}) {
  return (
    <div className="space-y-5">
      <FilterBar query={query} onChange={setQuery} />

      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <p className="text-xs text-slate-500">{data.length} record(s) match your filters</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-ember-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    to={`/app/research/experiments/${record.id}`}
                    className="text-sm font-semibold text-slate-200 hover:text-ember-300 line-clamp-1"
                  >
                    {record.title}
                  </Link>
                  <span className="text-[10px] font-mono text-slate-500">{record.id.replace('mock-', '')}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{record.ai_summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="text-slate-300">{record.platform}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-300">{formatYear(record.year)}</span>
                  </div>
                  <span className="text-xs font-medium text-ember-400">{record.safety_relevance_score.toFixed(0)}/100</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {record.safety_tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {data.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-slate-500">No experiments match those filters. Try clearing the search.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function TimelineTab({
  data,
  loading,
  error,
}: {
  data: typeof MOCK_EXPERIMENTS
  loading: boolean
  error: string | null
}) {
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  const sorted = useMemo(
    () => [...data].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    [data],
  )

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Research timeline</h3>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10" />
          {sorted.map((record) => (
            <div key={record.id} className="relative pl-10 pb-6 last:pb-0">
              <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white/10 bg-void-950" />
              <div className="absolute left-0 top-1 w-1 h-1 rounded-full bg-ember-500" />
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-mono text-slate-400">{record.year ?? 'unknown'}</span>
                <span className="text-ember-500/50">{record.platform}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{record.title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{record.ai_summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CoverageTab({
  loading,
  error,
  platforms,
  tags,
}: {
  loading: boolean
  error: string | null
  platforms: Record<string, number>
  tags: Record<string, number>
}) {
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Platform coverage</h3>
        <div className="space-y-3">
          {PLATFORMS.map((platform) => {
            const count = platforms[platform] || 0
            return (
              <div key={platform} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{platform}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-ember-500" style={{ width: `${Math.min((count / Math.max(...Object.values(platforms)), 1) * 100)}%` }} />
                  </div>
                  <span className="font-mono text-slate-200">{count}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Safety tag coverage</h3>
        <div className="space-y-2">
          {SAFETY_TAGS.map((tag) => {
            const count = tags[tag] || 0
            return (
              <div key={tag} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 capitalize">{tag}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-ember-500" style={{ width: `${Math.min((count / Math.max(...Object.values(tags)), 1) * 100)}%` }} />
                  </div>
                  <span className="font-mono text-slate-200">{count}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
