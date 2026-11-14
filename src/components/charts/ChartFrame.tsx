import type { ReactNode } from 'react'

export interface ChartTable {
  columns: string[]
  rows: Array<Array<string | number>>
}

export interface ChartFrameProps {
  title: string
  /** One sentence read by screen readers and shown under the title. */
  summary: string
  table?: ChartTable
  empty?: boolean
  emptyMessage?: string
  minHeight?: number
  children?: ReactNode
}

/**
 * Every chart ships with a text summary and an optional data-table toggle so
 * the information never depends on color or on a mouse hover.
 */
export function ChartFrame({
  title,
  summary,
  table,
  empty = false,
  emptyMessage = 'No data to chart yet.',
  minHeight = 260,
  children,
}: ChartFrameProps) {
  const hasTable = Boolean(table && table.rows.length > 0)

  return (
    <figure className="rounded-[6px] border border-[var(--ig-line)] bg-[var(--ig-hull)] p-4">
      <figcaption className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--ig-frost)]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ig-muted)]">{summary}</p>
      </figcaption>

      {empty ? (
        <div
          className="flex items-center justify-center rounded-[4px] border border-[var(--ig-line)] bg-[var(--ig-vacuum)] px-4 text-center text-xs text-[var(--ig-muted)]"
          style={{ minHeight }}
          role="status"
        >
          {emptyMessage}
        </div>
      ) : (
        <div role="img" aria-label={summary}>
          {children}
        </div>
      )}

      {hasTable && table ? (
        <details className="mt-3">
          <summary className="w-fit cursor-pointer rounded-[4px] px-1 py-0.5 text-xs text-[var(--ig-frost)] underline decoration-[var(--ig-line)] underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-frost)]">
            View data table
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-[var(--ig-line)] px-2 py-1.5 font-medium text-[var(--ig-muted)]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={`border-b border-[var(--ig-line)] px-2 py-1.5 text-[var(--ig-frost)] ${
                          typeof cell === 'number' ? 'font-mono tabular-nums' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </figure>
  )
}
