import { clsx } from "clsx";
import type { KeyboardEvent, ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}

export function Tabs({ items, value, onChange, label, className }: TabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const index = items.findIndex((item) => item.id === value);
    if (index < 0) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = items[(index + delta + items.length) % items.length];
    onChange(next.id);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={clsx("flex flex-wrap gap-1 border-b border-ig-line", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={clsx(
              "-mb-px inline-flex min-h-9 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
              active
                ? "border-ig-flame-blue text-ig-frost"
                : "border-transparent text-ig-muted hover:text-ig-frost",
            )}
          >
            {item.icon ? (
              <span aria-hidden="true" className="shrink-0">
                {item.icon}
              </span>
            ) : null}
            {item.label}
            {typeof item.count === "number" ? (
              <span className="ig-num text-xs text-ig-muted">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
