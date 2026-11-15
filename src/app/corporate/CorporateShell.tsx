import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { CORPORATE_ROUTES, PLATFORM_HOME } from "../nav";
import { Logo } from "@/design-system";

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2 rounded-control px-3 py-2 hover:bg-ig-glass-hover">
      <Logo size={32} />
    </NavLink>
  );
}

function NavLinkItem({ route }: { route: typeof CORPORATE_ROUTES[number] }) {
  const Icon = route.icon;
  return (
    <NavLink to={route.path} end={route.path === "/"} className={({ isActive }: { isActive: boolean }) =>
      `relative flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors ${isActive ? "bg-ig-glass-pressed text-ig-flame-blue" : "text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost"}`}>
      <Icon size={15} aria-hidden="true" className="shrink-0" />
      <span>{route.label}</span>
    </NavLink>
  );
}

/**
 * Marketing chrome for the corporate pages. "Open platform" is the single
 * entry point into the research app and always lands on the mission overview,
 * never on a deep view.
 */
export function CorporateShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-dvh">
      <header className="ig-glass-nav ig-glass--borderless sticky top-0 z-20 border-b border-ig-line">
        <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-6 lg:py-2.5">
          <div className="flex items-center gap-5">
            <Brand />
            <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
              {CORPORATE_ROUTES.map((route) => <NavLinkItem key={route.path} route={route} />)}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to={PLATFORM_HOME}
              className="hidden h-8 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-xs font-medium text-ig-on-accent hover:bg-ig-amber lg:inline-flex"
            >
              <Sparkles size={13} aria-hidden="true" />
              Open platform
            </NavLink>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
          <div aria-hidden="true" className="ig-glass-scrim absolute inset-0" onClick={() => setMenuOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Menu" className="ig-glass-overlay relative m-3 max-h-[85dvh] overflow-y-auto rounded-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ig-frost">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {CORPORATE_ROUTES.map((route) => {
                const Icon = route.icon;
                return (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    end={route.path === "/"}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-10 items-center gap-2.5 rounded-control px-3 text-sm font-medium text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost"
                  >
                    <Icon size={15} aria-hidden="true" />
                    {route.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="mt-5 border-t border-ig-line pt-4">
              <NavLink
                to={PLATFORM_HOME}
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-ig-flame-blue text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
              >
                Open platform
                <ArrowRight size={15} aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </div>
      ) : null}

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 lg:px-6 lg:pt-8">
        {children}
      </main>

      <footer className="mx-auto mt-16 w-full max-w-[1200px] border-t border-ig-line px-4 pt-6 text-[11px] leading-5 text-ig-muted lg:px-6">
        <p>Ignis Labs is decision support. Scores, material risks and simulator output are estimates from cited experiments, not physics simulations. Check every badge and source before you rely on a number.</p>
        <p className="mt-1">Built for NASA Space Apps 2026 &#8220;Flame in Freefall&#8221;.</p>
      </footer>
    </div>
  );
}
