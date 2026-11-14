import { ClipboardCheck, DoorClosed, Flame, Printer, Search, Sparkles, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import type { PlaybookStep } from "@/contracts/types";
import { getPlaybook, useIgnis } from "@/app/data";
import { Button, CitationChip, Panel } from "@/design-system";

type Phase = PlaybookStep["phase"];

const PHASES: { id: Phase; label: string; headline: string; icon: LucideIcon }[] = [
  {
    id: "detect",
    label: "Detect",
    headline: "Confirm the fire before you open anything.",
    icon: Search,
  },
  {
    id: "isolate",
    label: "Isolate",
    headline: "Starve the flame and protect the crew.",
    icon: DoorClosed,
  },
  {
    id: "suppress",
    label: "Suppress",
    headline: "Put it out, then prove it is out.",
    icon: Flame,
  },
  {
    id: "ventilate",
    label: "Ventilate",
    headline: "Clear combustion products before masks come off.",
    icon: Wind,
  },
  {
    id: "recover",
    label: "Recover",
    headline: "Capture the lesson and re-check the materials.",
    icon: ClipboardCheck,
  },
];

export function PlaybookPage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const playbook = useMemo(() => getPlaybook(scenario.id), [scenario.id]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ig-frost">Crew response playbook</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ig-muted">
              Detect, isolate, suppress, ventilate and recover in <span className="text-ig-frost">{scenario.label}</span>.
              Every step names the evidence behind it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer size={14} aria-hidden="true" />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              size="sm"
              icon={<Sparkles size={14} aria-hidden="true" />}
              onClick={() => setDrawerOpen(true)}
            >
              Ask Ignis
            </Button>
          </div>
        </div>

        <p className="mt-3 rounded-control border border-ig-line bg-ig-hull px-3 py-2 text-xs leading-5 text-ig-muted">
          Scenario: <span className="text-ig-frost">{scenario.label}</span> ·{" "}
          <span className="ig-num">
            {scenario.gravityG.toFixed(2)}g · {scenario.o2Percent ?? "—"}% O2 ·{" "}
            {scenario.pressureKPa.toFixed(1)} kPa
          </span>
          {scenario.assumption ? (
            <span className="text-ig-amber"> Assumed values, verify before use.</span>
          ) : null}
        </p>
      </header>

      <ol className="space-y-3">
        {PHASES.map((phase, phaseIndex) => {
          const steps = playbook.steps.filter((step) => step.phase === phase.id);
          if (steps.length === 0) return null;
          const Icon = phase.icon;

          return (
            <li key={phase.id}>
              <Panel
                title={
                  <span className="inline-flex items-center gap-2">
                    <Icon size={15} aria-hidden="true" className="text-ig-flame-blue" />
                    {phase.label}
                    <span className="ig-num text-xs font-normal text-ig-muted">
                      {phaseIndex + 1}/{PHASES.length}
                    </span>
                  </span>
                }
                description={phase.headline}
              >
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <li
                      key={`${phase.id}-${index}`}
                      className="border-b border-ig-line pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="ig-num mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ig-line text-[10px] text-ig-muted"
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-6 text-ig-frost">{step.action}</p>
                          <p className="mt-1 text-sm leading-6 text-ig-muted">{step.rationale}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-ig-muted">Evidence</span>
                            {step.evidenceIds.map((id) => (
                              <CitationChip key={id} id={id} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            </li>
          );
        })}
      </ol>

      <Panel title="Caveats" description="What this playbook is not.">
        <ul className="space-y-2">
          {playbook.caveats.map((caveat) => (
            <li key={caveat} className="text-sm leading-6 text-ig-muted">
              {caveat}
            </li>
          ))}
          <li className="text-sm leading-6 text-ig-muted">
            Atmosphere values come from the scenario bar. A real crew response uses the vehicle's
            current readings, not a planning baseline.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
