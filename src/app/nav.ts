import type { LucideIcon } from "lucide-react";
import {
  BookA,
  BookOpen,
  Clock,
  Compass,
  FileText,
  GitCompare,
  Home,
  Info,
  LayoutGrid,
  Lightbulb,
  ListOrdered,
  Map,
  SlidersHorizontal,
} from "lucide-react";

export type NavGroup = "Overview" | "Explore data" | "Decide" | "Learn";

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
    path: "/compare",
    label: "Compare",
    folder: "compare",
    exportName: "ComparePage",
    group: "Explore data",
    icon: GitCompare,
  },
  {
    path: "/rankings",
    label: "Rankings",
    folder: "rankings",
    exportName: "RankingsPage",
    group: "Explore data",
    icon: ListOrdered,
  },
  {
    path: "/materials",
    label: "Materials",
    folder: "materials",
    exportName: "MaterialsPage",
    group: "Explore data",
    icon: LayoutGrid,
  },
  {
    path: "/coverage",
    label: "Coverage",
    folder: "coverage",
    exportName: "CoveragePage",
    group: "Explore data",
    icon: Map,
  },
  {
    path: "/timeline",
    label: "Timeline",
    folder: "timeline",
    exportName: "TimelinePage",
    group: "Explore data",
    icon: Clock,
  },
  {
    path: "/insights",
    label: "Insights",
    folder: "insights",
    exportName: "InsightsPage",
    group: "Decide",
    icon: Lightbulb,
  },
  {
    path: "/playbook",
    label: "Playbook",
    folder: "playbook",
    exportName: "PlaybookPage",
    group: "Decide",
    icon: BookOpen,
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
  {
    path: "/glossary",
    label: "Glossary",
    folder: "glossary",
    exportName: "GlossaryPage",
    group: "Learn",
    icon: BookA,
  },
  {
    path: "/method",
    label: "Method",
    folder: "method",
    exportName: "MethodPage",
    group: "Learn",
    icon: Info,
  },
];

export const NAV_GROUPS: NavGroup[] = ["Overview", "Explore data", "Decide", "Learn"];

export function routesByGroup(group: NavGroup): RouteDefinition[] {
  return ROUTES.filter((route) => route.group === group);
}
