import { ExternalLink, FileText, Radio } from "lucide-react";
import { Badge } from "@/design-system";
import type { NasaLiterature } from "@/lib/nasaTypes";
import { formatRetrievedAt } from "@/lib/nasa";

/**
 * NASA's technical report library, next to a chat answer.
 *
 * Deliberately separate from the experiment citations above it: a report is
 * literature, not one of the 20 scored records, and it is never converted into
 * a metric. Every visible string comes from NTRS; the only thing Ignis adds is
 * the ordering and the live/snapshot label that says how fresh it is.
 */

/** Keeps a card short enough to scan; cut on a word boundary, never mid-word. */
function excerpt(text: string, limit = 300): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > limit * 0.6 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
}

export function NasaLiteraturePanel({ literature }: { literature: NasaLiterature }) {
  if (literature.results.length === 0) return null;

  const live = literature.source === "live";

  return (
    <section
      aria-label="NASA technical reports"
      className="mt-3 border-t border-ig-line pt-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold text-ig-frost">
          <FileText size={12} aria-hidden="true" className="text-ig-flame-blue" />
          From NASA&rsquo;s technical report library
        </h4>
        <Badge tone={live ? "olive" : "amber"} icon={<Radio size={11} />}>
          {live ? "Live" : "Snapshot"}{" "}
          <span className="ig-num">{formatRetrievedAt(literature.retrievedAt)}</span>
        </Badge>
      </div>

      <p className="mt-1 text-[11px] leading-4 text-ig-muted">
        NTRS query <span className="ig-num">{literature.query}</span> ·{" "}
        <span className="ig-num">{literature.results.length}</span>{" "}
        {literature.results.length === 1 ? "report" : "reports"}
      </p>

      <ol className="mt-2 space-y-2">
        {literature.results.map((publication) => (
          <li
            key={publication.id}
            className="rounded-control border border-ig-glass-control-rim bg-ig-glass-control px-2.5 py-2"
          >
            <a
              href={publication.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium leading-5 text-ig-flame-blue underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-flame-blue"
            >
              {publication.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            <p className="mt-0.5 text-[11px] leading-4 text-ig-muted">
              <span className="ig-num">{publication.year ?? "year not listed"}</span>
              {" · "}
              {publication.center ?? "centre not listed"}
              {" · "}
              <span className="ig-num">
                {publication.reportNumber ?? "no report number"}
              </span>
            </p>

            {publication.abstract ? (
              <p className="mt-1 text-xs leading-5 text-ig-frost/90">
                {excerpt(publication.abstract)}
              </p>
            ) : (
              <p className="mt-1 text-xs leading-5 text-ig-muted">
                NASA published no abstract for this report.
              </p>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              {publication.pdfUrl ? (
                <a
                  href={publication.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-ig-flame-blue underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-flame-blue"
                >
                  Open PDF
                  <ExternalLink size={11} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
              {publication.documentType ? (
                <span className="text-[11px] text-ig-muted">{publication.documentType}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-2 text-[11px] leading-4 text-ig-muted">
        Titles and abstracts are NASA&rsquo;s own words. These reports are literature, not part
        of Ignis&rsquo;s scored dataset.
      </p>
    </section>
  );
}
