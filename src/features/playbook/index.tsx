import { useIgnis } from "@/store/useIgnis";
import { getPlaybook } from "@/lib/playbook";
import { Panel } from "@/design-system";

const PHASE_LABELS: Record<string, string> = {
  detect: "Detect",
  isolate: "Isolate",
  suppress: "Suppress",
  ventilate: "Ventilate",
  recover: "Recover",
};

const PHASE_ICONS: Record<string, string> = {
  detect: "🔍",
  isolate: "🔒",
  suppress: "🧯",
  ventilate: "💨",
  recover: "🔄",
};

export function PlaybookPage() {
  const { scenario } = useIgnis();
  const playbook = getPlaybook(scenario.id as any);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Crew response playbook</h2>
        <p className="text-sm text-ig-muted">
          Detect → isolate → suppress → ventilate → recover for{" "}
          <span className="text-ig-frost font-semibold">{scenario.label}</span>. Every step links to evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {playbook.steps.map((step) => (
          <div key={step.phase} className="ig-glass p-4 border border-ig-line rounded-xl flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{PHASE_ICONS[step.phase]}</span>
              <span className="font-semibold text-ig-frost">{PHASE_LABELS[step.phase]}</span>
            </div>
            <p className="text-sm text-ig-frost flex-1 leading-relaxed">{step.action}</p>
            <p className="mt-2 text-xs text-ig-muted">{step.rationale}</p>
            <div className="mt-2 flex gap-1">
              {step.evidenceIds.map((eid) => (
                <span
                  key={eid}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-ig-line text-xs text-ig-muted"
                >
                  [{eid}]
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Panel title="Caveats" subtitle="Read before relying on this playbook.">
        <ul className="space-y-2 text-sm text-ig-muted">
          {playbook.caveats.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-ig-flame-blue">⚠</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
