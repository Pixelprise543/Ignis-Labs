import { getExperiments } from "@/lib/data";
import { SCENARIOS, formatGravity } from "@/lib/scenarios";
import { Stat, Badge, Button, IssCadViewer } from "@/design-system";

export function HomePage() {
  const experiments = getExperiments();
  const scenarios = SCENARIOS;

  return (
    <div className="space-y-6">
      <div className="relative ig-glass p-8 rounded-2xl overflow-hidden border border-ig-line">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-black/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-semibold text-ig-frost tracking-tight leading-tight">
              Fire safety in microgravity
            </h1>
            <p className="mt-3 text-lg text-ig-muted">
              Summarize, rank, and interpret microgravity combustion findings for human space
              exploration. Every number traces to a NASA source.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={() => {}}>
                Explore experiments
              </Button>
              <Button variant="outline" onClick={() => {}}>
                View rankings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ISS CAD model — ISS cabin view */}
      <div className="ig-glass p-6 border border-ig-line rounded-xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <div className="flex-1 lg:w-1/2">
            <h3 className="text-sm font-semibold text-ig-frost mb-2 uppercase tracking-wider text-ig-muted">
              ISS Cabin — CAD model
            </h3>
            <p className="text-sm text-ig-muted mb-4">
              International Space Station habitable module. Microgravity flame behavior:
              no buoyant plume, flames creep over surfaces, ventilation flow dominates.
            </p>
            <Badge variant="info" size="sm">Microgravity · 0 g</Badge>
            <Badge variant="verified" size="sm" className="ml-2">Verified · ISS</Badge>
          </div>
          <div className="flex-1 lg:w-1/2">
            <IssCadViewer className="w-full" />
          </div>
        </div>
      </div>

      <div className="ig-glass p-6 border border-ig-line rounded-xl">
        <h3 className="text-sm font-semibold text-ig-frost mb-4 uppercase tracking-wider text-ig-muted">
          Scenario Bar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {scenarios.map((s) => {
            const regime = s.gravityG < 0.01 ? "microgravity" : s.gravityG < 0.9 ? "partial-g" : "normal-g";
            return (
              <button
                key={s.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-ig-line bg-black/40 hover:bg-ig-raised hover:border-ig-flame-blue transition-colors text-left w-full"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={regime === "microgravity" ? "info" : regime === "partial-g" ? "caution" : "high"}
                    size="sm"
                  >
                    {formatGravity(s.gravityG)}
                  </Badge>
                  <span className="text-xs text-ig-muted uppercase tracking-wider">
                    {s.o2Percent}% O2
                  </span>
                </div>
                <span className="text-sm font-semibold text-ig-frost">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat value={experiments.length} label="Experiments in evidence base" />
        <Stat value={new Set(experiments.map((e) => e.facility)).size} label="Facilities" />
        <Stat value={experiments.filter((e) => e.confidence === "verified").length} label="Verified records" />
        <Stat value={new Set(experiments.flatMap((e) => e.tags)).size} label="Research tags" />
      </div>

      <div className="ig-glass p-6 border border-ig-line rounded-xl">
        <h3 className="text-sm font-semibold text-ig-frost mb-4 uppercase tracking-wider text-ig-muted">
          Go to
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="ig-hull p-4 border border-ig-line hover:bg-black/30 transition-colors cursor-pointer group">
            <span className="text-xs text-ig-muted block mb-1">Ranked experiments</span>
            <span className="text-lg font-semibold text-ig-frost">Rankings</span>
            <div className="mt-2 flex items-center gap-1 text-xs text-ig-flame-blue group-hover:text-ig-amber">
              Adjustable weight sliders →
            </div>
          </div>
          <div className="ig-hull p-4 border border-ig-line hover:bg-black/30 transition-colors cursor-pointer group">
            <span className="text-xs text-ig-muted block mb-1">Material risk matrix</span>
            <span className="text-lg font-semibold text-ig-frost">Materials</span>
            <div className="mt-2 flex items-center gap-1 text-xs text-ig-flame-blue group-hover:text-ig-amber">
              Heatmap by scenario →
            </div>
          </div>
          <div className="ig-hull p-4 border border-ig-line hover:bg-black/30 transition-colors cursor-pointer group">
            <span className="text-xs text-ig-muted block mb-1">What-if risk estimator</span>
            <span className="text-lg font-semibold text-ig-frost">Simulator</span>
            <div className="mt-2 flex items-center gap-1 text-xs text-ig-flame-blue group-hover:text-ig-amber">
              Run a scenario →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
