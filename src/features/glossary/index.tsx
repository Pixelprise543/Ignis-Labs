import * as React from "react";
import { getGlossary } from "@/lib/data";

export function GlossaryPage() {
  const terms = getGlossary();
  const [query, setQuery] = React.useState("");

  const filtered = terms.filter((t) =>
    t.term.toLowerCase().includes(query.toLowerCase()) ||
    t.plain.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Glossary</h2>
        <p className="text-sm text-ig-muted">
          Plain-language combustion terms. Terms also appear as inline tooltips across the app.
        </p>
      </div>

      <div className="relative">
        <input
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-ig-line bg-black/40 text-ig-frost focus:outline-none focus:ring-2 focus:ring-ig-flame-blue"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((term) => (
          <div key={term.id} className="ig-hull p-4 border border-ig-line rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-ig-frost">{term.term}</h3>
              <span className="text-xs font-mono text-ig-muted">{term.id}</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-ig-frost leading-relaxed">{term.plain}</div>
              <div className="pt-2 border-t border-black/20">
                <span className="text-xs text-ig-muted block mb-1">Technical:</span>
                <span className="text-xs text-ig-muted italic">{term.technical}</span>
              </div>
              {term.related.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {term.related.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded bg-black/20 border border-black/30 text-[10px] text-ig-muted"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="ig-glass p-8 text-center text-ig-muted">
            No terms match your search.
          </div>
        )}
      </div>
    </div>
  );
}
