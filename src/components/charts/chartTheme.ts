import type { GravityRegime } from '@/contracts/types'

export type MarkerShape = 'circle' | 'diamond' | 'square'

export interface RegimeStyle {
  key: GravityRegime
  label: string
  /** Warm token with a hex fallback so SVG attributes still resolve. */
  color: string
  shape: MarkerShape
  short: string
}

/**
 * Regime identity is color + shape + label, never color alone.
 * Gold and amber sit close in hue, so microgravity is always a circle,
 * partial-g a diamond, and normal-g a square.
 */
export const REGIME_STYLES: RegimeStyle[] = [
  {
    key: 'microgravity',
    label: 'Microgravity',
    short: 'µg',
    color: 'var(--ig-flame-blue, #E8A24A)',
    shape: 'circle',
  },
  {
    key: 'partial-g',
    label: 'Partial gravity',
    short: 'partial-g',
    color: 'var(--ig-quench, #8DBF6A)',
    shape: 'diamond',
  },
  {
    key: 'normal-g',
    label: 'Normal gravity',
    short: '1g',
    color: 'var(--ig-amber, #F5B942)',
    shape: 'square',
  },
]

export function regimeStyle(key: GravityRegime): RegimeStyle {
  return REGIME_STYLES.find((r) => r.key === key) ?? REGIME_STYLES[0]
}

/** Shared flat chart tokens. No gradients, glows, blurs or shadows anywhere. */
export const CHART_TOKENS = {
  axis: 'var(--ig-muted, #B3A394)',
  grid: 'var(--ig-line, #40362D)',
  line: 'var(--ig-line, #40362D)',
  text: 'var(--ig-frost, #F6EFE6)',
  surface: 'var(--ig-hull, #231D18)',
  raised: 'var(--ig-raised, #2E2620)',
  sans: "'Inter Variable', Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
} as const

/** Series order for multi-experiment charts (radar). Distinguishable without fill. */
export const SERIES_STYLES = [
  { color: 'var(--ig-frost, #F6EFE6)', dash: '0' },
  { color: 'var(--ig-flame-blue, #E8A24A)', dash: '6 4' },
  { color: 'var(--ig-quench, #8DBF6A)', dash: '2 3' },
] as const
