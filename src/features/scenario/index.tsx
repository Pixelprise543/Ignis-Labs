import { clsx } from "clsx";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Scenario } from "@/contracts/types";
import { SCENARIOS, customScenario, useIgnis } from "@/app/data";
import { Card, CardContent } from "@/design-system";

const fieldClass =
  "h-8 w-20 rounded-control border border-ig-line bg-ig-vacuum px-2 text-sm text-ig-frost ig-num";

function formatGravity(value: number): string {
  if (value === 0) return "0g";
  return `${value.toFixed(2).replace(/0$/, "")}g`;
}

/**
 * Scenario page: choose the mission scenario once, and every view follows it.
 * Changing the scenario re-scores rankings, re-filters insights, and re-baselines
 * the simulator.
 */
export function ScenarioPage() {
  const { scenario, setScenario } = useIgnis();
  const [draft, setDraft] = useState({
    g: scenario.gravityG,
    o2: scenario.o2Percent ?? 21,
    kPa: scenario.pressureKPa,
  });

  function choose(next: Scenario) {
    if (next.id === "custom") {
      setScenario(customScenario(draft.g, draft.o2, draft.kPa));
      return;
    }
    setDraft({
      g: next.gravityG,
      o2: next.o2Percent ?? 21,
      kPa: next.pressureKPa,
    });
    setScenario(next);
  }

  const isCustom = scenario.id === "custom";

  return (
    <div className="space-y-8">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-ig-muted tracking-wide uppercase">
              Active scenario
            </p>
            <h2 className="mt-1 max-w-2xl text-2xl font-semibold leading-tight text-ig-frost lg:text-3xl">
              Choose a mission scenario
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ig-muted">
              Every view reads the same scenario, so changing this re-scores rankings, re-filters
              insights, and re-baselines the simulator.
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="items-baseline gap-2 text-xs text-ig-muted flex">
              <span className="ig-num text-ig-frost">{formatGravity(scenario.gravityG)}</span>
              <span aria-hidden="true">·</span>
              <span className="ig-num text-ig-frost">{scenario.o2Percent ?? "—"}% O2</span>
              <span aria-hidden="true">·</span>
              <span className="ig-num text-ig-frost">
                {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
              </span>
            </p>
            {scenario.assumption ? (
              <span className="inline-flex items-center gap-1 text-xs text-ig-amber">
                <AlertTriangle size={12} aria-hidden="true" />
                <span>Assumed values</span>
              </span>
            ) : null}
          </div>
        </div>

        <div
          role="group"
          aria-label="Choose a mission scenario"
          className="mt-6 ig-scroll-x flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-control border border-ig-line bg-ig-hull p-1"
        >
          {SCENARIOS.map((entry) => {
            const active = entry.id === scenario.id;
            return (
              <button
                key={entry.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(entry)}
                className={clsx(
                  "relative h-10 shrink-0 rounded-control px-4 text-sm font-medium transition-colors border-transparent",
                  active
                    ? "bg-ig-hull text-ig-frost"
                    : "text-ig-muted hover:bg-ig-raised hover:text-ig-frost",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-ig-flame-blue"
                  />
                ) : null}
                {entry.label}
              </button>
            );
          })}
        </div>
      </section>

      {isCustom ? (
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-4">Custom scenario</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs text-ig-muted">
                Gravity (g)
                <input
                  className={fieldClass}
                  type="number"
                  min={0}
                  max={2}
                  step={0.01}
                  value={draft.g}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, g: Number(event.target.value) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ig-muted">
                Oxygen (%)
                <input
                  className={fieldClass}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={draft.o2}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, o2: Number(event.target.value) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ig-muted">
                Pressure (kPa)
                <input
                  className={fieldClass}
                  type="number"
                  min={0}
                  max={200}
                  step={0.1}
                  value={draft.kPa}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, kPa: Number(event.target.value) }))
                  }
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScenario(customScenario(draft.g, draft.o2, draft.kPa))}
                className="h-10 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
              >
                Apply custom scenario
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-ig-muted">
              Every view re-scores against these values. Gravity above 0g assumes buoyant flow.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
