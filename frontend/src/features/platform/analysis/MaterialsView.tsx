import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Microscope } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../../api/mock/experiments.mock'
import type { SafetyTag } from '../../../api/types'
import { ScoreBadge } from '../../../design-system/components/data-display/ScoreBadge'
import { formatYear } from '../../../lib/format'

const MATERIAL_TAGS: SafetyTag[] = [
  'material-selection',
  'flammability',
  'extinction',
  'suppression',
  'smoldering',
  'detection',
  'cabin-atmosphere',
  'flame-spread',
]

export function MaterialsView() {
  const experiments = useMemo(() => MOCK_EXPERIMENTS, [])

  const materialsByTag = useMemo(() => {
    const map: Record<string, typeof MOCK_EXPERIMENTS> = {}
    for (const tag of MATERIAL_TAGS) {
      map[tag] = experiments.filter((r) => r.safety_tags.includes(tag))
    }
    return map
  }, [experiments])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Material analysis</h1>
          <p className="text-sm text-slate-400">
            Explore cabin material flammability, extinction, and suppression data by safety focus area.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {MATERIAL_TAGS.map((tag) => renderTagSection(tag, materialsByTag[tag]))}
      </div>

      {/* Material data notes */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Microscope size={16} className="text-ember-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Material data notes
          </h3>
        </div>
        <ul className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <li>
            Material selection is the primary preventive control against cabin fire.
          </li>
          <li>
            Rankings from terrestrial tests do not transfer reliably to microgravity screening.
          </li>
          <li>
            Two of six candidate coupons in sounding rocket screening failed to self-extinguish.
          </li>
          <li>
            Microgravity material qualification should include microgravity-specific screening,
            not terrestrial pass/fail alone.
          </li>
        </ul>
      </div>
    </div>
  )
}

function renderTagSection(tag: SafetyTag, materials: typeof MOCK_EXPERIMENTS) {
  if (materials.length === 0) return null

  return (
    <div key={tag} className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-ember-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 capitalize">
              {tag}
            </h3>
            <p className="text-xs text-slate-500">{materials.length} record(s)</p>
          </div>
        </div>
        <Link
          to="/app/research"
          className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
        >
          Browse all
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {materials.slice(0, 6).map((record) => (
          <div
            key={record.id}
            className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-ember-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                to={`/app/research/experiments/${record.id}`}
                className="text-sm font-semibold text-slate-200 hover:text-ember-300 line-clamp-1"
              >
                {record.title}
              </Link>
              <ScoreBadge score={record.safety_relevance_score} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
              {record.ai_summary}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="font-mono">{record.platform}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-300">{formatYear(record.year)}</span>
            </div>
          </div>
        ))}
        {materials.length > 6 && (
          <div className="col-span-full text-center pt-3">
            <Link
              to="/app/research"
              className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
            >
              View all {materials.length} records
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
