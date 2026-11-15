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
 * Tooltip used by every chart. Recharts injects the data, so pages only pass a
 * unit label.
 *
 * It uses the overlay surface rather than a plain fill so it reads as a floating
 * sheet, but because it renders inside a chart's glass panel, theme.css drops its
 * blur (never stack two backdrop-filters) and it falls back to the near-solid
 * warm fill, which keeps the numbers legible over any data point behind them.
 */
export function FlatTooltip({ title, subtitle, rows = [], note }: FlatTooltipProps) {
  return (
    <div className="ig-glass-overlay min-w-[9rem] rounded-control px-3 py-2 text-xs">
      {title ? <p className="font-semibold text-ig-frost">{title}</p> : null}
      {subtitle ? <p className="text-ig-muted">{subtitle}</p> : null}
      {rows.length > 0 ? (
        <dl className="mt-1 space-y-0.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-ig-muted">{row.label}</dt>
              <dd className="font-mono tabular-nums text-ig-frost">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {note ? <p className="mt-1 max-w-[14rem] text-ig-muted">{note}</p> : null}
    </div>
  )
}
