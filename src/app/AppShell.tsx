import { clsx } from "clsx";
import { Flame, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "./nav";
import type { RouteDefinition } from "./nav";
import { useIgnis } from "./data";
import { AskIgnisDrawer } from "@/features/assistant";
import { Button, ThemeToggle } from "@/design-system";
import { CorporateShell } from "./corporate/CorporateShell";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-control px-3 py-2 hover:bg-ig-hull">
      <span aria-hidden="true" className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ig-line bg-ig-hull"><Flame size={18} strokeWidth={2} /></span>
      <span className="min-w-0"><span className="block text-sm font-semibold leading-tight text-ig-frost">Ignis</span><span className="block text-[10px] leading-tight text-ig-muted uppercase tracking-wider">Fire safety</span></span>
    </Link>
  );
}

function NavLinkItem({ route }: { route: RouteDefinition }) {
  const Icon = route.icon;
  return (
    <NavLink to={route.path} end={route.path === "/"} className={({ isActive }) => clsx("relative flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors border-transparent", isActive ? "bg-ig-hull text-ig-flame-blue border-b-2 border-ig-flame-blue" : "text-ig-muted hover:bg-ig-hull hover:text-ig-frost")}>
      <Icon size={15} aria-hidden="true" className="shrink-0" />
      <span>{route.label}</span>
    </NavLink>
  );
}

function TopBar({ onOpenAsk }: { onOpenAsk: () => void }) {
  return (
    <header className="border-b border-ig-line bg-ig-vacuum sticky top-0 z-20">
      <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-6 lg:py-2.5">
        <div className="flex items-center gap-5">
          <Brand />
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">{ROUTES.map((route) => <NavLinkItem key={route.path} route={route} />)}</nav>
        </div>
        <div className="flex items-center gap-2"><Button variant="primary" size="sm" icon={<Sparkles size={13} />} onClick={onOpenAsk}>Ask Ignis</Button><Button variant="ghost" size="sm" onClick={onOpenAsk}>Ask</Button><ThemeToggle /></div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setDrawerOpen } = useIgnis();
  useEffect(() => { if (!open) return; function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); } document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:hidden"><div aria-hidden="true" className="absolute inset-0 bg-black/30" onClick={onClose} /><div role="dialog" aria-modal="true" aria-label="Menu" className="relative max-h-[85dvh] overflow-y-auto border border-ig-line bg-ig-hull p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-ig-frost">Menu</p><button type="button" onClick={onClose} aria-label="Close menu" className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-raised hover:text-ig-frost"><X size={16} aria-hidden="true" /></button></div><nav className="space-y-0.5">{ROUTES.map((route) => { const Icon = route.icon; return <Link key={route.path} to={route.path} onClick={onClose} className="flex min-h-10 items-center gap-2.5 rounded-control px-3 text-sm font-medium text-ig-muted hover:bg-ig-raised hover:text-ig-frost"><Icon size={15} aria-hidden="true" />{route.label}</Link>; }) }</nav><div className="mt-5 border-t border-ig-line pt-4"><Button variant="primary" size="lg" icon={<Sparkles size={14} />} onClick={() => { onClose(); setDrawerOpen(true); }} className="w-full">Ask Ignis</Button></div></div></div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setDrawerOpen } = useIgnis();
  const location = useLocation();

  const basename = import.meta.env.BASE_URL || "/";
  const isCorporateRoute = ["/", "/product", "/solutions", "/technology", "/pricing", "/about"].some((p) => location.pathname === basename + p || location.pathname === basename + p.slice(1));

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [location.pathname]);

  if (isCorporateRoute) {
    return <CorporateShell>{children}</CorporateShell>;
  }

  return (
    <div className="min-h-dvh bg-ig-vacuum">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ig-raised focus:px-3 focus:py-2 focus:text-sm focus:text-ig-frost">Skip to content</a>
      <TopBar onOpenAsk={() => setDrawerOpen(true)} />
      <button type="button" onClick={() => setMenuOpen(true)} className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-control border border-ig-line bg-ig-hull text-ig-frost hover:bg-ig-raised lg:hidden" aria-label="Open menu"><Menu size={18} aria-hidden="true" /></button>
      <div className="lg:flex"><div className="min-w-0 flex-1">{children}</div></div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AskIgnisDrawer />
    </div>
  );
}
