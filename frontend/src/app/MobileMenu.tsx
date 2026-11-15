import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/product', label: 'Product' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-void-950/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-80 bg-void-900 border-l border-white/10 transform transition-transform duration-300 sm:translate-x-0 translate-x-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <span className="text-lg font-bold tracking-tight">
            IGNIS<span className="text-ember-400">Labs</span>
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="px-6 py-6 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ember-500/10 text-ember-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-6 border-t border-white/5">
          <a
            href="/app"
            className="block w-full text-center px-4 py-3 rounded-md border border-ember-500/30 bg-ember-500/10 text-ember-300 text-xs font-semibold uppercase tracking-wider hover:bg-ember-500/20 hover:text-ember-200"
          >
            Launch Platform
          </a>
        </div>
      </div>
    </div>
  );
}
