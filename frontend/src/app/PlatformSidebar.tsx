import { NavLink } from 'react-router-dom'

interface PlatformSidebarItem {
  to: string
  label: string
}

const PLATFORM_NAV: PlatformSidebarItem[] = [
  { to: '/app/research', label: 'Research Explorer' },
  { to: '/app/analysis', label: 'Analysis Workspace' },
  { to: '/app/insights', label: 'Scientific Insights' },
  { to: '/app/mission', label: 'Mission Intelligence' },
  { to: '/app/docs', label: 'Documentation' },
]

const baseItemClasses =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition'

const activeItemClasses =
  'bg-white/5 border border-ember-500/30 text-ember-300'

const inactiveItemClasses =
  'text-slate-400 hover:bg-white/5 hover:text-slate-200'

export function PlatformSidebar() {
  return (
    <aside className="hidden md:flex flex-col border-r border-white/10 bg-void-900">
      <div className="flex flex-col h-full">
        <div className="flex shrink-0 items-center gap-2 px-5 py-4 border-b border-white/10">
          <span className="rounded-md bg-ember-600/20 px-2 py-0.5 text-[0.65rem] font-semibold text-ember-300 tracking-tighter uppercase">
            IG
          </span>
          <span className="text-sm font-semibold text-slate-100 tracking-tight">Ignis Labs</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {PLATFORM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/research'}
              className={({ isActive }) =>
                `${baseItemClasses} ${isActive ? activeItemClasses : inactiveItemClasses}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-4">
          <p className="text-[0.65rem] text-slate-500">Platform v2 · Stage 2</p>
        </div>
      </div>
    </aside>
  )
}
