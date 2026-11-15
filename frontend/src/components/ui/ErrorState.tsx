export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card border-red-500/30 bg-red-500/5" role="alert">
      <p className="text-sm font-medium text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
