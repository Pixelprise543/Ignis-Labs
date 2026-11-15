import { useIgnis } from "@/store/useIgnis";
import { getExperiments } from "@/lib/data";
import { rankExperiments } from "@/lib/scoring";
import { Panel, Badge, Button } from "@/design-system";

export function RankingsPage() {
  const { scenario, weights, setWeights, resetWeights, compareIds, toggleCompare, select } = useIgnis();
  const experiments = getExperiments();
  const ranked = rankExperiments(experiments, weights, scenario);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-ig-frost">Ranked experiments</h2>
          <p className="text-sm text-ig-muted">
            Transparent scoring for <span className="text-ig-frost font-semibold">{scenario.label}</span>. Adjust the
            weights to see how the order changes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={resetWeights}>
            Reset weights
          </Button>
        </div>
      </div>

      {/* Weight sliders */}
      <Panel title="Scoring weights" subtitle="Drag to rebalance what matters most.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { key: "hazardSeverity", label: "Hazard severity", desc: "Match to scenario conditions" },
            { key: "exploration", label: "Exploration value", desc: "Extends the evidence base" },
            { key: "evidence", label: "Evidence strength", desc: "Verified, well-sourced" },
            { key: "recency", label: "Recency", desc: "How recent the data is" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-ig-frost">{label}</span>
                <span className="text-xs font-mono text-ig-flame-blue">{Math.round(weights[key as keyof typeof weights] * 100)}%</span>
              </div>
              <div className="text-xs text-ig-muted">{desc}</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights[key as keyof typeof weights]}
                onChange={(e) =>
                  setWeights({ [key]: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-ig-flame-blue"
              />
            </div>
          ))}
        </div>
      </Panel>

      {/* Results */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-ig-line">
          <thead>
            <tr className="border-b border-ig-line bg-black/20 sticky top-0 z-10">
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                Experiment
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-right">
                Composite
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-right">
                Hazard
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-right">
                Evidence
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-right">
                Recency
              </th>
              <th className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => {
              const exp = r.experiment;
              const inCompare = compareIds.includes(exp.id);
              return (
                <tr key={exp.id} className="border-b border-ig-line/50 hover:bg-black/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-ig-muted">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ig-frost" onClick={() => select(exp.id)} style={{ cursor: "pointer" }}>
                      {exp.name}
                    </div>
                    <div className="text-xs text-ig-muted">{exp.acronym} · {exp.facility}</div>
                    <Badge
                      variant={exp.confidence as "verified" | "curated" | "illustrative"}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-ig-frost">{r.composite}</td>
                  <td className="px-4 py-3 text-right font-mono text-ig-muted">{r.scores.hazardSeverity}</td>
                  <td className="px-4 py-3 text-right font-mono text-ig-muted">{r.scores.evidence}</td>
                  <td className="px-4 py-3 text-right font-mono text-ig-muted">{r.scores.recency}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={inCompare ? "primary" : "text"}
                      size="sm"
                      onClick={() => toggleCompare(exp.id)}
                    >
                      {inCompare ? "Remove" : "Add to compare"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
