import * as React from "react";
import { clsx } from "clsx";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
  className?: string;
}
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  active?: boolean;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, children }, ref) => (
    <div ref={ref} className={clsx("ig-tabs", className)} data-value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement;
        if (el.type === TabsTrigger) {
          const active = el.props.value === value;
          return React.cloneElement(el, {
            active,
            onClick: () => onValueChange(el.props.value),
          });
        }
        if (el.type === TabsContent) {
          return React.cloneElement(el, {
            active: el.props.value === value,
          });
        }
        return child;
      })}
    </div>
  )
);

Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={clsx("flex gap-1 bg-black/20 border border-ig-line rounded-md p-1", className)}
      {...props}
    >
      {children}
    </div>
  )
);

TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, active, onClick, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      aria-selected={active}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "tabs-trigger inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ig-flame-blue",
        active
          ? "bg-ig-raised text-ig-frost"
          : "text-ig-muted hover:bg-black/30 hover:text-ig-frost",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, active, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      hidden={!active}
      className={clsx("mt-4", className)}
      {...props}
    >
      {active ? children : null}
    </div>
  )
);

TabsContent.displayName = "TabsContent";
