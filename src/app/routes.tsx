import React, { lazy, Suspense } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { EmptyState, Skeleton } from "@/design-system";
import { ALL_ROUTES, REDIRECTS } from "./nav";

function MissingFeature({ folder, exportName }: { folder: string; exportName: string }) {
  return (
    <EmptyState title="Not built" message={`The ${folder} view (${exportName}) has not landed yet.`} />
  );
}

const featureRoutes = ALL_ROUTES.map((route) => ({
  ...route,
  Component: lazy(() => import(`@/features/${route.folder}/index.tsx`).then((mod) => {
    const candidate = mod[route.exportName];
    if (typeof candidate !== "function") {
      return { default: MissingFeature as React.ComponentType };
    }
    return { default: candidate as React.ComponentType };
  })),
}));

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      <Skeleton lines={4} />
    </div>
  );
}

function RedirectToApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const target = REDIRECTS[location.pathname];
  if (target) {
    navigate(target, { replace: true });
  }
  return null;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {featureRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {Object.entries(REDIRECTS).map(([from]) => (
          <Route key={from} path={from} element={<RedirectToApp />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  return (
    <EmptyState title="Page not found" message="That address does not match a view in Ignis." action={<Link to="/" className="inline-flex h-10 items-center rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber">Go home</Link>} />
  );
}
