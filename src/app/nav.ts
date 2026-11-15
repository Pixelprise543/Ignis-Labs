import type { LucideIcon } from "lucide-react";
import {
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  Lightbulb,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

/**
 * One route table for the whole app.
 *
 * Two surfaces read this file:
 * - The corporate marketing site (`CORPORATE_ROUTES`) at the top level.
 * - The research platform (`PLATFORM_ROUTES`) under `/app`.
 *
 * `ALL_ROUTES` feeds the router and the command palette. The left rail and the
 * mobile tab bar read `PLATFORM_NAV_GROUPS`, so marketing pages never leak into
 * the platform navigation.
 */
export type NavGroup =
  | "Company"
  | "Overview"
  | "Research"
  | "Analysis"
  | "Mission Tools"
  | "Resources";

export type NavIcon = LucideIcon;

export interface RouteDefinition {
  path: string;
  label: string;
  folder: string;
  exportName: string;
  group: NavGroup;
  icon: NavIcon;
}

export const CORPORATE_ROUTES: RouteDefinition[] = [
  { path: "/", label: "Home", folder: "corporate", exportName: "HomePage", group: "Company", icon: Home },
  { path: "/product", label: "Product", folder: "corporate", exportName: "ProductPage", group: "Company", icon: Sparkles },
  { path: "/solutions", label: "Solutions", folder: "corporate", exportName: "SolutionsPage", group: "Company", icon: Lightbulb },
  { path: "/technology", label: "Technology", folder: "corporate", exportName: "TechnologyPage", group: "Company", icon: FileText },
  { path: "/pricing", label: "Pricing", folder: "corporate", exportName: "PricingPage", group: "Company", icon: Compass },
  { path: "/about", label: "About", folder: "corporate", exportName: "AboutPage", group: "Company", icon: Settings },
];

export const PLATFORM_ROUTES: RouteDefinition[] = [
  { path: "/app", label: "Mission overview", folder: "home", exportName: "HomePage", group: "Overview", icon: LayoutDashboard },
  { path: "/app/scenario", label: "Scenario", folder: "scenario", exportName: "ScenarioPage", group: "Overview", icon: Settings },
  { path: "/app/explore", label: "Explore", folder: "explore", exportName: "ExplorePage", group: "Research", icon: Compass },
  { path: "/app/compare", label: "Compare", folder: "compare", exportName: "ComparePage", group: "Research", icon: Sparkles },
  { path: "/app/coverage", label: "Coverage", folder: "coverage", exportName: "CoveragePage", group: "Research", icon: Settings },
  { path: "/app/timeline", label: "Timeline", folder: "timeline", exportName: "TimelinePage", group: "Research", icon: Compass },
  { path: "/app/rankings", label: "Rankings", folder: "rankings", exportName: "RankingsPage", group: "Analysis", icon: FileText },
  { path: "/app/materials", label: "Materials", folder: "materials", exportName: "MaterialsPage", group: "Analysis", icon: Lightbulb },
  { path: "/app/simulator", label: "Simulator", folder: "simulator", exportName: "SimulatorPage", group: "Analysis", icon: SlidersHorizontal },
  { path: "/app/insights", label: "Insights", folder: "insights", exportName: "InsightsPage", group: "Analysis", icon: Lightbulb },
  { path: "/app/playbook", label: "Playbook", folder: "playbook", exportName: "PlaybookPage", group: "Mission Tools", icon: FileText },
  { path: "/app/brief", label: "Brief", folder: "brief", exportName: "BriefPage", group: "Mission Tools", icon: SlidersHorizontal },
  { path: "/app/glossary", label: "Glossary", folder: "glossary", exportName: "GlossaryPage", group: "Resources", icon: Settings },
  { path: "/app/method", label: "Method", folder: "method", exportName: "MethodPage", group: "Resources", icon: Sparkles },
];

export const ALL_ROUTES = [...CORPORATE_ROUTES, ...PLATFORM_ROUTES];
export const ROUTES = ALL_ROUTES;

/** Groups shown in the platform rail and the mobile "All views" sheet. */
export const NAV_GROUPS: NavGroup[] = [
  "Overview",
  "Research",
  "Analysis",
  "Mission Tools",
  "Resources",
];

export function routesByGroup(group: NavGroup): RouteDefinition[] {
  return ALL_ROUTES.filter((route) => route.group === group);
}

export function platformRoutesByGroup(group: NavGroup): RouteDefinition[] {
  return PLATFORM_ROUTES.filter((route) => route.group === group);
}

/** Four primary views on the mobile bottom bar; everything else lives in "More". */
export const MOBILE_TAB_PATHS = ["/app", "/app/explore", "/app/rankings", "/app/insights"];

export const MOBILE_TABS: RouteDefinition[] = PLATFORM_ROUTES.filter((route) =>
  MOBILE_TAB_PATHS.includes(route.path),
);

/** Platform landing shown by the "Launch Platform" calls to action. */
export const PLATFORM_HOME = "/app";

export const REDIRECTS: Record<string, string> = {
  "/explore": "/app/explore",
  "/compare": "/app/compare",
  "/rankings": "/app/rankings",
  "/materials": "/app/materials",
  "/coverage": "/app/coverage",
  "/timeline": "/app/timeline",
  "/simulator": "/app/simulator",
  "/insights": "/app/insights",
  "/playbook": "/app/playbook",
  "/brief": "/app/brief",
  "/glossary": "/app/glossary",
  "/method": "/app/method",
  "/scenario": "/app/scenario",
};
