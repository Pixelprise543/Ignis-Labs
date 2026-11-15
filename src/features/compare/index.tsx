import { useIgnis } from "@/store/useIgnis";
import { getExperiment } from "@/lib/data";
import { Badge, ConfidenceBadge, Button } from "@/design-system";

export function ComparePage() {
  const { compareIds, clearCompare, toggleCompare, scenario } = useIgnis();
  const selected = compareIds.map((id) => getExperiment(id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ig-frost">Compare experiments</h2>
          <p className="text-sm text-ig-muted">
            Side-by-side comparison for <span className="text-ig-frost font-semibold">{scenario.label}</span>. Select
            up to 4 experiments from Rankings or Explore.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearCompare} disabled={compareIds.length === 0}>
          Clear all
        </Button>
      </div>

      {compareIds.length === 0 ? (
        <div className="ig-glass p-8 text-center text-ig-muted border border-ig-line rounded-xl">
          Go to Rankings or Explore and click "Add to compare" on up to 4 experiments.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-[max-content]">
            {selected.map((exp) => {
              if (!exp) return null;
              return (
                <div key={exp.id} className="ig-glass w-72 border border-ig-line flex flex-col rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-ig-line relative">
                    <button
                      onClick={() => toggleCompare(exp.id)}
                      className="absolute top-2 right-2 text-ig-muted hover:text-ig-alarm"
                      aria-label="Remove from compare"
                    >
                      ✕
                    </button>
                    <div>
                      <h3 className="font-semibold text-ig-frost">{exp.name}</h3>
                      <div className="text-xs text-ig-muted">{exp.acronym}</div>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <ConfidenceBadge confidence={exp.confidence} size="sm" />
                      <Badge variant="info" size="sm">{exp.regime}</Badge>
                    </div>
                    <p className="text-sm text-ig-muted mb-4 leading-relaxed">{exp.summary}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ig-muted">Facility</span>
                        <span className="text-ig-frost">{exp.facility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ig-muted">Fuel</span>
                        <span className="text-ig-frost">{exp.fuelType} · {exp.fuel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ig-muted">Years</span>
                        <span className="text-ig-frost font-mono">
                          {exp.years[0]}–{exp.years[1] ?? "present"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-ig-line p-3">
                    <p className="text-xs text-ig-frost">{exp.safetyTakeaway}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
