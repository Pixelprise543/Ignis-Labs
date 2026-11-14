import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button, EmptyState } from "@/design-system";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last line of defence. A render error in one page must not blank the whole
 * mission-control screen, so we show the failure plainly and offer a reload.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Ignis render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-dvh place-items-center bg-ig-vacuum p-6">
          <EmptyState
            className="max-w-xl"
            title="Something went wrong"
            message="A view failed to render. Reload the app to start a clean session. If it keeps happening, open the browser console and share the first error line with the team."
            action={<Button onClick={() => window.location.reload()}>Reload the app</Button>}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
