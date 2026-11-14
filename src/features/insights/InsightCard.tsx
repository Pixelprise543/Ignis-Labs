import { clsx } from "clsx";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { Insight, Severity } from "@/contracts/types";
import { CitationChip, SeverityBadge } from "@/design-system";

const severityBorder: Record<Severity, string> = {
  info: "border-l-ig-flame-blue",
  caution: "border-l-ig-amber",
  high: "border-l-ig-ember",
  critical: "border-l-ig-alarm",
};

const severityFill: Record<Severity, string> = {
  info: "bg-ig-flame-blue",
  caution: "bg-ig-amber",
  high: "bg-ig-ember",
  critical: "bg-ig-alarm",
};

const severityWord: Record<Severity, string> = {
  info: "Informational",
  caution: "Caution",
  high: "High severity",
  critical: "Critical",
};

export interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
  showActions?: boolean;
}

/**
 * One evidence-linked insight. The confidence meter uses 10 solid steps, not a
 * continuous ramp, and the severity is always spelled out in text.
 */
export function InsightCard({ insight, compact = false, showActions = true }: InsightCardProps) {
  const filled = Math.round((insight.confidence / 100) * 10);

  return (
    <article
      className={clsx(
        "rounded-panel border border-l-2 border-ig-line bg-ig-hull",
        severityBorder[insight.severity],
      )}
      aria-labelledby={`insight-${insight.id}`}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={insight.severity} />
            <span className="text-xs text-ig-muted">{severityWord[insight.severity]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ig-muted">Confidence</span>
            <span className="ig-num text-xs text-ig-frost">{insight.confidence}%</span>
          </div>
        </div>

        <div
          className="mt-2 flex gap-0.5"
          role="img"
          aria-label={`Confidence ${insight.confidence} out of 100`}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={clsx(
                "h-1.5 flex-1 rounded-[1px]",
                index < filled ? severityFill[insight.severity] : "bg-ig-line",
              )}
            />
          ))}
        </div>

        <h3
          id={`insight-${insight.id}`}
          className="mt-3 text-base font-semibold leading-6 text-ig-frost"
        >
          {insight.title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-ig-muted">{insight.summary}</p>

        {compact ? null : (
          <div className="mt-3 rounded-control border border-ig-line bg-ig-raised px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ig-frost">
              <ShieldCheck size={13} aria-hidden="true" className="text-ig-quench" />
              Recommended crew action
            </p>
            <p className="mt-1 text-sm leading-6 text-ig-muted">{insight.recommendation}</p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ig-muted">Evidence</span>
          {insight.evidenceIds.map((id) => (
            <CitationChip key={id} id={id} />
          ))}
          {insight.evidenceIds.length === 0 ? (
            <span className="text-xs text-ig-alarm">No linked experiment. Do not rely on this.</span>
          ) : null}
        </div>

        {showActions ? (
          <div className="mt-3 flex flex-wrap gap-3 border-t border-ig-line pt-2 text-xs">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-1 text-ig-flame-blue hover:underline"
            >
              Model this risk <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
            <Link
              to="/playbook"
              className="inline-flex items-center gap-1 text-ig-flame-blue hover:underline"
            >
              Open the playbook <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
