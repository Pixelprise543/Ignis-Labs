import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/design-system";
import { HomePage } from "@/features/home";
import { ExplorePage } from "@/features/explore";
import { ComparePage } from "@/features/compare";
import { RankingsPage } from "@/features/rankings";
import { MaterialsPage } from "@/features/materials";
import { CoveragePage } from "@/features/coverage";
import { TimelinePage } from "@/features/timeline";
import { InsightsPage } from "@/features/insights";
import { PlaybookPage } from "@/features/playbook";
import { SimulatorPage } from "@/features/simulator";
import { BriefPage } from "@/features/brief";
import { GlossaryPage } from "@/features/glossary";
import { MethodPage } from "@/features/method";

const NotFound = () => (
  <EmptyState title="Page not found" description="The route you requested doesn't exist." />
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(AppShell),
    children: [
      { index: true, element: React.createElement(HomePage) },
      { path: "explore", element: React.createElement(ExplorePage) },
      { path: "compare", element: React.createElement(ComparePage) },
      { path: "rankings", element: React.createElement(RankingsPage) },
      { path: "materials", element: React.createElement(MaterialsPage) },
      { path: "coverage", element: React.createElement(CoveragePage) },
      { path: "timeline", element: React.createElement(TimelinePage) },
      { path: "insights", element: React.createElement(InsightsPage) },
      { path: "playbook", element: React.createElement(PlaybookPage) },
      { path: "simulator", element: React.createElement(SimulatorPage) },
      { path: "brief", element: React.createElement(BriefPage) },
      { path: "glossary", element: React.createElement(GlossaryPage) },
      { path: "method", element: React.createElement(MethodPage) },
      { path: "*", element: React.createElement(NotFound) },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
