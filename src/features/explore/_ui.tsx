import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Confidence, GravityRegime } from '@/contracts/types'
import { regimeStyle } from '@/components/charts/chartTheme'

/** Temporary primitives until PC3's design-system exports exist. */
const CONFIDENCE: Record<Confidence, { label: string; color: string; explanation: string }> = {
  verified: {
    label: 'Verified',
    color: 'var(--ig-quench, #8DBF6A)',
    explanation: 'Retrieved from a cited NASA source.',
  },
  curated: {
    label: 'Curated',
    color: 'var(--ig-amber, #F5B942)',
    explanation: 'Summarized from a cited source by the team.',
  },
  illustrative: {
    label: 'Illustrative',
    color: 'var(--ig-muted, #B3A394)',
    explanation: 'Placeholder record. Not a NASA finding.',
  },
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const entry = CONFIDENCE[confidence]
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-hull)] px-1.5 py-0.5 text-xs text-[var(--ig-frost)]"
      title={entry.explanation}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: entry.color }}
      />
      {entry.label}
    </span>
  )
}

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

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-[var(--ig-flame-blue)] text-[var(--ig-vacuum)] hover:bg-[var(--ig-amber)]',
  secondary:
    'border border-[var(--ig-line)] bg-transparent text-[var(--ig-frost)] hover:bg-[var(--ig-raised)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--ig-muted)] hover:bg-[var(--ig-raised)] hover:text-[var(--ig-frost)]',
}

export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function UiButton({ variant = 'secondary', className = '', type = 'button', ...rest }: UiButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[4px] px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)] disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_STYLES[variant]} ${className}`}
      {...rest}
    />
  )
}

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

export function EmptyPanel({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] px-6 py-10 text-center">
      <p className="text-sm font-semibold text-[var(--ig-frost)]">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ig-muted)]">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
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
        <div
          className="h-full bg-[var(--ig-flame-blue)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {note ? <p className="mt-1 text-[11px] text-[var(--ig-muted)]">{note}</p> : null}
    </div>
  )
}

export function SkeletonBlock({ className = 'h-4 w-full' }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-[2px] bg-[var(--ig-raised)] ${className}`} />
}
