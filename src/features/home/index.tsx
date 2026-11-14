import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { Severity } from "@/contracts/types";
import { Link } from "react-router-dom";
import { getExperiments, getInsights, useIgnis } from "@/app/data";
import { Badge } from "@/design-system";
import { InsightCard } from "@/features/insights/InsightCard";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

const ENTRY_POINTS = [
  {
    to: "/explore",
    title: "Explore the library",
    text: "Search NASA fire experiments by fuel, facility, gravity regime and oxygen band.",
  },
  {
    to: "/simulator",
    title: "Run a what-if",
    text: "Change gravity, oxygen, pressure and flow to see the explained risk drivers.",
  },
  {
    to: "/brief",
    title: "Mission safety brief",
    text: "Export a cited Markdown brief for your crew or reviewer.",
  },
  {
    to: "/insights",
    title: "Fire-safety insights",
    text: "Read evidence-linked findings tuned to your scenario.",
  },
];

export function HomePage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const experiments = getExperiments();
  const insights = useMemo(() => getInsights(scenario), [scenario]);

  const topInsights = useMemo(
    () =>
      [...insights]
        .sort(
          (a, b) =>
            SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.confidence - a.confidence,
        )
        .slice(0, 3),
    [insights],
  );

  const verified = experiments.filter((experiment) => experiment.confidence === "verified").length;

  return (
    <div className="space-y-8">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-ig-muted tracking-wide uppercase">Mission overview</p>
            <h1 className="mt-1 max-w-2xl text-2xl font-semibold leading-tight text-ig-frost lg:text-3xl">
              Fire behaves differently when nothing falls.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ig-muted">
              Ignis turns decades of microgravity combustion research into fire-safety answers for the
              Moon and Mars. Pick a scenario once and every view follows it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Badge className="text-xs">{scenario.label}</Badge>
            <span className="ig-num text-xs text-ig-muted">
              {scenario.gravityG.toFixed(2)}g · {scenario.o2Percent ?? "—"}% O2 ·
              {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
            </span>
            {scenario.assumption ? (
              <span className="text-xs text-ig-ember">Assumed values — verify before use</span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 lg:mt-8 lg:justify-end">
          <Link
            to="/explore"
            className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-white hover:bg-ig-amber"
          >
            Explore the evidence
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-ig-line px-4 text-sm font-medium text-ig-frost hover:bg-ig-hull"
          >
            <Sparkles size={15} aria-hidden="true" />
            Ask Ignis
          </button>
        </div>
      </section>

      <section aria-label="Dataset at a glance" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Experiments" value={experiments.length} hint="NASA records with sources" />
        <StatCard label="Verified" value={verified} hint="From cited NASA sources" />
        <StatCard label="Insights" value={insights.length} hint="For this scenario" />
        <StatCard label="Evidence links" value={insights.length} hint="Traceable, not invented" />
      </section>

      <section aria-labelledby="top-insights">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="top-insights" className="text-base font-semibold text-ig-frost">
              Top insights for {scenario.label}
            </h2>
            <p className="mt-0.5 text-xs text-ig-muted">
              Sorted by severity, then confidence. Change the scenario bar to reshuffle.
            </p>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center gap-1 text-xs text-ig-flame-blue hover:underline font-medium"
          >
            All insights <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {topInsights.length === 0 ? (
          <p className="rounded-panel border border-ig-line bg-ig-hull px-4 py-6 text-sm text-ig-muted text-center">
            No insights for this scenario yet.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact showActions={false} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="entry-points">
        <h2 id="entry-points" className="text-base font-semibold text-ig-frost">Go deeper</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className="group flex flex-col gap-2 rounded-panel border border-ig-line bg-ig-hull p-5 hover:bg-ig-raised transition-colors"
            >
              <span className="text-sm font-medium text-ig-frost group-hover:text-ig-flame-blue">
                {entry.title}
              </span>
              <span className="text-xs leading-5 text-ig-muted">{entry.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <div className="rounded-panel border border-ig-line bg-ig-hull p-5">
      <p className="text-xs font-medium text-ig-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ig-frost">{value}</p>
      <p className="mt-0.5 text-xs text-ig-muted">{hint}</p>
    </div>
  );
}
