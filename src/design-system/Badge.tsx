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
import type { ReactNode } from "react";
import type { Confidence, Severity } from "@/contracts/types";
import { Tooltip } from "./Tooltip";

export type BadgeTone = "neutral" | "gold" | "olive" | "amber" | "ember" | "alarm";

// Text + border carry the tone; the surface stays flat.
const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-ig-line text-ig-muted",
  gold: "border-ig-flame-blue text-ig-flame-blue",
  olive: "border-ig-quench text-ig-quench",
  amber: "border-ig-amber text-ig-amber",
  ember: "border-ig-ember text-ig-ember",
  alarm: "border-ig-alarm text-ig-alarm",
};

const badgeBase =
  "inline-flex items-center gap-1 rounded-control border bg-ig-raised px-1.5 py-0.5 text-xs font-medium leading-5";

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span className={clsx(badgeBase, toneClasses[tone], className)}>
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
    <Badge tone={config.tone} icon={<Icon size={12} aria-hidden={true} />} className={className}>
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
        icon={<Icon size={12} aria-hidden={true} />}
        className={clsx("cursor-help", className)}
      >
        {config.label}
      </Badge>
    </Tooltip>
  );
}
