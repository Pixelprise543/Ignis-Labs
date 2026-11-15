import * as React from "react";
import { useIgnis } from "@/store/useIgnis";
import { getExperiments, getExperiment } from "@/lib/data";
import { searchExperiments } from "@/lib/search";
import { ConfidenceBadge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system";
import { clsx } from "clsx";

export function ExplorePage() {
  const { filters, setFilters, select, setDrawerOpen } = useIgnis();
  const [query, setQuery] = React.useState(filters.query);
  const experiments = searchExperiments(query, getExperiments());

  const filtered = experiments.filter((e) => {
    if (filters.fuelTypes.length && !filters.fuelTypes.includes(e.fuelType)) return false;
    if (filters.facilities.length && !filters.facilities.includes(e.facility)) return false;
    if (filters.regimes.length && !filters.regimes.includes(e.regime)) return false;
    return true;
  });

  const handleOpen = (id: string) => {
    select(id);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 lg:max-w-md relative">
          <input
            type="search"
            placeholder="Search experiments…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFilters({ query: e.target.value });
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-ig-line bg-black/40 text-ig-frost focus:outline-none focus:ring-2 focus:ring-ig-flame-blue"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setFilters({ query: "" });
              }}
              className="absolute right-3 top-3 text-ig-muted hover:text-ig-frost"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilters({ fuelTypes: [] })}>
            Fuel types
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFilters({ regimes: [] })}>
            Regimes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFilters({ facilities: [] })}>
            Facilities
          </Button>
        </div>
      </div>

      <Tabs value="all" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="all" onClick={() => {}}>
            All ({filtered.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-ig-line">
              <thead>
                <tr className="border-b border-ig-line bg-black/20">
                  <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                    Experiment
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                    Regime
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.id} className="border-b border-ig-line/50 hover:bg-black/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ig-frost">{exp.name}</div>
                      <div className="text-xs text-ig-muted">{exp.acronym} · {exp.fuel}</div>
                    </td>
                    <td className="px-4 py-3 text-ig-muted">{exp.facility}</td>
                    <td className="px-4 py-3 text-ig-muted">{exp.regime}</td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge confidence={exp.confidence} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="text" size="sm" onClick={() => handleOpen(exp.id)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ig-muted">
                      No experiments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const ExperimentDrawer = React.forwardRef<HTMLDivElement, { id: string; className?: string }>(
  ({ id, className }, ref) => {
    const exp = getExperiment(id);
    if (!exp) return null;

    return (
      <div ref={ref} className={clsx("ig-glass p-6", className)}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-ig-frost">{exp.name}</h2>
            <div className="text-xs text-ig-muted mt-1">{exp.acronym}</div>
          </div>
          <ConfidenceBadge confidence={exp.confidence} />
        </div>
        <p className="text-ig-muted mb-4 leading-relaxed">{exp.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="ig-hull p-3 rounded-lg border border-ig-line">
            <div className="text-xs text-ig-muted">Facility</div>
            <div className="text-sm text-ig-frost">{exp.facility}</div>
          </div>
          <div className="ig-hull p-3 rounded-lg border border-ig-line">
            <div className="text-xs text-ig-muted">Regime</div>
            <div className="text-sm text-ig-frost">{exp.regime}</div>
          </div>
          <div className="ig-hull p-3 rounded-lg border border-ig-line">
            <div className="text-xs text-ig-muted">Fuel</div>
            <div className="text-sm text-ig-frost">{exp.fuelType} · {exp.fuel}</div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ig-frost mb-2">Findings</h3>
          <ul className="space-y-2">
            {exp.findings.map((f) => (
              <li key={f.id} className="flex gap-2">
                <span className="text-ig-flame-blue">▸</span>
                <span className="text-sm text-ig-frost">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ig-frost mb-2">Safety takeaway</h3>
          <p className="text-sm text-ig-frost">{exp.safetyTakeaway}</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {exp.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded bg-black/30 border border-ig-line text-xs text-ig-muted">
              {tag}
            </span>
          ))}
        </div>
        <div className="border-t border-ig-line pt-4">
          <h3 className="text-sm font-semibold text-ig-frost mb-2">Sources</h3>
          <div className="space-y-1">
            {exp.sources.map((s) => (
              <div key={s.url || s.title} className="flex items-start gap-2 text-xs text-ig-muted">
                <span className="text-ig-flame-blue">→</span>
                <span className="max-w-[300px] truncate">{s.title}</span>
                {s.org && <span className="ml-1">· {s.org}</span>}
                {s.year && <span className="ml-1">· {s.year}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ExperimentDrawer.displayName = "ExperimentDrawer";
