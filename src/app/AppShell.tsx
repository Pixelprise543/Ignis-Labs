import { clsx } from "clsx";
import { ChevronRight, Command as CommandIcon, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  CORPORATE_ROUTES,
  MOBILE_TABS,
  NAV_GROUPS,
  PLATFORM_HOME,
  PLATFORM_ROUTES,
  platformRoutesByGroup,
} from "./nav";
import type { NavGroup, RouteDefinition } from "./nav";
import { ScenarioBar } from "./ScenarioBar";
import { useIgnis } from "./data";
import { Collapsible } from "@/design-system";
import { AskIgnisDrawer } from "@/features/assistant";
import { CommandPalette } from "@/features/palette";
import { CorporateShell } from "./corporate/CorporateShell";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to={PLATFORM_HOME}
      className="flex items-center gap-2.5 rounded-control p-1 hover:bg-ig-raised"
    >
      <span
        aria-hidden="true"
        className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ig-line bg-ig-flame-blue"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-ig-vacuum" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-ig-frost">Ignis</span>
        {compact ? null : (
          <span className="block text-xs leading-tight text-ig-muted">Fire safety intelligence</span>
        )}
      </span>
    </Link>
  );
}

function RailLink({ route }: { route: RouteDefinition }) {
  const Icon = route.icon;
  return (
    <NavLink
      to={route.path}
      end={route.path === PLATFORM_HOME}
      className={({ isActive }) =>
        clsx(
          "relative flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm transition-colors",
          isActive
            ? "bg-ig-raised font-medium text-ig-frost"
            : "text-ig-muted hover:bg-ig-raised hover:text-ig-frost",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-ig-flame-blue"
            />
          ) : null}
          <Icon size={16} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{route.label}</span>
        </>
      )}
    </NavLink>
  );
}

/**
 * Folded rail groups.
 *
 * Landing on the platform used to show all fourteen views at once, which read as
 * the old app's feature list. Groups now start folded and only the group that
 * contains the current page opens, so arrival is a short menu rather than a wall.
 */
function RailGroups() {
  const location = useLocation();
  const activeGroup =
    PLATFORM_ROUTES.find((route) => route.path === location.pathname)?.group ?? null;

  const [openGroups, setOpenGroups] = useState<NavGroup[]>(() =>
    activeGroup ? [activeGroup] : [],
  );
  const [filter, setFilter] = useState("");
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    if (!activeGroup) return;
    setOpenGroups((current) =>
      current.includes(activeGroup) ? current : [...current, activeGroup],
    );
  }, [activeGroup]);

  const matches = (text: string) =>
    text.toLowerCase().includes(filter.toLowerCase());

  function toggle(group: NavGroup) {
    setOpenGroups((current) =>
      current.includes(group) ? current.filter((value) => value !== group) : [...current, group],
    );
  }

  function setAll(open: boolean) {
    setAllOpen(open);
    if (open) setOpenGroups(NAV_GROUPS.slice());
    else setOpenGroups([]);
  }

  const filteredGroups = NAV_GROUPS.map((group) => {
    const routes = platformRoutesByGroup(group).filter(
      (route) => matches(route.label) || matches(route.path),
    );
    const groupLabel = matches(group);
    return { group, routes, groupLabel };
  });

  const hitCount = filteredGroups.reduce(
    (sum, g) => sum + g.routes.length,
    0,
  );

  return (
    <nav aria-label="Main" className="ig-scroll-y mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      {/* Find a view: filters labels and paths; matching groups open automatically. */}
      <div className="relative mb-2">
        <input
          id="rail-find"
          type="search"
          placeholder="Find a view"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full h-8 rounded-control border border-ig-line bg-ig-hull px-2.5 text-xs text-ig-frost placeholder:text-ig-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
          aria-label="Filter navigation views"
          aria-describedby="rail-find-hint"
        />
        <span id="rail-find-hint" className="sr-only">
          {hitCount} matching view{hitCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[10px] text-ig-muted">
          {filter ? hitCount + " match" + (hitCount === 1 ? "" : "es") : "Navigation"}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setAll(true)}
            aria-pressed={allOpen}
            className="inline-flex h-6 items-center justify-center rounded-control px-2 text-[10px] text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setAll(false)}
            aria-pressed={!allOpen}
            className="inline-flex h-6 items-center justify-center rounded-control px-2 text-[10px] text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
          >
            Collapse all
          </button>
        </div>
      </div>

      {filteredGroups.map((entry) => {
        const { group, routes, groupLabel } = entry;
        if (routes.length === 0 && !filter) return null;
        const isOpen = Boolean(openGroups.includes(group) || (filter && groupLabel));
        const isActive = activeGroup === group;
        const panelId = `rail-group-${group.replace(/\s+/g, "-").toLowerCase()}`;

        return (
          <div key={group}>
            <button
              type="button"
              onClick={() => toggle(group)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={clsx(
                "flex w-full items-center gap-1.5 rounded-control px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                isActive ? "text-ig-frost" : "text-ig-muted",
                "hover:bg-ig-raised hover:text-ig-frost",
              )}
            >
              <ChevronRight
                size={13}
                aria-hidden="true"
                className={clsx(
                  "shrink-0 transition-transform duration-150",
                  isOpen ? "rotate-90" : "rotate-0",
                )}
              />
              <span className="flex-1 truncate">{group}</span>
              <span className="ig-num text-[11px] leading-none text-ig-muted">{routes.length}</span>
            </button>

            <div id={panelId} hidden={!isOpen} className="mt-0.5 space-y-0.5">
              {routes.map((route) => (
                <RailLink key={route.path} route={route} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function SideRail({ onOpenPalette, onOpenAsk }: { onOpenPalette: () => void; onOpenAsk: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[236px] shrink-0 flex-col border-r border-ig-line bg-ig-vacuum px-3 py-4 lg:flex">
      <Brand />
      <RailGroups />

      <div className="mt-4 space-y-2 border-t border-ig-line pt-3">
        <button
          type="button"
          onClick={onOpenAsk}
          className="flex h-9 w-full items-center gap-2 rounded-control bg-ig-flame-blue px-2.5 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          <Sparkles size={16} aria-hidden="true" />
          Ask Ignis
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-control px-2.5 text-sm text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          <span className="inline-flex items-center gap-2">
            <CommandIcon size={16} aria-hidden="true" />
            Command palette
          </span>
          <kbd className="rounded-control border border-ig-line px-1.5 py-0.5 text-[10px] text-ig-muted">
            ⌘K
          </kbd>
        </button>
        <Link
          to="/"
          className="flex h-9 w-full items-center gap-2 rounded-control px-2.5 text-sm text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          Ignis Labs site
        </Link>
      </div>
    </aside>
  );
}

function MobileHeader({
  onOpenPalette,
  onOpenAsk,
}: {
  onOpenPalette: () => void;
  onOpenAsk: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ig-line bg-ig-vacuum px-3 py-2 lg:hidden">
      <Brand compact />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="inline-flex h-9 w-9 items-center justify-center rounded-control text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          <CommandIcon size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onOpenAsk}
          className="inline-flex h-9 items-center gap-1.5 rounded-control bg-ig-flame-blue px-2.5 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          <Sparkles size={14} aria-hidden="true" />
          Ask Ignis
        </button>
      </div>
    </div>
  );
}

function MobileTabs({ onMore }: { onMore: () => void }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ig-line bg-ig-vacuum pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {MOBILE_TABS.map((route) => {
        const Icon = route.icon;
        return (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === PLATFORM_HOME}
            className={({ isActive }) =>
              clsx(
                "relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] leading-tight",
                isActive ? "text-ig-flame-blue" : "text-ig-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-ig-flame-blue"
                  />
                ) : null}
                <Icon size={18} aria-hidden="true" />
                <span>{route.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={onMore}
        className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] text-ig-muted"
      >
        <Menu size={18} aria-hidden="true" />
        More
      </button>
    </nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setDrawerOpen } = useIgnis();
  const location = useLocation();
  const activeGroup =
    PLATFORM_ROUTES.find((route) => route.path === location.pathname)?.group ?? null;
  const [sheetFilter, setSheetFilter] = useState("");

  const sheetMatches = (text: string) =>
    text.toLowerCase().includes(sheetFilter.toLowerCase());

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-[var(--ig-scrim)]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All views"
        className="relative max-h-[80dvh] overflow-y-auto rounded-t-panel border border-ig-line bg-ig-hull p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ig-frost">All views</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Find a view: filters labels; matching groups open automatically. */}
        <div className="relative mb-2">
          <input
            id="sheet-find"
            type="search"
            placeholder="Find a view"
            value={sheetFilter}
            onChange={(event) => setSheetFilter(event.target.value)}
            className="w-full h-8 rounded-control border border-ig-line bg-ig-hull px-2.5 text-xs text-ig-frost placeholder:text-ig-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ig-flame-blue)]"
            aria-label="Filter navigation views"
          />
        </div>

        <div className="space-y-2">
          {NAV_GROUPS.map((group) => {
            const routes = platformRoutesByGroup(group).filter((route) =>
              sheetMatches(route.label),
            );
            const groupLabelMatch = sheetMatches(group);
            const isOpen = Boolean(
              group === activeGroup || (sheetFilter && groupLabelMatch),
            );
            if (routes.length === 0 && !sheetFilter) return null;
            return (
              <Collapsible
                key={group}
                title={group}
                summary={
                  routes.length +
                  " view" +
                  (routes.length === 1 ? "" : "s")
                }
                defaultOpen={isOpen}
                headingLevel={2}
              >
                <div className="space-y-0.5">
                  {routes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Link
                        key={route.path}
                        to={route.path}
                        onClick={onClose}
                        className="flex min-h-11 items-center gap-2 rounded-control px-2.5 text-sm text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
                      >
                        <Icon size={16} aria-hidden="true" />
                        {route.label}
                      </Link>
                    );
                  })}
                </div>
              </Collapsible>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            setDrawerOpen(true);
          }}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-control bg-ig-flame-blue text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          <Sparkles size={16} aria-hidden="true" />
          Ask Ignis
        </button>
        <Link
          to="/"
          onClick={onClose}
          className="mt-2 flex h-10 w-full items-center justify-center rounded-control border border-ig-line text-sm text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          Ignis Labs site
        </Link>
      </div>
    </div>
  );
}

/**
 * Two shells, one router:
 * - Marketing pages (`/`, `/product`, …) render the corporate shell.
 * - Every research view renders the platform shell: left rail on desktop,
 *   bottom tabs plus a "More" sheet on mobile, scenario bar on both.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { setDrawerOpen, setPaletteOpen } = useIgnis();
  const location = useLocation();

  const isCorporateRoute = CORPORATE_ROUTES.some((route) => route.path === location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  if (isCorporateRoute) {
    return <CorporateShell>{children}</CorporateShell>;
  }

  return (
    <div className="min-h-dvh bg-ig-vacuum">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-ig-raised focus:px-3 focus:py-2 focus:text-sm focus:text-ig-frost"
      >
        Skip to content
      </a>

      <div className="lg:flex">
        <SideRail
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAsk={() => setDrawerOpen(true)}
        />

        <div className="min-w-0 flex-1">
          <MobileHeader
            onOpenPalette={() => setPaletteOpen(true)}
            onOpenAsk={() => setDrawerOpen(true)}
          />
          <ScenarioBar />

          <main
            id="main"
            tabIndex={-1}
            className="w-full px-3 pb-24 pt-4 lg:px-6 lg:pb-10 2xl:px-8"
          >
            {children}

            <footer className="mt-10 border-t border-ig-line pt-4 text-xs leading-5 text-ig-muted">
              <p>
                Ignis is decision support. Scores, material risks and simulator output are estimates
                from cited experiments, not physics simulations. Check every badge and source before
                you rely on a number.
              </p>
              <p className="mt-1">
                <Link to="/app/method" className="text-ig-flame-blue hover:underline">
                  How the scoring and evidence work
                </Link>
              </p>
            </footer>
          </main>
        </div>
      </div>

      <MobileTabs onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <AskIgnisDrawer />
      <CommandPalette />
    </div>
  );
}
