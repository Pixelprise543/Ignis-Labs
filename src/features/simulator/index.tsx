import * as React from "react";
import { useIgnis } from "@/store/useIgnis";
import { getMaterials } from "@/lib/data";
import { simulateRisk } from "@/lib/simulator";
import { Panel, SeverityBadge } from "@/design-system";

export function SimulatorPage() {
  const { scenario } = useIgnis();
  const materials = getMaterials();
  const [input, setInput] = React.useState<{
    materialId: string;
    gravityG: number;
    o2Percent: number;
    pressureKPa: number;
    flowCmPerS: number;
  }>({
    materialId: materials[0]?.id || "",
    gravityG: scenario.gravityG,
    o2Percent: scenario.o2Percent,
    pressureKPa: scenario.pressureKPa,
    flowCmPerS: 10,
  });
  const [result, setResult] = React.useState<ReturnType<typeof simulateRisk> | null>(null);

  const run = () => {
    setResult(simulateRisk(input as any));
  };

  React.useEffect(() => {
    run();
  }, [input.materialId, input.gravityG, input.o2Percent, input.pressureKPa, input.flowCmPerS]);

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">What-if risk estimator</h2>
        <p className="text-sm text-ig-muted">
          Decision-support estimate, not a physics simulation. Change any input to see how the risk moves.
        </p>
      </div>

      <Panel title="Inputs" subtitle="Material, gravity, oxygen, pressure, flow.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-ig-muted block mb-1">Material</label>
            <select
              value={input.materialId}
              onChange={(e) => setInput({ ...input, materialId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ig-line bg-black/40 text-ig-frost"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ig-muted block mb-1">Gravity (g)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="2"
              value={input.gravityG}
              onChange={(e) => setInput({ ...input, gravityG: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-ig-line bg-black/40 text-ig-frost font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-ig-muted block mb-1">O2 (%)</label>
            <input
              type="number"
              step="1"
              min="5"
              max="100"
              value={input.o2Percent}
              onChange={(e) => setInput({ ...input, o2Percent: parseFloat(e.target.value) || 21 })}
              className="w-full px-3 py-2 rounded-lg border border-ig-line bg-black/40 text-ig-frost font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-ig-muted block mb-1">Pressure (kPa)</label>
            <input
              type="number"
              step="0.1"
              min="5"
              max="150"
              value={input.pressureKPa}
              onChange={(e) =>
                setInput({ ...input, pressureKPa: parseFloat(e.target.value) || 101.3 })
              }
              className="w-full px-3 py-2 rounded-lg border border-ig-line bg-black/40 text-ig-frost font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-ig-muted block mb-1">Flow (cm/s)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={input.flowCmPerS}
              onChange={(e) => setInput({ ...input, flowCmPerS: parseFloat(e.target.value) || 10 })}
              className="w-full px-3 py-2 rounded-lg border border-ig-line bg-black/40 text-ig-frost font-mono"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Result" subtitle="Estimated fire risk for the selected conditions.">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-mono font-bold tabular-nums text-ig-frost">{result.risk}</div>
          <div className="text-2xl font-mono text-ig-muted">/100</div>
          <SeverityBadge severity={result.level} size="md" />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ig-frost">Drivers</h3>
          {result.drivers.map((d) => (
            <div key={d.factor} className="ig-hull p-3 rounded-lg border border-ig-line">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-ig-frost">{d.factor}</span>
                <span className={`text-xs font-mono ${d.direction === "raises" ? "text-ig-ember" : "text-ig-quench"}`}>
                  {d.direction === "raises" ? "↑ raises" : "↓ lowers"}
                </span>
              </div>
              <div className="text-xs font-mono text-ig-frost">{d.weight}</div>
              <p className="mt-1 text-xs text-ig-muted">{d.explanation}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-ig-frost mb-2">Nearest supporting experiments</h3>
          <div className="flex gap-2 flex-wrap">
            {result.nearestExperimentIds.map((id) => (
              <span
                key={id}
                className="px-2 py-1 rounded bg-black/30 border border-ig-line text-xs text-ig-muted"
              >
                {id}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-ig-line pt-4">
          <h3 className="text-sm font-semibold text-ig-frost mb-2">Caveats</h3>
          <ul className="space-y-1 text-xs text-ig-muted">
            {result.caveats.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-ig-alarm">⚠</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
