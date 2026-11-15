import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ig-flame-blue focus-visible:outline-offset-2";

// Primary stays a solid gold fill (dark ink, AA-checked). The rest are glass
// controls: a translucent fill and a rim, never a backdrop-filter, so they
// cannot flicker over the photo.
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ig-flame-blue text-ig-on-accent hover:bg-ig-amber active:bg-ig-ember",
  secondary:
    "border border-ig-glass-control-rim bg-ig-glass-control text-ig-frost hover:bg-ig-glass-hover active:bg-ig-glass-pressed",
  outline:
    "border border-ig-glass-control-rim bg-transparent text-ig-frost hover:bg-ig-glass-hover active:bg-ig-glass-pressed",
  ghost:
    "bg-transparent text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost active:bg-ig-glass-pressed",
  tertiary:
    "bg-ig-glass-field text-ig-frost hover:bg-ig-glass-hover active:bg-ig-glass-pressed",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
