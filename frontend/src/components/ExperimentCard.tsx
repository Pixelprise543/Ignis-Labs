import { Link } from 'react-router-dom'
import type { EnrichedExperiment } from '../api/types'
import { formatYear } from '../lib/format'
import { ScoreBadge } from './ScoreBadge'

export function ExperimentCard({ record }: { record: EnrichedExperiment }) {
  return (
    <article className="card transition hover:border-ember-500/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/experiments/${record.id}`}
            className="text-base font-semibold text-slate-100 hover:text-ember-300"
          >
            {record.title}
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            {record.platform} · {formatYear(record.year)} · {record.fuel_material || 'material unknown'}
          </p>
        </div>
        <ScoreBadge score={record.safety_relevance_score} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-slate-300">{record.ai_summary}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {record.safety_tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
