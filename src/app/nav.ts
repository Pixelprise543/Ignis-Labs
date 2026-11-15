import type { LucideIcon } from "lucide-react";
import { Compass, FileText, Home, Lightbulb, SlidersHorizontal, Settings, Sparkles } from "lucide-react";

export type NavGroup = "Company" | "Overview" | "Explore data" | "Decide" | "Research" | "Analysis" | "Mission Tools" | "Resources";

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
  { path: "/app/explore", label: "Explore", folder: "explore", exportName: "ExplorePage", group: "Research", icon: Compass },
  { path: "/app/compare", label: "Compare", folder: "compare", exportName: "ComparePage", group: "Research", icon: Sparkles },
  { path: "/app/rankings", label: "Rankings", folder: "rankings", exportName: "RankingsPage", group: "Analysis", icon: FileText },
  { path: "/app/materials", label: "Materials", folder: "materials", exportName: "MaterialsPage", group: "Analysis", icon: Lightbulb },
  { path: "/app/coverage", label: "Coverage", folder: "coverage", exportName: "CoveragePage", group: "Research", icon: Settings },
  { path: "/app/timeline", label: "Timeline", folder: "timeline", exportName: "TimelinePage", group: "Research", icon: Compass },
  { path: "/app/simulator", label: "Simulator", folder: "simulator", exportName: "SimulatorPage", group: "Analysis", icon: SlidersHorizontal },
  { path: "/app/insights", label: "Insights", folder: "insights", exportName: "InsightsPage", group: "Analysis", icon: Lightbulb },
  { path: "/app/playbook", label: "Playbook", folder: "playbook", exportName: "PlaybookPage", group: "Mission Tools", icon: FileText },
  { path: "/app/brief", label: "Brief", folder: "brief", exportName: "BriefPage", group: "Mission Tools", icon: SlidersHorizontal },
  { path: "/app/glossary", label: "Glossary", folder: "glossary", exportName: "GlossaryPage", group: "Resources", icon: Settings },
  { path: "/app/method", label: "Methodology", folder: "method", exportName: "MethodPage", group: "Resources", icon: Sparkles },
  { path: "/app/scenario", label: "Scenario", folder: "scenario", exportName: "ScenarioPage", group: "Overview", icon: Settings },
];

export const ALL_ROUTES = [...CORPORATE_ROUTES, ...PLATFORM_ROUTES];
export const ROUTES = ALL_ROUTES;

export const NAV_GROUPS: NavGroup[] = ["Company", "Overview", "Research", "Analysis", "Mission Tools", "Resources"];

export function routesByGroup(group: NavGroup): RouteDefinition[] {
  return ALL_ROUTES.filter((route) => route.group === group);
}

export const REDIRECTS: Record<string, string> = {
  "/": "/",
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
