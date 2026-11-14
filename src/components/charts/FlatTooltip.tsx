interface TooltipRow {
  label: string
  value: string
}

export interface FlatTooltipProps {
  title?: string
  subtitle?: string
  rows?: TooltipRow[]
  note?: string
}

/**
 * Flat tooltip used by every chart: 1px border, raised fill, no shadow.
 * Recharts injects the data, so pages only pass a unit label.
 */
export function FlatTooltip({ title, subtitle, rows = [], note }: FlatTooltipProps) {
  return (
    <div className="min-w-[9rem] rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-raised)] px-3 py-2 text-xs">
      {title ? <p className="font-semibold text-[var(--ig-frost)]">{title}</p> : null}
      {subtitle ? <p className="text-[var(--ig-muted)]">{subtitle}</p> : null}
      {rows.length > 0 ? (
        <dl className="mt-1 space-y-0.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-[var(--ig-muted)]">{row.label}</dt>
              <dd className="font-mono tabular-nums text-[var(--ig-frost)]">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {note ? <p className="mt-1 max-w-[14rem] text-[var(--ig-muted)]">{note}</p> : null}
    </div>
  )
}
