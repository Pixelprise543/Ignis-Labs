interface PlatformTableProps {
  columns: { key: string; label: string }[]
  data: Record<string, unknown>[]
  className?: string
}

export function PlatformTable({ columns, data, className }: PlatformTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-500 text-center">No records found.</p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-white/10 ${className || ''}`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {columns.map((column) => (
              <th
                key={column.key}
                className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-white/5 ${
                rowIndex % 2 === 1 ? 'bg-white/5' : ''
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="p-3 text-slate-300 align-top"
                >
                  {String(row[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
