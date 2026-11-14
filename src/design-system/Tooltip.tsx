import { clsx } from "clsx";
import { useId, useState } from "react";
import type { ReactNode } from "react";

export interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Keyboard and pointer accessible tooltip. Uses a real element (not a title
 * attribute) so it can be styled flat and read by assistive tech.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        className="inline-flex rounded-control"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className="absolute left-0 top-full z-40 mt-1 w-64 rounded-control border border-ig-line bg-ig-raised p-2 text-xs font-normal leading-5 text-ig-frost"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
