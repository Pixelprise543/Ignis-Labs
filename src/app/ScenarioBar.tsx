import { clsx } from "clsx";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Scenario } from "@/contracts/types";
import { SCENARIOS, customScenario, useIgnis } from "@/app/data";

const fieldClass =
  "h-8 w-20 rounded-control border border-ig-line bg-ig-vacuum px-2 text-sm text-ig-frost ig-num";

function formatGravity(value: number): string {
  if (value === 0) return "0g";
  return `${value.toFixed(2).replace(/0$/, "")}g`;
}

/**
 * Global scenario segmented control. Every view reads the same store value,
 * so changing this re-scores rankings, re-filters insights and re-baselines
 * the simulator.
 */
export function ScenarioBar() {
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
    <section
      aria-label="Active scenario"
      className="sticky top-0 z-30 border-b border-ig-line bg-ig-vacuum"
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 lg:px-5">
        <span className="hidden text-xs font-medium text-ig-muted sm:inline">Scenario</span>

        <div
          role="group"
          aria-label="Choose a mission scenario"
          className="ig-scroll-x flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-control border border-ig-line bg-ig-hull p-1"
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
                  "relative h-8 shrink-0 rounded-control px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-ig-raised text-ig-frost"
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

        <div className="flex items-center gap-3">
          <p className="hidden items-baseline gap-2 text-xs text-ig-muted md:flex">
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

      {isCustom ? (
        <div className="flex flex-wrap items-end gap-3 border-t border-ig-line px-3 py-2 lg:px-5">
          <label className="flex flex-col gap-1 text-xs text-ig-muted">
            Gravity (g)
            <input
              className={fieldClass}
              type="number"
              min={0}
              max={2}
              step={0.01}
              value={draft.g}
              onChange={(event) => setDraft((prev) => ({ ...prev, g: Number(event.target.value) }))}
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
              onChange={(event) => setDraft((prev) => ({ ...prev, o2: Number(event.target.value) }))}
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
              onChange={(event) => setDraft((prev) => ({ ...prev, kPa: Number(event.target.value) }))}
            />
          </label>
          <button
            type="button"
            onClick={() => setScenario(customScenario(draft.g, draft.o2, draft.kPa))}
            className="h-8 rounded-control bg-ig-flame-blue px-3 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
          >
            Apply custom scenario
          </button>
          <p className="text-xs leading-5 text-ig-muted">
            Every view re-scores against these values. Gravity above 0g assumes buoyant flow.
          </p>
        </div>
      ) : null}
    </section>
  );
}
