import { useIgnis } from "@/store/useIgnis";
import { getInsights } from "@/lib/insights";
import { SeverityBadge, Panel } from "@/design-system";

export function InsightsPage() {
  const { scenario } = useIgnis();
  const insights = getInsights(scenario);

  const bySeverity = insights.reduce<Record<string, typeof insights>>(
    (acc, ins) => {
      (acc[ins.severity] ??= []).push(ins);
      return acc;
    },
    {} as Record<string, typeof insights>,
  );

  const order: Array<keyof typeof bySeverity> = ["critical", "high", "caution", "info"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Evidence-linked insights</h2>
        <p className="text-sm text-ig-muted">
          Fire-safety insights for <span className="text-ig-frost font-semibold">{scenario.label}</span>, grouped by
          severity. Every insight cites its evidence experiment IDs.
        </p>
      </div>

      {order.map((sev) => {
        const group = bySeverity[sev];
        if (!group || group.length === 0) return null;
        return (
          <Panel
            key={sev}
            title={sev.charAt(0).toUpperCase() + sev.slice(1)}
            subtitle={`${group.length} insight${group.length !== 1 ? "s" : ""}`}
          >
            <div className="space-y-3">
              {group.map((ins) => (
                <div key={ins.id} className="ig-hull p-4 rounded-lg border border-ig-line">
                  <div className="flex justify-between items-start mb-2">
                    <SeverityBadge severity={ins.severity as any} size="sm" />
                    <span className="text-xs font-mono text-ig-muted">{ins.id}</span>
                  </div>
                  <h3 className="font-semibold text-ig-frost">{ins.title}</h3>
                  <p className="mt-1 text-sm text-ig-frost leading-relaxed">{ins.summary}</p>
                  <p className="mt-2 text-xs text-ig-muted">
                    <span className="font-semibold">Recommendation:</span> {ins.recommendation}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ins.evidenceIds.map((eid) => (
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
          </Panel>
        );
      })}
    </div>
  );
}
