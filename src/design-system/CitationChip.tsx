import { clsx } from "clsx";
import { FileText } from "lucide-react";
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
      className={clsx(
        "inline-flex max-w-full items-center gap-1 rounded-control border px-1.5 py-0.5 text-xs",
        experiment
          ? "border-ig-line bg-ig-raised text-ig-muted hover:text-ig-frost"
          : "border-ig-alarm text-ig-alarm",
        className,
      )}
    >
      <FileText size={12} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{text}</span>
    </button>
  );
}
