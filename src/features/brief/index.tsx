import * as React from "react";
import { useIgnis } from "@/store/useIgnis";
import { buildBriefMarkdown } from "@/lib/brief";
import { Panel, Button } from "@/design-system";

export function BriefPage() {
  const { scenario, weights, compareIds } = useIgnis();
  const [markdown, setMarkdown] = React.useState<string | null>(null);

  const generate = () => {
    const md = buildBriefMarkdown(scenario, weights, compareIds);
    setMarkdown(md);
  };

  const download = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ignis-brief-${scenario.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Mission Safety Brief</h2>
        <p className="text-sm text-ig-muted">
          One-click brief for <span className="text-ig-frost font-semibold">{scenario.label}</span>. Generates markdown
          you can copy, download, or print to PDF. All figures are decision-support estimates.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={generate} disabled={!!markdown}>
          {markdown ? "Regenerate" : "Generate brief"}
        </Button>
        <Button variant="outline" onClick={download} disabled={!markdown}>
          Download .md
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          Print to PDF
        </Button>
      </div>

      {markdown && (
        <Panel title="Brief preview" subtitle={`Scenario: ${scenario.label}`}>
          <div className="prose prose-invert text-sm max-w-none">
            {markdown.split("\n").map((line, i) => (
              <div key={i} className="whitespace-pre-line">
                {line}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
