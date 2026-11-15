import { clsx } from "clsx";
import type { ReactNode } from "react";

export interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
}

/**
 * Glass sheet: a translucent, blurred panel with a 1px rim. Depth comes from the
 * rim plus the backdrop showing through - never from a shadow.
 *
 * The blur is painted on .ig-glass::before, not on this element, so the rim and
 * the content never sit on a backdrop-filter (that combination flickers over a
 * photo backdrop). See src/design-system/theme.css.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  padded = true,
}: PanelProps) {
  return (
    <section
      className={clsx(
        "ig-glass rounded-panel",
        className,
      )}
    >
      {title || description || action ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ig-line px-4 py-3">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-semibold text-ig-frost">{title}</h2> : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-ig-muted">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={clsx(padded && "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  className?: string;
}

export function Stat({ label, value, unit, hint, className }: StatProps) {
  return (
    <div className={clsx("ig-glass rounded-panel px-4 py-3", className)}>
      <p className="text-xs text-ig-muted">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="ig-num text-2xl font-semibold leading-none text-ig-frost">{value}</span>
        {unit ? <span className="ig-num text-xs text-ig-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-2 text-xs leading-5 text-ig-muted">{hint}</p> : null}
    </div>
  );
}
