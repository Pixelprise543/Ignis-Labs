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

// Solid fills only. No gradients, glows, blurs or shadows by design.
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ig-flame-blue text-ig-on-accent hover:bg-ig-amber active:bg-ig-ember",
  secondary:
    "bg-ig-hull text-ig-frost hover:bg-ig-raised active:bg-ig-line",
  outline:
    "border border-ig-line bg-transparent text-ig-frost hover:bg-ig-raised active:bg-ig-line",
  ghost:
    "bg-transparent text-ig-muted hover:bg-ig-hull hover:text-ig-frost active:bg-ig-line",
  tertiary:
    "bg-ig-hull text-ig-frost hover:bg-ig-raised active:bg-ig-line",
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
