import { clsx } from "clsx";
import { FileText } from "lucide-react";
import type { CSSProperties } from "react";
import { resolveEvidence, useIgnis } from "@/app/data";

export interface CitationChipProps {
  id: string;
  label?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

function truncate(text: string, max = 48): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/**
 * Evidence chip. Dataset evidence ids name either an experiment or one of its
 * findings, so the chip resolves both and always selects the owning experiment.
 * An id that resolves to nothing stays visible but says so: never silently
 * dropped, never presented as valid.
 *
 * A resolved chip is a frosted tint. An unresolved one is a solid alarm fill with
 * dark ink, because alarm-coloured text on an alarm-tinted wash measures 3.8:1 -
 * below AA. The solid fill measures 6.0:1 and keeps the icon visible.
 */
export function CitationChip({ id, label, onSelect, className }: CitationChipProps) {
  const { select } = useIgnis();
  const ref = resolveEvidence(id);
  const experiment = ref?.experiment;
  const finding = ref?.finding;

  const text =
    label ??
    (experiment
      ? finding
        ? `${experiment.acronym} · ${truncate(finding.text)}`
        : `${experiment.acronym} · ${experiment.name}`
      : `${id} · unresolved`);

  const title = experiment
    ? `${experiment.name}${finding ? ` — ${finding.text}` : ""}`
    : `No experiment or finding matches the id "${id}"`;

  return (
    <button
      type="button"
      title={title}
      disabled={!experiment}
      onClick={() => {
        if (!experiment) return;
        if (onSelect) onSelect(experiment.id);
        else select(experiment.id);
      }}
      style={{ "--tint": experiment ? "var(--ig-line)" : "var(--ig-alarm)" } as CSSProperties}
      className={clsx(
        "inline-flex max-w-full items-center gap-1 rounded-control px-1.5 py-0.5 text-xs",
        experiment
          ? "ig-glass-tint hover:text-ig-frost"
          : "ig-solid-chip",
        className,
      )}
    >
      <FileText size={12} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{text}</span>
    </button>
  );
}
