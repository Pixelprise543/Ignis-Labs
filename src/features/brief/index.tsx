import { Check, Download, FileText, Printer, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildBriefMarkdown, useIgnis } from "@/app/data";
import { Button, Panel } from "@/design-system";

export function BriefPage() {
  const { scenario, weights, compareIds, setDrawerOpen } = useIgnis();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markdown = useMemo(
    () => buildBriefMarkdown(scenario, weights, compareIds),
    [scenario, weights, compareIds],
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      setError("The browser blocked clipboard access. Select the preview text and copy it manually.");
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ignis-brief-${scenario.id}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ig-frost">Mission safety brief</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ig-muted">
            A cited, printable brief for <span className="text-ig-frost">{scenario.label}</span>.
            Generated locally from the same data as every other view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={copied ? <Check size={14} aria-hidden="true" /> : <FileText size={14} aria-hidden="true" />}
            onClick={() => void copy()}
          >
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} aria-hidden="true" />}
            onClick={download}
          >
            Download .md
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer size={14} aria-hidden="true" />}
            onClick={() => window.print()}
          >
            Print / PDF
          </Button>
          <Button
            size="sm"
            icon={<Sparkles size={14} aria-hidden="true" />}
            onClick={() => setDrawerOpen(true)}
          >
            Ask Ignis
          </Button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="rounded-control border border-ig-alarm px-3 py-2 text-sm text-ig-alarm">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Panel
          title="Preview"
          description="Markdown rendered exactly as it will export."
          bodyClassName="p-0"
        >
          <div className="ig-markdown max-h-[70vh] overflow-y-auto p-4 sm:p-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Included in this brief">
            <ul className="space-y-2 text-sm leading-6 text-ig-muted">
              <li>Scenario values and assumptions</li>
              <li>Top three evidence-linked risks</li>
              <li>Ranked material priorities</li>
              <li>Full five-phase crew response</li>
              <li>Scoring weights and confidence notes</li>
              <li>Limitations and coverage caveats</li>
            </ul>
          </Panel>

          <Panel title="Priority mix">
            <ul className="space-y-2">
              {(
                [
                  ["Hazard severity", weights.hazardSeverity],
                  ["Exploration value", weights.exploration],
                  ["Evidence strength", weights.evidence],
                  ["Recency", weights.recency],
                ] as const
              ).map(([label, value]) => (
                <li key={label}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-ig-muted">{label}</span>
                    <span className="ig-num text-ig-frost">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="mt-1 flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: 10 }, (_, index) => (
                      <span
                        key={index}
                        className={
                          index < Math.round(value * 10)
                            ? "h-1 flex-1 rounded-[1px] bg-ig-flame-blue"
                            : "h-1 flex-1 rounded-[1px] bg-ig-line"
                        }
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-ig-muted">
              Adjust these weights on the Rankings page. The brief always reflects the current mix.
            </p>
          </Panel>

          <Panel title="Honest limits">
            <p className="text-xs leading-5 text-ig-muted">
              Derived scores and material risks are decision-support estimates, not measured ignition
              thresholds. Absence of a risk signal is not proof of safety. Check the confidence badge
              on every experiment you cite.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
