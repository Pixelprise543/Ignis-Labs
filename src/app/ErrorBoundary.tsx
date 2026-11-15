import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="ig-glass p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-ig-alarm mb-2">Something went wrong</h2>
          <p className="text-sm text-ig-muted mb-4">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
            className="ig-button variant-primary"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
