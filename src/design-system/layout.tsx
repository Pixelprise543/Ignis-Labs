import * as React from "react";
import { clsx } from "clsx";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Toggle theme"
      className="ig-button variant-ghost size-sm p-2"
      {...props}
    >
      ☀️
    </button>
  )
);

ThemeToggle.displayName = "ThemeToggle";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
}

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, title, children, open = false, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const controlled = open !== undefined;
    const current = controlled ? open : isOpen;

    return (
      <div className={clsx("ig-glass mb-3", className)}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={current}
          className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-ig-frost hover:bg-ig-raised transition-colors outline-none"
        >
          {title}
          <span className={`transition-transform ${current ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
        {current && <div className="border-t border-ig-line px-4 py-3 text-sm text-ig-muted">{children}</div>}
      </div>
    );
  }
);

Collapsible.displayName = "Collapsible";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={clsx("w-8 h-8", className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 2 L4 16 L16 30 L28 16 L16 2 Z"
        stroke="var(--ig-flame-blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 2 L16 30 M4 16 L28 16" stroke="var(--ig-line)" strokeWidth="1" opacity="0.3" />
    </svg>
  )
);

Logo.displayName = "Logo";
