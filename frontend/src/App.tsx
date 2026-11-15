import { NavLink, Route, Routes } from 'react-router-dom'
import { isMockMode } from './api/client'
import { ComparePage } from './pages/ComparePage'
import { DetailPage } from './pages/DetailPage'
import { ExperimentsPage } from './pages/ExperimentsPage'
import { InsightsPage } from './pages/InsightsPage'
import { RankingsPage } from './pages/RankingsPage'

const NAV = [
  { to: '/', label: 'Experiments', end: true },
  { to: '/rankings', label: 'Rankings', end: false },
  { to: '/compare', label: 'Compare', end: false },
  { to: '/insights', label: 'Insights', end: false },
]

export default function App() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ember-500">Ignis Labs</p>
          <h1 className="text-lg font-semibold text-slate-100">Microgravity fire safety</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 ${
                  isActive ? 'bg-ember-500/15 text-ember-300' : 'text-slate-400 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isMockMode ? (
            <span className="ml-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
              mock data
            </span>
          ) : null}
        </nav>
      </header>

      <main className="py-6">
        <Routes>
          <Route path="/" element={<ExperimentsPage />} />
          <Route path="/experiments/:id" element={<DetailPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route
            path="*"
            element={<p className="text-sm text-slate-400">Page not found.</p>}
          />
        </Routes>
      </main>
    </div>
  )
}
