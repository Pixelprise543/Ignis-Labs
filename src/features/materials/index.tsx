import { useIgnis } from "@/store/useIgnis";
import { getMaterialMatrix, getMaterialRisks } from "@/lib/materials";
import { getMaterials } from "@/lib/data";
import { Panel, SeverityBadge } from "@/design-system";

const LEVEL_COLORS: Record<string, string> = {
  info: "bg-black/30 border-black/40 text-ig-frost",
  caution: "bg-ig-amber/20 border-ig-amber/40 text-black",
  high: "bg-ig-ember/20 border-ig-ember/40 text-black",
  critical: "bg-ig-alarm/20 border-ig-alarm/40 text-white",
};

export function MaterialsPage() {
  const { scenario } = useIgnis();
  const matrix = getMaterialMatrix();
  const materials = getMaterials();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Material risk matrix</h2>
        <p className="text-sm text-ig-muted">
          Material × scenario flammability risk for{" "}
          <span className="text-ig-frost font-semibold">{scenario.label}</span>. Decision-support estimates, not physics
          simulations.
        </p>
      </div>

      <Panel subtitle="Rows are materials; columns are scenarios. Cells show the risk level.">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-ig-line">
            <thead>
              <tr className="border-b border-ig-line bg-black/20 sticky top-0 z-10">
                <th className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider">
                  Material
                </th>
                {matrix.scenarios.map((s) => (
                  <th
                    key={s.id}
                    className="px-4 py-3 text-xs font-semibold text-ig-muted uppercase tracking-wider text-center"
                  >
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.material.id} className="border-b border-ig-line/50 hover:bg-black/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ig-frost">{row.material.name}</div>
                    <div className="text-xs text-ig-muted">{row.material.category}</div>
                  </td>
                  {row.risks.map((risk, i) => {
                    const level = getLevel(risk);
                    return (
                      <td
                        key={i}
                        className={`px-4 py-3 text-center transition-colors ${LEVEL_COLORS[level]}`}
                      >
                        <span className="font-mono font-bold">{risk}</span>
                        <br />
                        <span className="text-[10px] uppercase tracking-wider">{level}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Hot cells for this scenario" subtitle="Highest-risk materials in the selected scenario.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {getMaterialRisks(scenario)
            .sort((a, b) => b.risk - a.risk)
            .slice(0, 6)
            .map((risk) => {
              const material = materials.find((m) => m.id === risk.materialId);
              const level = getLevel(risk.risk);
              return (
                <div key={risk.materialId} className="ig-hull p-3 border border-ig-line rounded-lg flex flex-col">
                  <div className="text-xs font-semibold text-ig-frost">{material?.name ?? risk.materialId}</div>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-2xl font-mono font-bold text-ig-frost">{risk.risk}</span>
                    <span className="text-xs text-ig-muted">/100</span>
                  </div>
                  <SeverityBadge severity={level as any} size="sm" className="mt-2" />
                  <div className="mt-2 text-[10px] text-ig-muted line-clamp-2">{risk.rationale}</div>
                </div>
              );
            })}
        </div>
      </Panel>
    </div>
  );
}

function getLevel(risk: number): "info" | "caution" | "high" | "critical" {
  if (risk >= 75) return "critical";
  if (risk >= 55) return "high";
  if (risk >= 35) return "caution";
  return "info";
}
