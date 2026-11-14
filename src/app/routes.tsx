import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { EmptyState, Skeleton } from "@/design-system";
import { getFeatureLoader } from "./featureRegistry";
import { ROUTES } from "./nav";

const featureRoutes = ROUTES.map((route) => ({
  ...route,
  Component: lazy(getFeatureLoader(route.folder, route.exportName)),
}));

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton lines={4} />
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      message="That address does not match a view in Ignis. Use the rail or the command palette to get back to a known page."
      action={
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          Go to overview
        </Link>
      }
    />
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {featureRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
