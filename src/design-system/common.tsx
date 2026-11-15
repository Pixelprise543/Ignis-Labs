import * as React from "react";
import { clsx } from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ className, content, children }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <span
        ref={ref}
        className={clsx("relative inline-block", className)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
        {visible && (
          <span
            className="absolute z-50 mt-1 px-2 py-1 rounded bg-black/90 border border-ig-line text-xs text-ig-frost whitespace-nowrap pointer-events-none"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {content}
          </span>
        )}
      </span>
    );
  }
);

Tooltip.displayName = "Tooltip";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "animate-pulse rounded-md bg-black/40 border border-ig-line/50",
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = "Skeleton";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("flex flex-col items-center justify-center text-center py-12", className)}
      {...props}
    >
      <div className="mb-4 text-2xl">🕳️</div>
      <h3 className="text-lg font-semibold text-ig-frost">{title}</h3>
      {description && <p className="mt-2 text-sm text-ig-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
);

EmptyState.displayName = "EmptyState";

interface TermProps {
  term: string;
  definition: string;
  className?: string;
}

export const Term = React.forwardRef<HTMLSpanElement, TermProps>(
  ({ className, term, definition, ...props }) => (
    <Tooltip content={definition} className={clsx(className)} {...props}>
      <span className="text-ig-flame-blue underline underline-offset-2 hover:text-ig-amber transition-colors cursor-help">
        {term}
      </span>
    </Tooltip>
  )
);

Term.displayName = "Term";

interface CitationChipProps {
  id: string;
  title: string;
  className?: string;
}

export const CitationChip = React.forwardRef<HTMLSpanElement, CitationChipProps>(
  ({ className, id, title, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        "inline-flex items-center gap-1 rounded bg-ig-raised border border-ig-line px-2 py-0.5 text-xs text-ig-muted hover:text-ig-frost transition-colors cursor-default",
        className
      )}
      {...props}
    >
      <span className="text-[10px] opacity-50">[</span>
      {id}
      <span className="text-[10px] opacity-50">]</span>
      <span className="ml-1">{title}</span>
    </span>
  )
);

CitationChip.displayName = "CitationChip";
