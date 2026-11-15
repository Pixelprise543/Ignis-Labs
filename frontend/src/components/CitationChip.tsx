import { Link } from 'react-router-dom'

export function CitationChip({ id, title }: { id: string; title?: string }) {
  return (
    <Link
      to={`/experiments/${id}`}
      title={title ?? id}
      className="inline-flex items-center gap-1 rounded-full border border-ember-500/40 bg-ember-500/10 px-2 py-0.5 font-mono text-xs text-ember-300 hover:bg-ember-500/20"
    >
      [{id}]
    </Link>
  )
}
