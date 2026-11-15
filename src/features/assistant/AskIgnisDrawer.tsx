import * as React from "react";
import { useIgnis } from "@/store/useIgnis";
import { askSI } from "@/lib/si";
import { getScenario } from "@/lib/scenarios";
import { Panel, Button } from "@/design-system";

export function AskIgnisDrawer() {
  const { scenario, setDrawerOpen, selectedId, compareIds } = useIgnis();
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const modes = [
    { id: "summarize", label: "Summarize experiment(s)" },
    { id: "compare", label: "Compare experiment(s)" },
    { id: "interpret", label: "Interpret scenario" },
    { id: "ask", label: "Ask a question" },
    { id: "brief", label: "Mission brief" },
    { id: "playbook", label: "Crew playbook" },
  ];
  const [mode, setMode] = React.useState<"summarize" | "compare" | "interpret" | "ask" | "brief" | "playbook">(
    "ask",
  );

  const experimentIds = selectedId ? [selectedId] : compareIds;

  const run = async () => {
    setLoading(true);
    try {
      const res = await askSI({
        mode,
        experimentIds,
        scenario: getScenario(scenario.id),
        question: mode === "ask" ? question : undefined,
      });
      setAnswer(res.answerMarkdown);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Panel title="Ask Ignis" subtitle="Grounded only in our dataset — cites experiment IDs.">
        <div className="space-y-3">
          <div className="flex gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === m.id
                    ? "bg-ig-raised text-ig-frost border border-ig-line"
                    : "text-ig-muted hover:bg-black/30 hover:text-ig-frost"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "ask" && (
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Is a 34% oxygen cabin riskier on the Moon?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ig-line bg-black/40 text-ig-frost focus:outline-none focus:ring-2 focus:ring-ig-flame-blue"
              />
              <button
                onClick={run}
                disabled={loading || !question.trim()}
                className="absolute right-2 top-2 px-2 py-1 text-xs ig-button variant-primary"
              >
                Ask
              </button>
            </div>
          )}

          {mode !== "ask" && (
            <Button variant="primary" size="sm" onClick={run} disabled={loading} fullWidth>
              {loading ? "Loading…" : `Run ${mode}`}
            </Button>
          )}

          {answer && (
            <div className="mt-3 pt-3 border-t border-ig-line max-h-[300px] overflow-y-auto text-sm text-ig-frost leading-relaxed" dangerouslySetInnerHTML={{ __html: answer }} />
          )}
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
          Close
        </Button>
      </div>
    </div>
  );
}
