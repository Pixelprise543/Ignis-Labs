import type { EnrichedExperiment } from '../../api/types'

const WIDTH = 320
const HEIGHT = 200
const PAD = 30

/**
 * O2 fraction (x) against safety relevance (y). CONTRACT.md has no flame-spread
 * field, so oxygen is the only atmospheric axis worth plotting.
 */
export function O2VsScoreChart({ records }: { records: EnrichedExperiment[] }) {
  const points = records.filter((record) => record.atmosphere.o2_percent !== null)
  if (!points.length) return null

  const x = (o2: number) => PAD + (Math.min(100, Math.max(0, o2)) / 100) * (WIDTH - 2 * PAD)
  const y = (score: number) => HEIGHT - PAD - (score / 100) * (HEIGHT - 2 * PAD)

  return (
    <section className="card">
      <h2 className="text-sm font-semibold text-slate-200">O₂ fraction vs safety relevance</h2>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-2 w-full" role="img">
        <title>Oxygen fraction against safety relevance score</title>
        <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="#334155" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="#334155" />
        {[0, 50, 100].map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={HEIGHT - PAD + 14}
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="9"
          >
            {tick}%
          </text>
        ))}
        {[0, 50, 100].map((tick) => (
          <text
            key={`y-${tick}`}
            x={PAD - 6}
            y={y(tick) + 3}
            textAnchor="end"
            className="fill-slate-500"
            fontSize="9"
          >
            {tick}
          </text>
        ))}
        {points.map((record) => (
          <circle
            key={record.id}
            cx={x(record.atmosphere.o2_percent ?? 0)}
            cy={y(record.safety_relevance_score)}
            r={5}
            className="fill-ember-500/80"
          >
            <title>
              {record.title} — O₂ {record.atmosphere.o2_percent}%, score{' '}
              {record.safety_relevance_score}
            </title>
          </circle>
        ))}
      </svg>
      <p className="mt-1 text-xs text-slate-500">{points.length} records with a known O₂ fraction</p>
    </section>
  )
}
