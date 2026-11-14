import { clsx } from "clsx";
import type { ReactNode } from "react";

export interface SkeletonProps {
  lines?: number;
  className?: string;
}

/**
 * Flat solid blocks with an opacity pulse. No shimmer gradient: that would
 * break the flat rules.
 */
export function Skeleton({ lines = 1, className }: SkeletonProps) {
  if (lines <= 1) {
    return (
      <div
        aria-hidden="true"
        className={clsx("h-4 animate-pulse rounded-control bg-ig-raised", className)}
      />
    );
  }

  return (
    <div aria-hidden="true" className={clsx("space-y-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={clsx(
            "h-4 animate-pulse rounded-control bg-ig-raised",
            index === lines - 1 && "w-2/3",
          )}
        />
      ))}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  message: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <section
      role="status"
      className={clsx(
        "rounded-panel border border-ig-line bg-ig-hull px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="mx-auto mb-3 inline-flex text-ig-muted">
          {icon}
        </span>
      ) : null}
      <h2 className="text-base font-semibold text-ig-frost">{title}</h2>
      <p className="mx-auto mt-2 max-w-prose text-sm leading-6 text-ig-muted">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  );
}
