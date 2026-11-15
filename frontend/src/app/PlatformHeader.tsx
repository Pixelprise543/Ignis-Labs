import { ScenarioControls } from './ScenarioControls'

interface PlatformHeaderProps {
  onAskIgnis?: () => void
  onUserAction?: () => void
  atmosphere?: { o2_percent: number | null; pressure_kpa: number | null; flow_cm_s: number | null }
}

export function PlatformHeader({
  onAskIgnis,
  onUserAction,
  atmosphere,
}: PlatformHeaderProps = {}) {
  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-white/10 bg-void-950/95 backdrop-blur-md">
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col items-start gap-1">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ember-400">Ignis Labs Platform</p>
          <h1 className="text-sm font-semibold text-slate-100">Mission control</h1>
        </div>

        <ScenarioControls atmosphere={atmosphere} />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAskIgnis}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            Ask Ignis
          </button>
          <button
            type="button"
            onClick={onUserAction}
            aria-label="User actions"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          >
            <span className="sr-only">User actions</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M7 12c0-1.608 1.486-3 3-3s3 1.392 3 3-1.486 3-3 3-3-1.392-3-3Z" />
              <path d="M17 12c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
