import type { EnrichedExperiment } from '../../api/types'

export function ScoreByPlatformChart({ records }: { records: EnrichedExperiment[] }) {
  const buckets = new Map<string, { total: number; count: number }>()
  for (const record of records) {
    const bucket = buckets.get(record.platform) ?? { total: 0, count: 0 }
    bucket.total += record.safety_relevance_score
    bucket.count += 1
    buckets.set(record.platform, bucket)
  }

  const rows = [...buckets.entries()]
    .map(([platform, { total, count }]) => ({ platform, average: total / count, count }))
    .sort((a, b) => b.average - a.average)

  if (!rows.length) return null
  const max = Math.max(...rows.map((row) => row.average), 1)

  return (
    <section className="card">
      <h2 className="text-sm font-semibold text-slate-200">Mean safety relevance by platform</h2>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.platform} className="text-xs text-slate-400">
            <div className="flex justify-between">
              <span>{row.platform}</span>
              <span className="font-mono text-slate-300">
                {row.average.toFixed(0)} · n={row.count}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-ember-500"
                style={{ width: `${(row.average / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
