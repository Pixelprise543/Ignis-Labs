import { clsx } from "clsx";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Flame,
  FlaskConical,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Confidence, Severity } from "@/contracts/types";
import { Tooltip } from "./Tooltip";

export type BadgeTone = "neutral" | "gold" | "olive" | "amber" | "ember" | "alarm";

/**
 * Every chip carries its hue on the --tint custom property, so there is exactly
 * one styling path whether the chip ends up frosted or solid.
 */
const toneTint: Record<BadgeTone, string> = {
  neutral: "var(--ig-muted)",
  gold: "var(--ig-flame-blue)",
  olive: "var(--ig-quench)",
  amber: "var(--ig-amber)",
  ember: "var(--ig-ember)",
  alarm: "var(--ig-alarm)",
};

const badgeBase =
  "inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 text-xs font-medium leading-5";

export interface BadgeProps {
  tone?: BadgeTone;
  /**
   * "tint" (default) is a frosted chip: cream text over a faint wash of the hue.
   * "solid" is the high-legibility fill used by the severity and confidence
   * badges, whose wording must stay readable over any part of the photo. Both
   * keep an icon or a word, so the tone is never carried by colour alone.
   */
  variant?: "tint" | "solid";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  variant = "tint",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        badgeBase,
        variant === "solid" ? "ig-solid-chip" : "ig-glass-tint",
        className,
      )}
      style={{ "--tint": toneTint[tone] } as CSSProperties}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

const severityConfig: Record<
  Severity,
  { label: string; tone: BadgeTone; icon: LucideIcon }
> = {
  info: { label: "Info", tone: "gold", icon: Info },
  caution: { label: "Caution", tone: "amber", icon: AlertTriangle },
  high: { label: "High", tone: "ember", icon: Flame },
  critical: { label: "Critical", tone: "alarm", icon: ShieldAlert },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Badge
      tone={config.tone}
      variant="solid"
      icon={<Icon size={12} aria-hidden={true} />}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

const confidenceConfig: Record<
  Confidence,
  { label: string; tone: BadgeTone; icon: LucideIcon; explanation: string }
> = {
  verified: {
    label: "Verified",
    tone: "olive",
    icon: CheckCircle,
    explanation:
      "Checked against a cited NASA source that was actually retrieved. Numbers shown come from that source.",
  },
  curated: {
    label: "Curated",
    tone: "amber",
    icon: BookOpen,
    explanation:
      "Summarized from a cited source by the team. Treat details as a reading of the source, not a verbatim extract.",
  },
  illustrative: {
    label: "Illustrative",
    tone: "neutral",
    icon: FlaskConical,
    explanation:
      "A placeholder used to demonstrate the interface. It is not a NASA result and must not be quoted as one.",
  },
};

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <Tooltip label={config.explanation}>
      <Badge
        tone={config.tone}
        variant="solid"
        icon={<Icon size={12} aria-hidden={true} />}
        className={clsx("cursor-help", className)}
      >
        {config.label}
      </Badge>
    </Tooltip>
  );
}
