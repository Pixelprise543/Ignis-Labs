import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Insight, Severity } from "@/contracts/types";
import { getInsights, useIgnis } from "@/app/data";
import { Button, EmptyState, Tabs } from "@/design-system";
import type { TabItem } from "@/design-system";
import { InsightCard } from "./InsightCard";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  caution: "Caution",
  info: "Info",
};

export function InsightsPage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const insights = useMemo(() => getInsights(scenario), [scenario]);
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(() => {
    const base: Record<Severity, number> = { critical: 0, high: 0, caution: 0, info: 0 };
    insights.forEach((insight) => {
      base[insight.severity] += 1;
    });
    return base;
  }, [insights]);

  const tabs: TabItem[] = [
    { id: "all", label: "All", count: insights.length },
    ...(["critical", "high", "caution", "info"] as Severity[]).map((severity) => ({
      id: severity,
      label: SEVERITY_LABEL[severity],
      count: counts[severity],
    })),
  ];

  const groups = useMemo(() => {
    const ordered = [...insights].sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.confidence - a.confidence,
    );
    const bySeverity = new Map<Severity, Insight[]>();
    ordered.forEach((insight) => {
      const bucket = bySeverity.get(insight.severity) ?? [];
      bucket.push(insight);
      bySeverity.set(insight.severity, bucket);
    });

    if (filter !== "all") {
      const only = bySeverity.get(filter as Severity);
      return only ? [{ severity: filter as Severity, items: only }] : [];
    }

    return (["critical", "high", "caution", "info"] as Severity[])
      .map((severity) => ({ severity, items: bySeverity.get(severity) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [insights, filter]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ig-frost">Fire-safety insights</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ig-muted">
              Evidence-linked findings tuned to <span className="text-ig-frost">{scenario.label}</span>.
              Change the scenario bar and this list re-orders. Every insight names the experiments it
              rests on.
            </p>
          </div>
          <Button
            variant="secondary"
            icon={<Sparkles size={15} aria-hidden="true" />}
            onClick={() => setDrawerOpen(true)}
          >
            Ask Ignis
          </Button>
        </div>

        <p className="mt-3 rounded-control border border-ig-line bg-ig-hull px-3 py-2 text-xs leading-5 text-ig-muted">
          {scenario.description}{" "}
          <span className="ig-num">
            {scenario.gravityG.toFixed(2)}g · {scenario.o2Percent ?? "—"}% O2 ·{" "}
            {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
          </span>
          {scenario.assumption ? (
            <span className="text-ig-amber"> Assumed values, verify before use.</span>
          ) : null}
        </p>
      </header>

      <Tabs items={tabs} value={filter} onChange={setFilter} label="Filter insights by severity" />

      {groups.length === 0 ? (
        <EmptyState
          title="No insights at this severity for this scenario"
          message="That is a coverage finding, not a clean bill of health. Open Coverage to see where evidence is missing, or ask Ignis what the dataset cannot tell you."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.severity} aria-labelledby={`group-${group.severity}`}>
              <h2
                id={`group-${group.severity}`}
                className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-ig-frost"
              >
                {SEVERITY_LABEL[group.severity]}
                <span className="ig-num text-xs font-normal text-ig-muted">
                  {group.items.length}
                </span>
              </h2>
              <div className="space-y-3">
                {group.items.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="border-t border-ig-line pt-3 text-xs leading-5 text-ig-muted">
        Confidence blends how many experiments support a finding with how direct that support is. It is
        a reading aid, not a probability of ignition. See the Method page for the exact weights.
      </p>
    </div>
  );
}
