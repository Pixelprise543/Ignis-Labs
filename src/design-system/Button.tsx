import * as React from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "outline" | "text" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, isLoading, children, disabled, ...props }, ref) => {
    const base = "ig-button inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-ig-flame-blue text-black hover:bg-ig-amber active:bg-ig-ember disabled:opacity-50 disabled:pointer-events-none",
      outline: "border border-ig-line bg-transparent hover:bg-ig-raised text-ig-frost disabled:opacity-50 disabled:pointer-events-none",
      text: "bg-transparent hover:bg-ig-raised text-ig-frost disabled:opacity-50 disabled:pointer-events-none",
      ghost: "bg-transparent hover:bg-ig-raised text-ig-muted disabled:opacity-50 disabled:pointer-events-none",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="ig-spinner w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
