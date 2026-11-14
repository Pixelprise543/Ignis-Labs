import type { ReactNode } from 'react'
import type { GravityRegime } from '@/contracts/types'
import { regimeStyle } from '@/components/charts/chartTheme'

/**
 * Small layout helpers shared by the PC2 pages. Interactive primitives come
 * from "@/design-system"; these are only page-level composition pieces that the
 * design system does not provide.
 */

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-[var(--ig-frost)]">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ig-muted)]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Note({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'caution' }) {
  const accent = tone === 'caution' ? 'var(--ig-amber)' : 'var(--ig-flame-blue)'
  return (
    <div
      className="rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-hull)] px-3 py-2 text-xs leading-relaxed text-[var(--ig-muted)]"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      {children}
    </div>
  )
}

export function ScoreBar({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-[var(--ig-muted)]">{label}</span>
        <span className="font-mono tabular-nums text-[var(--ig-frost)]">{Math.round(clamped)}</span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-[2px] bg-[var(--ig-vacuum)]"
        role="img"
        aria-label={`${label}: ${Math.round(clamped)} of 100`}
      >
        <div className="h-full bg-[var(--ig-flame-blue)]" style={{ width: `${clamped}%` }} />
      </div>
      {note ? <p className="mt-1 text-[11px] text-[var(--ig-muted)]">{note}</p> : null}
    </div>
  )
}

/** Regime identity = colour + marker shape (same shapes the charts use). */
export function RegimeBadge({ regime }: { regime: GravityRegime }) {
  const style = regimeStyle(regime)
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--ig-frost)]">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        {style.shape === 'diamond' ? (
          <polygon points="5,0 10,5 5,10 0,5" fill={style.color} />
        ) : style.shape === 'square' ? (
          <rect x="0.5" y="0.5" width="9" height="9" fill={style.color} />
        ) : (
          <circle cx="5" cy="5" r="4.5" fill={style.color} />
        )}
      </svg>
      {style.label}
    </span>
  )
}
