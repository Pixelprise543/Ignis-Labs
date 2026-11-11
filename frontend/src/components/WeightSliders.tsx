import type { Weights } from '../api/types'

export const DEFAULT_WEIGHTS: Weights = { relevance: 0.5, confidence: 0.3, recency: 0.2 }

const FIELDS: { key: keyof Weights; label: string; hint: string }[] = [
  { key: 'relevance', label: 'Relevance', hint: 'safety relevance score' },
  { key: 'confidence', label: 'Confidence', hint: 'data completeness' },
  { key: 'recency', label: 'Recency', hint: 'publication year' },
]

export function WeightSliders({
  weights,
  onChange,
}: {
  weights: Weights
  onChange: (next: Weights) => void
}) {
  const total = weights.relevance + weights.confidence + weights.recency

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Ranking weights</h2>
        <span className={`text-xs ${Math.abs(total - 1) < 0.01 ? 'text-slate-400' : 'text-amber-300'}`}>
          sum {total.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="flex items-baseline justify-between text-xs text-slate-400">
              <span>
                {field.label} <span className="opacity-60">({field.hint})</span>
              </span>
              <span className="font-mono text-slate-200">{weights[field.key].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={weights[field.key]}
              onChange={(event) =>
                onChange({ ...weights, [field.key]: Number(event.target.value) })
              }
              className="mt-1 w-full accent-ember-500"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_WEIGHTS)}
        className="mt-4 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
      >
        Reset to contract defaults
      </button>
    </div>
  )
}
