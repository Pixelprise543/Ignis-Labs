import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Flame, BarChart3, Microscope, Sparkles, ShieldCheck, ArrowRight, Layers } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../api/mock/experiments.mock'
import { formatAtmosphere, formatYear } from '../../lib/format'
import { ScenarioControls } from '../../app/ScenarioControls'
import { PlatformChart } from './shared/PlatformChart'
import { SeverityBadge } from './shared/SeverityBadge'

const SCENARIO_LABELS: Record<string, string> = {
  ISS: 'International Space Station',
  Lunar: 'Lunar Gateway / Surface',
  Martian: 'Mars Transit / Surface',
  EVA: 'Extravehicular Activity',
  Custom: 'Custom parameters',
}

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const scenario = searchParams.get('scenario') || 'ISS'

  const experiments = useMemo(() => MOCK_EXPERIMENTS, [])
  const topExperiments = useMemo(
    () => [...experiments].sort((a, b) => b.safety_relevance_score - a.safety_relevance_score).slice(0, 4),
    [experiments],
  )

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, caution: 0, info: 0 }
    for (const record of experiments) {
      const score = record.safety_relevance_score
      if (score >= 85) counts.critical++
      else if (score >= 70) counts.high++
      else if (score >= 55) counts.caution++
      else counts.info++
    }
    return counts
  }, [experiments])

  const platforms = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const record of experiments) {
      counts[record.platform] = (counts[record.platform] || 0) + 1
    }
    return counts
  }, [experiments])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Research command center — monitor active scenario, key insights, and recommended workflows.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors"
        >
          <ArrowRight size={14} className="-mr-1" aria-hidden="true" />
          Return to website
        </Link>
      </div>

      {/* Active Scenario */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Active scenario</h3>
          <Link
            to="/app/research"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-ember-400 hover:text-ember-300"
          >
            Open in Research Explorer <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <ScenarioControls
          onChange={() => {}}
          atmosphere={{
            o2_percent: 21,
            pressure_kpa: 101.3,
            flow_cm_s: 5,
          }}
        />
        <p className="mt-3 text-[10px] text-slate-500">
          {SCENARIO_LABELS[scenario] || scenario} &middot; {formatAtmosphere({ o2_percent: 21, pressure_kpa: 101.3, flow_cm_s: 5 })}
        </p>
      </div>

      {/* Key Research Insights */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Key insights</h3>
            <SeverityBadge severity="high" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center shrink-0">
                <Flame size={18} className="text-ember-400" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 leading-relaxed">
                  Flame spread over PMMA shows quenching near 2 cm/s in microgravity — directly constrains
                  minimum ventilation assumptions for cabin design.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-mono">mock-flame-spread-pmma</span> &middot; ISS &middot; 2019
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Data coverage</h3>
            <span className="text-[10px] font-mono text-slate-400">{experiments.length} records</span>
          </div>
          <div className="space-y-3">
            {Object.entries(platforms).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{platform}</span>
                <span className="text-slate-200 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Severity distribution</h3>
            <span className="text-[10px] font-mono text-slate-400">{experiments.length} scored</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-ember-500/20 border border-ember-500/40" />
                <span className="text-ember-300">Critical (85+)</span>
              </span>
              <span className="font-mono text-slate-200">{severityCounts.critical}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                <span className="text-amber-300">High (70+)</span>
              </span>
              <span className="font-mono text-slate-200">{severityCounts.high}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white/5 border border-white/10" />
                <span className="text-slate-400">Caution (55+)</span>
              </span>
              <span className="font-mono text-slate-200">{severityCounts.caution}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <PlatformChart title="Safety relevance by platform" subtitle="Mean score across all records in this scenario">
          <BarChart3 size={14} className="mr-2 text-slate-400" aria-hidden="true" />
        </PlatformChart>
        <PlatformChart title="O₂ fraction vs safety relevance" subtitle="Oxygen concentration against scored relevance">
          <Microscope size={14} className="mr-2 text-slate-400" aria-hidden="true" />
        </PlatformChart>
      </div>

      {/* Recommended Actions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Recommended actions</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Link
            to="/app/research"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <BarChart3 size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>Browse experiments</span>
          </Link>
          <Link
            to="/app/analysis?tab=rankings"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <ShieldCheck size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>View rankings</span>
          </Link>
          <Link
            to="/app/analysis?tab=compare"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <Layers size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>Compare experiments</span>
          </Link>
          <Link
            to="/app/insights"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <Sparkles size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>Ask Ignis</span>
          </Link>
          <Link
            to="/app/mission"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <ShieldCheck size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>Mission brief</span>
          </Link>
          <Link
            to="/app/docs"
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:border-ember-500/50 transition-colors group"
          >
            <Flame size={16} className="text-ember-400 group-hover:text-ember-300" aria-hidden="true" />
            <span>Documentation</span>
          </Link>
        </div>
      </div>

      {/* Featured Experiments */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Featured experiments</h3>
          <Link
            to="/app/research"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-ember-400 hover:text-ember-300"
          >
            View all {experiments.length} records <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topExperiments.map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-ember-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-slate-500">{record.id.replace('mock-', '')}</span>
                <SeverityBadge
                  severity={record.safety_relevance_score >= 85 ? 'critical' : record.safety_relevance_score >= 70 ? 'high' : record.safety_relevance_score >= 55 ? 'caution' : 'info'}
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1 line-clamp-1">{record.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{record.ai_summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {record.platform} &middot; {formatYear(record.year)}
                </span>
                <Link
                  to={`/app/research/experiments/${record.id}`}
                  className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
                >
                  Open <ArrowRight size={10} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
