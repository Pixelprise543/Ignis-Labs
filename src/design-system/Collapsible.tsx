import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";

export interface CollapsibleProps {
  /** Always-visible heading. Plain text only - never put a link or button here. */
  title: React.ReactNode;
  /** Always-visible one-liner under the heading, so the collapsed state still says something. */
  summary?: React.ReactNode;
  /** The detail that hides until the reader asks for it. */
  children: React.ReactNode;
  defaultOpen?: boolean;
  openLabel?: string;
  closeLabel?: string;
  /** "panel" draws a bordered block. "plain" is a divider, for use inside a card. */
  tone?: "panel" | "plain";
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Collapsible text block.
 *
 * Why: the dataset is dense and pages were dumping every finding, every citation
 * and every caveat at once. The reader now sees a heading plus one summary line
 * and opens the detail when they want it. Nothing is deleted - evidence stays one
 * click away, which the honesty rule requires.
 *
 * Glass by design: a translucent sheet with a 1px rim. The chevron rotation is
 * the only motion and it only fires on a user action.
 */
export function Collapsible({
  title,
  summary,
  children,
  defaultOpen = false,
  openLabel = "Show details",
  closeLabel = "Hide details",
  tone = "panel",
  headingLevel = 3,
  className,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const bodyId = `${id}-body`;
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      className={clsx(
        tone === "panel" ? "ig-glass rounded-panel" : "border-t border-ig-line",
        className,
      )}
    >
      <Heading className="m-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className={clsx(
            "flex w-full items-start gap-2 rounded-control text-left",
            tone === "panel" ? "px-4 py-3" : "py-2",
            "hover:bg-ig-glass-hover",
          )}
        >
          <ChevronRight
            size={16}
            aria-hidden="true"
            className={clsx(
              "mt-0.5 shrink-0 text-ig-muted transition-transform duration-150",
              open ? "rotate-90" : "rotate-0",
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-6 text-ig-frost">{title}</span>
            {summary ? (
              <span className="mt-0.5 block text-sm leading-6 text-ig-muted">{summary}</span>
            ) : null}
          </span>
          <span className="mt-0.5 shrink-0 text-xs text-ig-flame-blue">
            {open ? closeLabel : openLabel}
          </span>
        </button>
      </Heading>

      <div
        id={bodyId}
        hidden={!open}
        className={clsx("text-sm leading-6 text-ig-muted", tone === "panel" ? "px-4 pb-4" : "pb-3 pl-6")}
      >
        {children}
      </div>
    </div>
  );
}
