import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SIResponse } from "@/contracts/types";
import { askSI, useIgnis } from "@/app/data";
import { Badge, CitationChip, Drawer } from "@/design-system";

interface AssistantMessage {
  id: string;
  markdown: string;
  response: SIResponse;
}

interface ChatMessage extends AssistantMessage {
  role: "assistant";
}

interface UserMessage {
  role: "user";
  id: string;
  text: string;
}

type Message = ChatMessage | UserMessage;

const SUGGESTIONS = [
  "Is a 34% oxygen cabin riskier on the Moon?",
  "What should the crew do first if a fire starts on Mars?",
  "Which evidence in this scenario is weakest?",
  "Summarize the top fire-safety risk for this scenario.",
];

/**
 * Grounded assistant. It never invents an answer outside the dataset: the
 * fallback model is deterministic, and every citation is checked by
 * `askSI` before it reaches this component.
 */
export function AskIgnisDrawer() {
  const { drawerOpen, setDrawerOpen, scenario } = useIgnis();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, drawerOpen]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setError(null);
    setInput("");
    setMessages((current) => [...current, { role: "user", id: `q-${requestId}`, text: trimmed }]);
    setLoading(true);

    try {
      const response = await askSI({
        mode: "ask",
        experimentIds: [],
        scenario,
        question: trimmed,
      });
      if (requestRef.current !== requestId) return;
      setMessages((current) => [
        ...current,
        { role: "assistant", id: `a-${requestId}`, markdown: response.answerMarkdown, response },
      ]);
    } catch {
      if (requestRef.current !== requestId) return;
      setError("Ignis could not answer that just now. Check your connection and try again, or read the Insights view while the assistant recovers.");
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }

  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles size={14} aria-hidden="true" className="text-ig-flame-blue" />
          Ask Ignis
        </span>
      }
      footer={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="space-y-2"
        >
          <label className="sr-only" htmlFor="ignis-question">
            Ask a fire-safety question
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="ignis-question"
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder={`Ask about ${scenario.label} fire safety…`}
              className="min-h-[44px] flex-1 resize-none rounded-control border border-ig-line bg-ig-hull px-2.5 py-2 text-sm text-ig-frost placeholder:text-ig-muted"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="h-10 shrink-0 rounded-control bg-ig-flame-blue px-3 text-sm font-medium text-ig-on-accent hover:bg-ig-amber disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="text-[11px] leading-4 text-ig-muted">
            Answers cite experiment IDs from this dataset. Grounded summaries, not a live model
            flight computer. Enter sends, Shift+Enter adds a line.
          </p>
        </form>
      }
    >
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-panel border border-ig-line bg-ig-hull px-3 py-2">
          <p className="text-xs text-ig-muted">Active scenario</p>
          <p className="mt-0.5 text-sm font-medium text-ig-frost">{scenario.label}</p>
          <p className="mt-1 text-xs leading-5 text-ig-muted">
            <span className="ig-num">{scenario.gravityG.toFixed(2)}g</span> ·{" "}
            <span className="ig-num">{scenario.o2Percent ?? "—"}% O2</span> ·{" "}
            <span className="ig-num">
              {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
            </span>
          </p>
          {scenario.assumption ? (
            <p className="mt-1 text-xs text-ig-amber">
              These values are assumptions. Verify them before relying on an answer.
            </p>
          ) : null}
        </div>

        {messages.length === 0 ? (
          <div>
            <p className="text-sm leading-6 text-ig-frost">
              I answer only from the experiments, insights and material risks already in Ignis. If the
              dataset has no evidence, I say so instead of guessing.
            </p>
            <p className="mt-2 text-xs text-ig-muted">Try one of these:</p>
            <div className="mt-2 space-y-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="w-full rounded-control border border-ig-line bg-ig-hull px-2.5 py-2 text-left text-sm text-ig-frost hover:bg-ig-raised"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-4">
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-panel border border-ig-line bg-ig-raised px-3 py-2 text-sm leading-6 text-ig-frost">
                  {message.text}
                </p>
              </div>
            ) : (
              <div key={message.id} className="rounded-panel border border-ig-line bg-ig-hull p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone={message.response.fallback ? "amber" : "olive"}>
                    {message.response.fallback ? "Offline fallback" : "Model answer"}
                  </Badge>
                  <span className="ig-num text-[11px] text-ig-muted">{message.response.model}</span>
                  <span className="text-[11px] text-ig-muted">
                    Grounding <span className="ig-num">{message.response.groundingScore}%</span>
                  </span>
                </div>
                <div className="ig-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.markdown}</ReactMarkdown>
                </div>
                {message.response.citations.length > 0 ? (
                  <div className="mt-3 border-t border-ig-line pt-2">
                    <p className="mb-1.5 text-[11px] text-ig-muted">Cited experiments</p>
                    <div className="flex flex-wrap gap-1.5">
                      {message.response.citations.map((id) => (
                        <CitationChip key={id} id={id} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 border-t border-ig-line pt-2 text-xs text-ig-muted">
                    No experiment in this dataset supports a grounded answer to that question.
                  </p>
                )}
                {message.response.invalidCitationsRemoved > 0 ? (
                  <p className="mt-2 text-[11px] text-ig-amber">
                    Removed <span className="ig-num">{message.response.invalidCitationsRemoved}</span>{" "}
                    citation(s) that did not map to a real experiment.
                  </p>
                ) : null}
              </div>
            ),
          )}

          {loading ? (
            <div className="rounded-panel border border-ig-line bg-ig-hull p-3" aria-busy="true">
              <p className="text-xs text-ig-muted">Searching the evidence library…</p>
              <div className="mt-2 space-y-1.5">
                <div className="h-3 w-4/5 animate-pulse rounded-control bg-ig-raised" />
                <div className="h-3 w-3/5 animate-pulse rounded-control bg-ig-raised" />
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="rounded-control border border-ig-alarm px-3 py-2 text-sm text-ig-alarm">
            {error}
          </p>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </Drawer>
  );
}
