import { useCallback, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { BarChart3, ShieldCheck, Microscope, Flame } from 'lucide-react'
import { RankingsPage } from './RankingsPage'
import { ComparePage } from './ComparePage'
import { MaterialsView } from './MaterialsView'
import { SimulatorView } from './SimulatorView'

const TABS = [
  { key: 'rankings', label: 'Rankings', icon: BarChart3 },
  { key: 'compare', label: 'Compare', icon: ShieldCheck },
  { key: 'materials', label: 'Materials', icon: Microscope },
  { key: 'simulator', label: 'Simulator', icon: Flame },
] as const

type TabKey = (typeof TABS)[number]['key']

export function AnalysisWorkspace() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get('tab') as TabKey) || 'rankings',
  )

  const setTab = useCallback(
    (next: TabKey) => {
      setActiveTab(next)
      const params = new URLSearchParams(searchParams)
      params.set('tab', next)
      navigate(`?${params.toString()}`, { replace: true })
    },
    [searchParams, navigate],
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Analysis Workspace</h1>
          <p className="text-sm text-slate-400">
            Unified environment for scientific analysis — rankings, comparison, materials, and simulation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="flex gap-1 border-b border-white/10">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
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
        <div className="p-5">
          {activeTab === 'rankings' && <RankingsPage />}
          {activeTab === 'compare' && <ComparePage />}
          {activeTab === 'materials' && <MaterialsView />}
          {activeTab === 'simulator' && <SimulatorView />}
        </div>
      </div>
    </div>
  )
}
