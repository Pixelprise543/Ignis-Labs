import type { GravityRegime } from '@/contracts/types'

export type MarkerShape = 'circle' | 'diamond' | 'square'

export interface RegimeStyle {
  key: GravityRegime
  label: string
  /** Theme token; the palette owns the actual colour. */
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
    color: 'var(--ig-flame-blue)',
    shape: 'circle',
  },
  {
    key: 'partial-g',
    label: 'Partial gravity',
    short: 'partial-g',
    color: 'var(--ig-quench)',
    shape: 'diamond',
  },
  {
    key: 'normal-g',
    label: 'Normal gravity',
    short: '1g',
    color: 'var(--ig-amber)',
    shape: 'square',
  },
]

export function regimeStyle(key: GravityRegime): RegimeStyle {
  return REGIME_STYLES.find((r) => r.key === key) ?? REGIME_STYLES[0]
}

/** Shared flat chart tokens. No gradients, glows, blurs or shadows anywhere. */
export const CHART_TOKENS = {
  axis: 'var(--ig-muted, #6b5b4b)',
  grid: 'var(--ig-line, #d6c9b8)',
  line: 'var(--ig-line, #d6c9b8)',
  text: 'var(--ig-frost, #221b15)',
  surface: 'var(--ig-hull, #fffcf8)',
  raised: 'var(--ig-raised, #ebe2d6)',
  sans: "'Inter Variable', Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
} as const

/**
 * Chart canvases fill the panel width at every breakpoint and scale height with
 * the viewport. Charts previously took a fixed pixel height, which left dead
 * space beside and below the plot on wide screens and squashed it on phones.
 */
export const CHART_CANVAS = 'h-[clamp(220px,24vw,360px)] w-full'
export const CHART_CANVAS_TALL = 'h-[clamp(260px,30vw,420px)] w-full'

/** Series order for multi-experiment charts (radar). Distinguishable without fill. */
export const SERIES_STYLES = [
  { color: 'var(--ig-frost)', dash: '0' },
  { color: 'var(--ig-flame-blue)', dash: '6 4' },
  { color: 'var(--ig-quench)', dash: '2 3' },
] as const
