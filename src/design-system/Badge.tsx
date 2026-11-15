import * as React from "react";
import { clsx } from "clsx";

type Severity = "info" | "caution" | "high" | "critical";
type Confidence = "verified" | "curated" | "illustrative";
type Status = "default" | "success" | "warning" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Severity | Confidence | Status;
  size?: "sm" | "md";
}

const severityColors: Record<Severity, string> = {
  info: "bg-ig-flame-blue text-black",
  caution: "bg-ig-amber text-black",
  high: "bg-ig-ember text-black",
  critical: "bg-ig-alarm text-white",
};

const confidenceColors: Record<Confidence, string> = {
  verified: "bg-ig-quench text-black",
  curated: "bg-ig-amber text-black",
  illustrative: "bg-ig-line text-ig-frost",
};

const statusColors: Record<Status, string> = {
  default: "bg-ig-line text-ig-frost",
  success: "bg-ig-quench text-black",
  warning: "bg-ig-amber text-black",
  error: "bg-ig-alarm text-white",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    const base = "ig-badge inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-xs font-semibold transition-opacity";

    const sizes: Record<string, string> = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };

    let color = statusColors.default;
    if (variant in severityColors) color = severityColors[variant as Severity];
    else if (variant in confidenceColors) color = confidenceColors[variant as Confidence];
    else if (variant in statusColors) color = statusColors[variant as Status];

    return (
      <span ref={ref} className={clsx(base, color, sizes[size], className)} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/* SeverityBadge — color + icon + text, never color alone */
interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const severityIcons: Record<Severity, string> = {
  info: "○",
  caution: "▲",
  high: "■",
  critical: "◆",
};

export const SeverityBadge = React.forwardRef<HTMLSpanElement, SeverityBadgeProps>(
  ({ severity, label, size, className }, ref) => {
    const text = label ?? severity.charAt(0).toUpperCase() + severity.slice(1);
    return (
      <Badge ref={ref} variant={severity} size={size} className={className}>
        <span className="mr-1">{severityIcons[severity]}</span>
        {text}
      </Badge>
    );
  }
);

/* ConfidenceBadge — color + icon + text */
interface ConfidenceBadgeProps {
  confidence: Confidence;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const confidenceIcons: Record<Confidence, string> = {
  verified: "✓",
  curated: "↻",
  illustrative: "⚠",
};

export const ConfidenceBadge = React.forwardRef<HTMLSpanElement, ConfidenceBadgeProps>(
  ({ confidence, label, size = "sm", className }, ref) => {
    const text = label ?? confidence.charAt(0).toUpperCase() + confidence.slice(1);
    return (
      <Badge ref={ref} variant={confidence} size={size} className={className}>
        <span className="mr-1">{confidenceIcons[confidence]}</span>
        {text}
      </Badge>
    );
  }
);

SeverityBadge.displayName = "SeverityBadge";
ConfidenceBadge.displayName = "ConfidenceBadge";
