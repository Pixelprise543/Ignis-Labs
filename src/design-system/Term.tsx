import type { ReactNode } from "react";
import { getGlossaryTerm } from "@/app/data";
import { Tooltip } from "./Tooltip";

export interface TermProps {
  id: string;
  children?: ReactNode;
}

/**
 * Inline glossary term. Falls back to plain text when the term is missing,
 * so a typo degrades instead of breaking a page.
 */
export function Term({ id, children }: TermProps) {
  const term = getGlossaryTerm(id);

  if (!term) return <>{children ?? id}</>;

  return (
    <Tooltip
      label={
        <>
          <span className="font-medium">{term.term}.</span> {term.plain}
        </>
      }
    >
      <span className="cursor-help border-b border-dotted border-ig-muted text-ig-frost">
        {children ?? term.term}
      </span>
    </Tooltip>
  );
}
