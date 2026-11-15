import { Link, NavLink } from 'react-router-dom';
import { colors } from '../design-system/tokens/colors';

interface CorporateHeaderProps {
  onMenuToggle: () => void;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/product', label: 'Product' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

export function CorporateHeader({ onMenuToggle }: CorporateHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-void-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            style={{ color: colors.semantic.textPrimary }}
          >
            <span className="text-xl font-bold tracking-tight">IGNIS</span>
            <span className="text-xs uppercase tracking-wider text-ember-400">Labs</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? `bg-ember-500/10 text-ember-300`
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link
              to="/app"
              className="hidden md:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-ember-500/30 bg-ember-500/10 text-ember-300 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-ember-500/20 hover:text-ember-200"
            >
              Launch Platform
              <svg
                className="w-3 h-3 ml-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
