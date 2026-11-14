import { clsx } from "clsx";
import { FileText } from "lucide-react";
import { getExperiment, useIgnis } from "@/app/data";

export interface CitationChipProps {
  id: string;
  label?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Evidence chip. Shows the experiment name and selects/draws attention to it
 * when clicked. The id is always kept in the accessible name.
 */
export function CitationChip({ id, label, onSelect, className }: CitationChipProps) {
  const { select } = useIgnis();
  const experiment = getExperiment(id);
  const text = label ?? (experiment ? `${experiment.acronym} · ${experiment.name}` : id);

  return (
    <button
      type="button"
      title={experiment?.name ?? id}
      onClick={() => (onSelect ? onSelect(id) : select(id))}
      className={clsx(
        "inline-flex max-w-full items-center gap-1 rounded-control border border-ig-line bg-ig-raised px-1.5 py-0.5 text-xs text-ig-muted hover:text-ig-frost",
        className,
      )}
    >
      <FileText size={12} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{text}</span>
    </button>
  );
}
