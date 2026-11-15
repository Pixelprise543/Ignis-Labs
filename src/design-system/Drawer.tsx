import * as React from "react";
import { clsx } from "clsx";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, open, onOpenChange, side = "right", title, children }, ref) => {
    const handleClose = React.useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      },
      [onOpenChange]
    );

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
        {/* Drawer panel */}
        <div
          ref={ref}
          className={clsx(
            "fixed inset-y-0 z-50 w-full max-w-md",
            side === "right" ? "right-0" : "left-0",
            "bg-black/70 border-l border-ig-line flex flex-col shadow-none",
            className
          )}
          style={{ backdropFilter: "blur(12px)" }}
        >
          {title && (
            <div className="px-4 py-3 border-b border-ig-line flex items-center justify-between">
              <span className="font-semibold text-ig-frost">{title}</span>
              <button
                onClick={() => onOpenChange(false)}
                className="text-ig-muted hover:text-ig-frost"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </>
    );
  }
);

Drawer.displayName = "Drawer";
