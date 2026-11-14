import type { LucideIcon } from "lucide-react";
import { Compass, FileText, Home, SlidersHorizontal } from "lucide-react";

export type NavGroup = "Overview" | "Explore data" | "Decide";

export type NavIcon = LucideIcon;

export interface RouteDefinition {
  path: string;
  label: string;
  folder: string;
  exportName: string;
  group: NavGroup;
  icon: NavIcon;
}

/**
 * The single route table. The rail, the mobile "More" sheet and the command
 * palette all read this, so a page cannot drift between them.
 */
export const ROUTES: RouteDefinition[] = [
  {
    path: "/",
    label: "Overview",
    folder: "home",
    exportName: "HomePage",
    group: "Overview",
    icon: Home,
  },
  {
    path: "/explore",
    label: "Explore",
    folder: "explore",
    exportName: "ExplorePage",
    group: "Explore data",
    icon: Compass,
  },
  {
    path: "/simulator",
    label: "Simulator",
    folder: "simulator",
    exportName: "SimulatorPage",
    group: "Decide",
    icon: SlidersHorizontal,
  },
  {
    path: "/brief",
    label: "Brief",
    folder: "brief",
    exportName: "BriefPage",
    group: "Decide",
    icon: FileText,
  },
];

export const NAV_GROUPS: NavGroup[] = ["Overview", "Explore data", "Decide"];

export function routesByGroup(group: NavGroup): RouteDefinition[] {
  return ROUTES.filter((route) => route.group === group);
}
