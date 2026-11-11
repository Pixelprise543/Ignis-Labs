import { scoreTone } from '../lib/format'

export function ScoreBadge({ score, label }: { score: number; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreTone(score)}`}
      title={label ?? 'Safety relevance score (0-100)'}
    >
      {Math.round(score)}
      <span className="text-[10px] font-normal opacity-70">/100</span>
    </span>
  )
}
