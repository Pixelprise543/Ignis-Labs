import type { GravityRegime } from '@/contracts/types'
import { CHART_TOKENS, REGIME_STYLES, type MarkerShape } from './chartTheme'

interface GlyphProps {
  shape: MarkerShape
  color: string
  cx: number
  cy: number
  size: number
}

function MarkerGlyph({ shape, color, cx, cy, size }: GlyphProps) {
  const r = size / 2
  if (shape === 'diamond') {
    return (
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
        fill={color}
      />
    )
  }
  if (shape === 'square') {
    return <rect x={cx - r} y={cy - r} width={size} height={size} fill={color} />
  }
  return <circle cx={cx} cy={cy} r={r} fill={color} />
}

interface RegimeDotProps {
  cx?: number
  cy?: number
  fill?: string
  shape?: MarkerShape
  size?: number
}

/** Recharts clones this element and injects cx/cy/fill for each scatter point. */
export function RegimeDot({ cx = 0, cy = 0, fill, shape = 'circle', size = 9 }: RegimeDotProps) {
  return (
    <MarkerGlyph
      shape={shape}
      color={fill ?? CHART_TOKENS.text}
      cx={cx}
      cy={cy}
      size={size}
    />
  )
}

export function RegimeLegend({ regimes }: { regimes: GravityRegime[] }) {
  const present = REGIME_STYLES.filter((r) => regimes.includes(r.key))
  if (present.length === 0) return null

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ig-muted)]" aria-label="Legend: gravity regime marker shapes">
      {present.map((regime) => (
        <li key={regime.key} className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <MarkerGlyph shape={regime.shape} color={regime.color} cx={6} cy={6} size={9} />
          </svg>
          <span>{regime.label}</span>
        </li>
      ))}
    </ul>
  )
}
