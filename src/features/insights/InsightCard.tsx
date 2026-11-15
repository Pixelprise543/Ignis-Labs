import { clsx } from "clsx";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { Insight, Severity } from "@/contracts/types";
import { CitationChip, Collapsible, SeverityBadge } from "@/design-system";

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
 * One evidence-linked insight.
 *
 * The card leads with the claim and the confidence meter. The crew action and
 * the citation chips fold away behind "Crew action and evidence" so a page of
 * ten insights reads as ten claims, not ten paragraphs. Nothing is dropped: the
 * evidence ids are still rendered and still resolve.
 */
export function InsightCard({ insight, compact = false, showActions = true }: InsightCardProps) {
  const filled = Math.round((insight.confidence / 100) * 10);
  const evidenceCount = insight.evidenceIds.length;

  return (
    <article
      className={clsx(
        "rounded-panel border border-l-2 border-ig-line bg-ig-hull",
        severityBorder[insight.severity],
      )}
      aria-labelledby={`insight-${insight.id}`}
    >
      <div className={clsx(compact ? "p-3" : "p-4")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={insight.severity} />
            <span className="text-xs text-ig-muted">{severityWord[insight.severity]}</span>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="text-xs text-ig-muted">Confidence</span>
            <span className="ig-num text-xs text-ig-frost">{insight.confidence}%</span>
          </span>
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
          className={clsx(
            "mt-3 font-semibold leading-6 text-ig-frost",
            compact ? "text-sm" : "text-base",
          )}
        >
          {insight.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-ig-muted">{insight.summary}</p>

        <Collapsible
          tone="plain"
          headingLevel={4}
          openLabel="Open"
          closeLabel="Close"
          className="mt-3"
          title="Crew action and evidence"
          summary={
            evidenceCount === 0
              ? "No linked experiment — do not rely on this"
              : `${evidenceCount} linked ${evidenceCount === 1 ? "experiment" : "experiments"}`
          }
        >
          <div className="space-y-3">
            <div className="rounded-control border border-ig-line bg-ig-raised px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ig-frost">
                <ShieldCheck size={13} aria-hidden="true" className="text-ig-quench" />
                Recommended crew action
              </p>
              <p className="mt-1 text-sm leading-6 text-ig-muted">{insight.recommendation}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-ig-muted">Evidence</span>
              {insight.evidenceIds.map((id) => (
                <CitationChip key={id} id={id} />
              ))}
              {evidenceCount === 0 ? (
                <span className="text-xs text-ig-alarm">No linked experiment. Do not rely on this.</span>
              ) : null}
            </div>

            {showActions ? (
              <div className="flex flex-wrap gap-3 border-t border-ig-line pt-2 text-xs">
                <Link
                  to="/app/simulator"
                  className="inline-flex items-center gap-1 text-ig-flame-blue hover:underline"
                >
                  Model this risk <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
                <Link
                  to="/app/playbook"
                  className="inline-flex items-center gap-1 text-ig-flame-blue hover:underline"
                >
                  Open the playbook <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </div>
        </Collapsible>
      </div>
    </article>
  );
}
