import { clsx } from "clsx";
import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "./nav";
import type { RouteDefinition } from "./nav";
import { ScenarioBar } from "./ScenarioBar";
import { useIgnis } from "./data";
import { AskIgnisDrawer } from "@/features/assistant";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-control px-3 py-2 hover:bg-ig-raised">
      <span
        aria-hidden="true"
        className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ig-line bg-ig-flame-blue"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-ig-vacuum" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-ig-frost">Ignis</span>
        <span className="block text-xs leading-tight text-ig-muted">Fire safety for spaceflight</span>
      </span>
    </Link>
  );
}

function NavLinkItem({ route }: { route: RouteDefinition }) {
  const Icon = route.icon;
  return (
    <NavLink
      to={route.path}
      end={route.path === "/"}
      className={({ isActive }) =>
        clsx(
          "relative flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors",
          isActive
            ? "bg-ig-raised text-ig-flame-blue"
            : "text-ig-muted hover:bg-ig-hull hover:text-ig-frost",
        )
      }
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span>{route.label}</span>
    </NavLink>
  );
}

function TopBar({ onOpenAsk }: { onOpenAsk: () => void }) {
  return (
    <header className="border-b border-ig-line bg-ig-vacuum sticky top-0 z-20">
      <div className="flex items-center justify-between gap-3 px-3 py-2 lg:px-6 lg:py-2.5">
        <div className="flex items-center gap-4">
          <Brand />
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            {ROUTES.map((route) => (
              <NavLinkItem key={route.path} route={route} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAsk}
            className="flex h-9 w-9 items-center justify-center rounded-control bg-ig-hull text-ig-frost hover:bg-ig-raised lg:hidden"
          >
            <Sparkles size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenAsk}
            className="hidden lg:flex h-9 items-center gap-2 rounded-control bg-ig-flame-blue px-3 text-xs font-medium text-ig-on-accent hover:bg-ig-amber"
          >
            <Sparkles size={14} aria-hidden="true" />
            Ask Ignis
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setDrawerOpen } = useIgnis();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="relative max-h-[80dvh] overflow-y-auto border border-ig-line bg-ig-hull p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ig-frost">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <nav className="space-y-1">
          {ROUTES.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={onClose}
                className="flex min-h-10 items-center gap-2 rounded-control px-3 text-sm text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
              >
                <Icon size={16} aria-hidden="true" />
                {route.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            onClose();
            setDrawerOpen(true);
          }}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-control bg-ig-flame-blue text-xs font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          <Sparkles size={14} aria-hidden="true" />
          Ask Ignis
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setDrawerOpen } = useIgnis();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-ig-vacuum">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-ig-raised focus:px-3 focus:py-2 focus:text-sm focus:text-ig-frost"
      >
        Skip to content
      </a>

      <TopBar onOpenAsk={() => setDrawerOpen(true)} />

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-control border border-ig-line bg-ig-hull text-ig-frost hover:bg-ig-raised lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      <div className="lg:flex">
        <div className="min-w-0 flex-1">
          <ScenarioBar />

          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 lg:px-6 lg:pt-8">
            {children}

            <footer className="mt-12 border-t border-ig-line pt-6 text-xs leading-5 text-ig-muted">
              <p>
                Ignis is decision support. Scores, material risks and simulator output are estimates
                from cited experiments, not physics simulations. Check every badge and source before
                you rely on a number.
              </p>
            </footer>
          </main>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AskIgnisDrawer />
    </div>
  );
}
