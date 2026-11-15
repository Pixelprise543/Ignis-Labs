import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { Severity } from "@/contracts/types";
import { Link } from "react-router-dom";
import { getExperiments, getInsights, useIgnis } from "@/app/data";
import { Badge, Button, Card, CardContent, CardFooter } from "@/design-system";
import { InsightCard } from "@/features/insights/InsightCard";
import { FlameOrb } from "./Orb";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

const ENTRY_POINTS = [
  {
    to: "/app/explore",
    title: "Explore the library",
    text: "Search NASA fire experiments by fuel, facility, gravity regime and oxygen band.",
  },
  {
    to: "/app/simulator",
    title: "Run a what-if",
    text: "Change gravity, oxygen, pressure and flow to see the explained risk drivers.",
  },
  {
    to: "/app/brief",
    title: "Mission safety brief",
    text: "Export a cited Markdown brief for your crew or reviewer.",
  },
  {
    to: "/app/insights",
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
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">
              Mission overview
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
              Fire behaves differently when nothing falls.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">
              Ignis turns decades of microgravity combustion research into fire-safety answers for the
              Moon and Mars. Pick a scenario once and every view follows it.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="gold" className="text-[10px]">
                {scenario.label}
              </Badge>
              <span className="ig-num text-xs leading-none text-ig-muted">
                {scenario.gravityG.toFixed(2)}g
              </span>
              <span className="ig-num text-xs leading-none text-ig-muted">
                {scenario.o2Percent ?? "—"}% O2
              </span>
              <span className="ig-num text-xs leading-none text-ig-muted">
                {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
              </span>
              {scenario.assumption && (
                <span className="text-[10px] font-medium text-ig-ember">Assumed values — verify</span>
              )}
            </div>
            <FlameOrb gravityG={scenario.gravityG} scenarioLabel={scenario.label} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 lg:mt-10">
          <Link
            to="/app/explore"
            className="inline-flex h-11 items-center gap-2 rounded-control bg-ig-flame-blue px-5 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
          >
            Explore the evidence
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Button variant="outline" size="lg" icon={<Sparkles size={15} />} onClick={() => setDrawerOpen(true)}>
            Ask Ignis
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Dataset at a glance" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card padding="md" bordered>
          <CardContent>
            <p className="text-xs font-medium text-ig-muted">Experiments</p>
            <p className="mt-1 text-2xl font-semibold text-ig-frost">{experiments.length}</p>
            <p className="mt-0.5 text-[10px] text-ig-muted">NASA records with sources</p>
          </CardContent>
        </Card>
        <Card padding="md" bordered>
          <CardContent>
            <p className="text-xs font-medium text-ig-muted">Verified</p>
            <p className="mt-1 text-2xl font-semibold text-ig-frost">{verified}</p>
            <p className="mt-0.5 text-[10px] text-ig-muted">From cited NASA sources</p>
          </CardContent>
        </Card>
        <Card padding="md" bordered>
          <CardContent>
            <p className="text-xs font-medium text-ig-muted">Insights</p>
            <p className="mt-1 text-2xl font-semibold text-ig-frost">{insights.length}</p>
            <p className="mt-0.5 text-[10px] text-ig-muted">For this scenario</p>
          </CardContent>
        </Card>
        <Card padding="md" bordered>
          <CardContent>
            <p className="text-xs font-medium text-ig-muted">Evidence links</p>
            <p className="mt-1 text-2xl font-semibold text-ig-frost">{insights.length}</p>
            <p className="mt-0.5 text-[10px] text-ig-muted">Traceable, not invented</p>
          </CardContent>
        </Card>
      </section>

      {/* Top insights */}
      <section aria-labelledby="top-insights">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="top-insights" className="text-sm font-semibold text-ig-frost">
              Top insights for {scenario.label}
            </h2>
            <p className="mt-0.5 text-[10px] text-ig-muted">
              Sorted by severity, then confidence. Change the scenario bar to reshuffle.
            </p>
          </div>
          <Link
            to="/app/insights"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-ig-flame-blue hover:underline"
          >
            All insights <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>

        {topInsights.length === 0 ? (
          <Card padding="lg" bordered>
            <CardContent className="text-center">
              <p className="text-sm text-ig-muted">No insights for this scenario yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact showActions={false} />
            ))}
          </div>
        )}
      </section>

      {/* Entry points */}
      <section aria-labelledby="entry-points">
        <h2 id="entry-points" className="text-sm font-semibold text-ig-frost">Go deeper</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className="block"
            >
              <Card
                bordered
                padding="none"
                className="group hover:bg-ig-raised transition-colors"
              >
                <CardContent>
                  <div className="p-5">
                    <span className="text-sm font-medium text-ig-frost group-hover:text-ig-flame-blue">
                      {entry.title}
                    </span>
                    <p className="mt-1 text-[10px] leading-5 text-ig-muted">{entry.text}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <span className="text-[10px] font-medium text-ig-flame-blue hover:underline flex items-center gap-1">
                    Open <ArrowRight size={11} aria-hidden="true" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
