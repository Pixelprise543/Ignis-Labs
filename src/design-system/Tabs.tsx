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
      className={clsx(
        "flex w-fit flex-wrap items-center gap-1 rounded-control border border-ig-glass-control-rim bg-ig-glass-field p-1",
        className,
      )}
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
              // The active tab changes fill AND text lightness AND carries a gold
              // underline, so selection never rests on colour alone.
              "inline-flex min-h-8 items-center gap-2 rounded-control border-b-2 px-3 text-sm font-medium transition-colors",
              active
                ? "border-ig-flame-blue bg-ig-glass-pressed text-ig-frost"
                : "border-transparent text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost",
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
