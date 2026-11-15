import { NavLink } from "react-router-dom";
import { useState } from "react";
import { CORPORATE_ROUTES } from "../nav";
import { Button, ThemeToggle } from "@/design-system";

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2 rounded-control px-3 py-2 hover:bg-ig-hull">
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ig-line bg-ig-hull" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-ig-flame-blue" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-ig-frost">Ignis Labs</span>
        <span className="block text-[10px] leading-tight text-ig-muted uppercase tracking-wider">Scientific intelligence</span>
      </span>
    </NavLink>
  );
}

function NavLinkItem({ route }: { route: typeof CORPORATE_ROUTES[number] }) {
  const Icon = route.icon;
  return (
    <NavLink to={route.path} className={({ isActive }: { isActive: boolean }) =>
      `relative flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors ${isActive ? "bg-ig-hull text-ig-flame-blue" : "text-ig-muted hover:bg-ig-hull hover:text-ig-frost"}`}>
      <Icon size={15} aria-hidden="true" className="shrink-0" />
      <span>{route.label}</span>
    </NavLink>
  );
}

export function CorporateShell({ children }: { children: React.ReactNode }) {
  const [, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-ig-vacuum">
      <header className="border-b border-ig-line bg-ig-vacuum sticky top-0 z-20">
        <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-6 lg:py-2.5">
          <div className="flex items-center gap-5">
            <Brand />
            <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
              {CORPORATE_ROUTES.map((route) => <NavLinkItem key={route.path} route={route} />)}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" className="hidden lg:flex px-4 py-2">Launch Platform</Button>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>Menu</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <button type="button" onClick={() => setMenuOpen(true)} className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-control border border-ig-line bg-ig-hull text-ig-frost hover:bg-ig-raised lg:hidden" aria-label="Open menu">
        ☰
      </button>

      <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
        <div role="dialog" aria-modal="true" aria-label="Menu" className="relative max-h-[85dvh] overflow-y-auto border border-ig-line bg-ig-hull p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-ig-frost">Menu</p>
            <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-raised hover:text-ig-frost">✕</button>
          </div>
          <nav className="space-y-0.5">
            {CORPORATE_ROUTES.map((route) => {
              const Icon = route.icon;
              return <NavLink key={route.path} to={route.path} onClick={() => setMenuOpen(false)} className="flex min-h-10 items-center gap-2.5 rounded-control px-3 text-sm font-medium text-ig-muted hover:bg-ig-raised hover:text-ig-frost"><Icon size={15} aria-hidden="true" />{route.label}</NavLink>;
            })}
          </nav>
          <div className="mt-5 border-t border-ig-line pt-4">
            <Button variant="primary" size="lg" className="w-full" onClick={() => { setMenuOpen(false); }}>Launch Platform</Button>
          </div>
        </div>
      </div>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 lg:px-6 lg:pt-8">
        {children}
      </main>

      <footer className="mt-16 border-t border-ig-line pt-6 text-[11px] leading-5 text-ig-muted uppercase tracking-wider">
        <p>Ignis Labs is decision support. Scores, material risks and simulator output are estimates from cited experiments, not physics simulations. Check every badge and source before you rely on a number.</p>
        <p className="mt-1">Built for NASA Space Apps 2026 &#8220;Flame in Freefall&#8221;.</p>
      </footer>
    </div>
  );
}
