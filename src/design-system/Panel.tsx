import * as React from "react";
import { clsx } from "clsx";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  raised?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, subtitle, raised = false, padding = "md", children, ...props }, ref) => {
    const padClasses: Record<string, string> = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={clsx("ig-glass ig-panel", raised && "ig-raised", padClasses[padding], className)}
        {...props}
      >
        {title || subtitle ? (
          <div className="mb-3">
            {title && <h3 className="text-sm font-semibold text-ig-frost">{title}</h3>}
            {subtitle && <p className="text-xs text-ig-muted">{subtitle}</p>}
          </div>
        ) : null}
        {children}
      </div>
    );
  }
);

Panel.displayName = "Panel";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, raised = false, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("ig-glass ig-card", raised && "ig-raised", hoverable && "ig-hoverable", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface StatProps {
  value: string | number;
  label: string;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, value, label, delta, deltaPositive, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx("ig-stat", className)} {...props}>
        <div className="text-2xl font-semibold text-ig-frost tabular-nums">{value}</div>
        <div className="text-xs text-ig-muted">{label}</div>
        {delta && (
          <div className={`text-xs font-semibold mt-1 ${deltaPositive ? "text-ig-quench" : "text-ig-ember"}`}>
            {delta}
          </div>
        )}
      </div>
    );
  }
);

Stat.displayName = "Stat";
