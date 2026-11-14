import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getGlossary } from "@/app/data";
import { EmptyState, Panel } from "@/design-system";

export function GlossaryPage() {
  const glossary = getGlossary();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return glossary;
    return glossary.filter((term) =>
      [term.term, term.plain, term.technical, ...term.related].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [glossary, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ig-frost">Glossary</h1>
        <p className="mt-1 text-sm leading-6 text-ig-muted">
          Combustion terms in plain language. The same definitions appear as inline tooltips wherever a
          term is underlined.
        </p>
      </header>

      <div className="relative">
        <Search
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ig-muted"
        />
        <label className="sr-only" htmlFor="glossary-search">
          Search glossary
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms, definitions or related ideas"
          className="h-10 w-full rounded-control border border-ig-line bg-ig-hull pl-8 pr-3 text-sm text-ig-frost placeholder:text-ig-muted"
        />
      </div>

      <p className="text-xs text-ig-muted">
        <span className="ig-num">{filtered.length}</span> of{" "}
        <span className="ig-num">{glossary.length}</span> terms
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No term matches that search"
          message="Try a shorter word, or clear the search to see every definition."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((term) => (
            <li key={term.id}>
              <Panel
                title={term.term}
                bodyClassName="px-4 pb-4"
                padded={false}
                className="scroll-mt-24"
              >
                <div className="px-4 pb-4 pt-3">
                  <p className="text-sm leading-6 text-ig-frost">{term.plain}</p>
                  <p className="mt-2 text-xs leading-5 text-ig-muted">{term.technical}</p>
                  {term.related.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-ig-muted">Related</span>
                      {term.related.map((related) => (
                        <button
                          key={related}
                          type="button"
                          onClick={() => setQuery(related.replace(/-/g, " "))}
                          className="rounded-control border border-ig-line px-1.5 py-0.5 text-xs text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
                        >
                          {related.replace(/-/g, " ")}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
