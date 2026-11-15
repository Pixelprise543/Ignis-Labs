export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-slate-400" role="status">
      <span className="h-3 w-3 animate-pulse rounded-full bg-ember-500" />
      {label}
    </div>
  )
}
