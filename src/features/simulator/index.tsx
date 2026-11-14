import { clsx } from "clsx";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Info, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Severity } from "@/contracts/types";
import { getMaterials, getExperiment, simulateRisk, useIgnis } from "@/app/data";
import { Badge, Button, ConfidenceBadge, Panel } from "@/design-system";

interface LevelDisplay {
  label: string;
  tone: "olive" | "amber" | "ember" | "alarm";
  fill: string;
  text: string;
}

const LEVEL_DISPLAY: Record<Severity, LevelDisplay> = {
  info: { label: "Low risk", tone: "olive", fill: "bg-ig-quench", text: "text-ig-quench" },
  caution: { label: "Caution", tone: "amber", fill: "bg-ig-amber", text: "text-ig-amber" },
  high: { label: "High risk", tone: "ember", fill: "bg-ig-ember", text: "text-ig-ember" },
  critical: { label: "Critical", tone: "alarm", fill: "bg-ig-alarm", text: "text-ig-alarm" },
};

function SliderField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  hint?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-ig-muted" htmlFor={`sim-${label}`}>
          {label}
        </label>
        <span className="ig-num text-xs text-ig-frost">
          {value.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        id={`sim-${label}`}
        type="range"
        className="ig-range mt-1 w-full cursor-pointer"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <p className="mt-1 text-[11px] leading-4 text-ig-muted">{hint}</p> : null}
    </div>
  );
}

export function SimulatorPage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const materials = getMaterials();

  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [gravity, setGravity] = useState(scenario.gravityG);
  const [o2, setO2] = useState(scenario.o2Percent ?? 21);
  const [pressure, setPressure] = useState(scenario.pressureKPa);
  const [flow, setFlow] = useState(0);

  // The simulator follows the scenario bar until the user edits a slider.
  useEffect(() => {
    setGravity(scenario.gravityG);
    setO2(scenario.o2Percent ?? 21);
    setPressure(scenario.pressureKPa);
    setFlow(0);
  }, [scenario.id, scenario.gravityG, scenario.o2Percent, scenario.pressureKPa]);

  const result = useMemo(
    () => simulateRisk({ materialId, gravityG: gravity, o2Percent: o2, pressureKPa: pressure, flowCmPerS: flow }),
    [materialId, gravity, o2, pressure, flow],
  );

  const level = LEVEL_DISPLAY[result.level];
  const filled = Math.round(result.risk / 10);
  const material = materials.find((entry) => entry.id === materialId) ?? materials[0];

  const presets = [
    {
      label: "34% O2 lunar cabin",
      apply: () => {
        setMaterialId("polyurethane-foam");
        setGravity(0.16);
        setO2(34);
        setPressure(101.3);
        setFlow(2);
      },
    },
    {
      label: "Nominal ISS cabin",
      apply: () => {
        setMaterialId("cotton-towel");
        setGravity(0);
        setO2(21);
        setPressure(101.3);
        setFlow(0);
      },
    },
    {
      label: "EVA pure oxygen",
      apply: () => {
        setMaterialId("nomex-fabric");
        setGravity(0);
        setO2(100);
        setPressure(29.6);
        setFlow(0);
      },
    },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ig-frost">What-if risk simulator</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ig-muted">
          Change a material, gravity, oxygen, pressure or flow rate and see the explained drivers. The
          result is a decision-support estimate, not a physics simulation.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Panel title="Inputs" description={`Baseline follows ${scenario.label}`}>
          <div className="space-y-4">
            <div>
              <label htmlFor="sim-material" className="text-xs font-medium text-ig-muted">
                Material
              </label>
              <select
                id="sim-material"
                value={materialId}
                onChange={(event) => setMaterialId(event.target.value)}
                className="mt-1 h-9 w-full rounded-control border border-ig-line bg-ig-vacuum px-2 text-sm text-ig-frost"
              >
                {materials.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {material ? (
                <p className="mt-1 text-[11px] leading-4 text-ig-muted">
                  {material.usedFor}. Baseline index{" "}
                  <span className="ig-num">{material.baseFlammability}/100</span>.
                </p>
              ) : null}
            </div>

            <SliderField
              label="Gravity"
              unit="g"
              value={gravity}
              min={0}
              max={1}
              step={0.01}
              onChange={setGravity}
              hint="0g removes buoyancy; 1g is Earth-like."
            />
            <SliderField
              label="Oxygen"
              unit="%"
              value={o2}
              min={10}
              max={100}
              step={1}
              onChange={setO2}
              hint={
                o2 > 30 ? (
                  <span className="text-ig-amber">Above 30% O2, the dataset is thin. Treat this as a range, not a point.</span>
                ) : (
                  "Cabin air is about 21% oxygen."
                )
              }
            />
            <SliderField
              label="Pressure"
              unit="kPa"
              value={pressure}
              min={10}
              max={120}
              step={0.1}
              onChange={setPressure}
              hint="Sea-level pressure is about 101.3 kPa."
            />
            <SliderField
              label="Forced flow"
              unit="cm/s"
              value={flow}
              min={0}
              max={50}
              step={0.5}
              onChange={setFlow}
              hint="Cabin fans and ventilation can feed a flame."
            />

            <div className="flex flex-wrap gap-1.5 border-t border-ig-line pt-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={preset.apply}
                  className="rounded-control border border-ig-line px-2 py-1 text-xs text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setGravity(scenario.gravityG);
                  setO2(scenario.o2Percent ?? 21);
                  setPressure(scenario.pressureKPa);
                  setFlow(0);
                }}
                className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-xs text-ig-flame-blue hover:bg-ig-raised"
              >
                <RotateCcw size={12} aria-hidden="true" />
                Reset to scenario
              </button>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Estimated risk"
            description="Composite of material, oxygen, gravity, pressure and flow."
            action={<Badge tone={level.tone}>{level.label}</Badge>}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="flex items-baseline gap-1">
                <span className="ig-num text-4xl font-semibold leading-none text-ig-frost">
                  {result.risk}
                </span>
                <span className="text-sm text-ig-muted">/ 100</span>
              </p>
              <p className={clsx("text-sm font-medium", level.text)}>{level.label}</p>
            </div>

            <div
              className="mt-3 flex gap-1"
              role="img"
              aria-label={`Estimated risk ${result.risk} out of 100, ${level.label}`}
            >
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={clsx(
                    "h-2 flex-1 rounded-[1px]",
                    index < filled ? level.fill : "bg-ig-line",
                  )}
                />
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-ig-muted">
              {scenario.label} baseline is adjusted by your inputs. Use the drivers below to see which
              change moved the estimate. Do not read the number as an ignition probability.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-ig-line pt-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles size={14} aria-hidden="true" />}
                onClick={() => setDrawerOpen(true)}
              >
                Ask Ignis about this run
              </Button>
            </div>
          </Panel>

          <Panel title="Why this number" description="Every driver below is tied to experiment evidence.">
            <ul className="space-y-3">
              {[...result.drivers]
                .sort((a, b) => b.weight - a.weight)
                .map((driver) => (
                  <li key={driver.factor} className="border-b border-ig-line pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ig-frost">{driver.factor}</p>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 text-xs",
                          driver.direction === "raises" ? "text-ig-ember" : "text-ig-quench",
                        )}
                      >
                        {driver.direction === "raises" ? (
                          <ArrowUpRight size={12} aria-hidden="true" />
                        ) : (
                          <ArrowDownRight size={12} aria-hidden="true" />
                        )}
                        {driver.direction === "raises" ? "Raises risk" : "Lowers risk"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ig-muted">{driver.explanation}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="w-14 text-[10px] text-ig-muted">Weight</span>
                      <span className="flex h-1.5 flex-1 gap-0.5">
                        {Array.from({ length: 10 }, (_, index) => (
                          <span
                            key={index}
                            className={clsx(
                              "flex-1 rounded-[1px]",
                              index < Math.round(driver.weight * 10) ? "bg-ig-flame-blue" : "bg-ig-line",
                            )}
                          />
                        ))}
                      </span>
                      <span className="ig-num w-8 text-right text-[10px] text-ig-muted">
                        {Math.round(driver.weight * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {driver.evidenceIds.map((id) => (
                        <span key={id} className="ig-num text-[10px] text-ig-muted">
                          [{id}]
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Nearest supporting experiments" description="Closest gravity and oxygen match in this dataset.">
          <ul className="space-y-3">
            {result.nearestExperimentIds.map((id) => {
              const experiment = getExperiment(id);
              if (!experiment) return null;
              return (
                <li key={id} className="border-b border-ig-line pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ig-frost">
                        {experiment.acronym} · {experiment.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ig-muted">
                        <span className="ig-num">
                          {experiment.conditions.gravityG.toFixed(2)}g ·{" "}
                          {experiment.conditions.o2Percent ?? "—"}% O2
                        </span>{" "}
                        · {experiment.facility}
                      </p>
                    </div>
                    <ConfidenceBadge confidence={experiment.confidence} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ig-muted">{experiment.safetyTakeaway}</p>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Caveats" description="Read these before you cite the estimate.">
          <ul className="space-y-2">
            {result.caveats.map((caveat) => (
              <li key={caveat} className="flex gap-2 text-sm leading-6 text-ig-muted">
                <AlertTriangle size={14} aria-hidden="true" className="mt-1 shrink-0 text-ig-amber" />
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex gap-2 border-t border-ig-line pt-3 text-xs leading-5 text-ig-muted">
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-ig-flame-blue" />
            Material baselines are qualitative indices for planning, not measured ignition thresholds.
          </p>
        </Panel>
      </div>
    </div>
  );
}
