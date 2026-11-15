import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";
import { getExperiments } from "@/lib/data";
import { regimeFor, formatGravity } from "@/lib/scenarios";
import { Panel, Badge } from "@/design-system";

const GOLD = "var(--ig-flame-blue)";
const OLIVE = "var(--ig-quench)";
const AMBER = "var(--ig-amber)";

interface FlameDataPoint {
  regime: string;
  gravityG: number;
  minutes: number | null;
  experiment: string;
  acronym: string;
  confidence: string;
}

/**
 * Real burn-duration readings from the evidence base, grouped by gravity regime.
 * Nothing is invented: null means the value is not published, and the normal-g
 * cell is empty because no 1 g experiment exists in the dataset.
 */
function flameData(): FlameDataPoint[] {
  const experiments = getExperiments();
  const rows: FlameDataPoint[] = [];
  const seen = new Set<string>();
  for (const experiment of experiments) {
    const metric = experiment.metrics.find((m) => m.key === "burn-duration" || m.key === "flame-lifetime");
    const minutes = metric ? metric.value : null;
    if (minutes === null) continue;
    const regime = regimeFor(experiment.conditions.gravityG);
    const key = `${regime}-${experiment.acronym}-${minutes}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      regime,
      gravityG: experiment.conditions.gravityG,
      minutes,
      experiment: experiment.name,
      acronym: experiment.acronym,
      confidence: experiment.confidence,
    });
  }
  return rows;
}

const REGIME_COLOR: Record<string, string> = {
  microgravity: GOLD,
  "partial-g": OLIVE,
  "normal-g": AMBER,
};

export function FlameBehaviorGraph() {
  const rows = flameData();
  const regimes = ["microgravity", "partial-g", "normal-g"] as const;
  const byRegime: Record<string, FlameDataPoint[]> = { microgravity: [], "partial-g": [], "normal-g": [] };
  for (const row of rows) byRegime[row.regime].push(row);

  const maxMinutes = Math.max(0, ...rows.map((r) => r.minutes ?? 0));

  return (
    <Panel
      title="How fire behaves across gravity"
      description="Real burn-duration readings from the evidence base, grouped by gravity regime. "
    >
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Flame shape schematic + regime key */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-panel border border-ig-line bg-ig-hull p-3">
            <p className="text-xs font-semibold text-ig-frost mb-2">Flame shape by gravity</p>
            <div className="flex flex-col gap-2">
              {[
                { g: "0 g", regime: "microgravity", shape: "sphere", color: GOLD, note: "Round flame sphere, no rising plume" },
                { g: "0.16 g", regime: "partial-g", shape: "teardrop", color: OLIVE, note: "Short, rounded teardrop (lunar)" },
                { g: "1 g", regime: "normal-g", shape: "teardrop", color: AMBER, note: "Elongated teardrop (Earth), not measured in this dataset" },
              ].map((item) => (
                <div key={item.regime} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full border border-ig-line`}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-ig-frost">{item.g} — {item.regime}</span>
                  <span className="ml-auto text-xs text-ig-muted">{item.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-panel border border-ig-line bg-ig-hull p-3">
            <p className="text-xs font-semibold text-ig-frost mb-2">What the numbers mean</p>
            <p className="text-xs text-ig-muted leading-6">
              Each bar is one measured burn from a cited NASA experiment. Bars
              are solid fills — colour plus the regime label carry meaning,
              never colour alone. Regimes with no published reading show an
              empty cell rather than a guessed number.
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-8">
          <div className="rounded-panel border border-ig-line bg-ig-hull p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ig-frost">Burn duration by regime</h3>
              <span className="text-xs text-ig-muted">minutes, real readings only</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={regimes.map((regime) => ({
                    regime,
                    value: byRegime[regime].length > 0
                      ? Math.round(
                          byRegime[regime].reduce((sum, r) => sum + (r.minutes ?? 0), 0) /
                            byRegime[regime].length,
                        )
                      : null,
                  }))}
                  barSize={28}
                >
                  <defs>
                    <pattern id="nodata" width="8" height="8" patternTransform="rotate(45 0 0)">
                      <rect width="4" height="4" transform="translate(0, 0)" fill="var(--ig-line)" />
                    </pattern>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--ig-line)" strokeDasharray="2 2" />
                  <XAxis
                    dataKey="regime"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Gravity regime", position: "bottom", offset: 8, fill: "var(--ig-muted)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    hide={true}
                    domain={[0, Math.max(maxMinutes, 1) * 1.25]}
                  />
                  <Tooltip
                    content={({ active }: { active: any }) => {
                      if (!active || active.length === 0) return null;
                      const datum = active[0].payload;
                      const cells = byRegime[datum.regime];
                      if (cells.length === 0) {
                        return (
                          <div className="bg-ig-hull border border-ig-line p-2 rounded-control">
                            <p className="text-xs font-semibold text-ig-frost">{datum.regime}</p>
                            <p className="text-xs text-ig-muted">No published reading — data gap</p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-ig-hull border border-ig-line p-2 rounded-control min-w-[180px]">
                          <p className="text-xs font-semibold text-ig-frost">{datum.regime}</p>
                          <p className="text-xs text-ig-muted mb-1">
                            Average: {Math.round(datum.value)} min · {cells.length} reading{cells.length > 1 ? "s" : ""}
                          </p>
                          <ul className="text-[10px] text-ig-muted space-y-1">
                            {cells.map((cell) => (
                              <li key={cell.acronym} className="flex justify-between gap-2">
                                <span>{cell.acronym} ({formatGravity(cell.gravityG)})</span>
                                <span className="ig-num">{cell.minutes} min</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }}
                  />
                  {regimes.map((regime) => (
                    <Bar
                      key={regime}
                      dataKey="value"
                      fill={byRegime[regime].length > 0 ? REGIME_COLOR[regime] : "url(#nodata)"}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-ig-muted">
              <Info size={12} aria-hidden={true} />
              <span>
                No normal-gravity (1 g) experiment exists in this evidence base, so the right cell is a
                deliberate gap — not an estimate. Rankings and the simulator extrapolate from
                microgravity and partial-g data for any Earth-gravity scenario.
              </span>
            </div>
          </div>

          {/* Per-experiment readings */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={`${row.regime}-${row.acronym}-${row.minutes}`}
                className="flex items-center gap-2 rounded-control border border-ig-line bg-ig-hull p-2"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: REGIME_COLOR[row.regime] }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ig-frost leading-5">
                    {row.acronym} · {row.experiment}
                  </p>
                  <p className="text-xs text-ig-muted leading-5">
                    {formatGravity(row.gravityG)} · {row.minutes} min
                  </p>
                </div>
                <Badge
                  tone={
                    row.confidence === "verified"
                      ? "olive"
                      : row.confidence === "curated"
                      ? "amber"
                      : "neutral"
                  }
                >
                  {row.confidence}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
