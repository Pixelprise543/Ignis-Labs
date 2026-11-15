import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Backdrop } from "./Backdrop";
import { ErrorBoundary } from "./ErrorBoundary";
import { initUrlSync } from "./data";
import { AppRoutes } from "./routes";
import "@/design-system/design-system.css";
import "./app.css";

/**
 * Shell entry point. src/main.tsx discovers this default export through
 * import.meta.glob, so the router lives here and nowhere else.
 */
export default function App() {
  useEffect(() => initUrlSync(), []);

  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {/* The photo sits behind everything; .ig-app is the layer above it. */}
        <Backdrop />
        <div className="ig-app">
          <AppShell>
            <AppRoutes />
          </AppShell>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
