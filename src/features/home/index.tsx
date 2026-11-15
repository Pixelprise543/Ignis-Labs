import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Severity } from "@/contracts/types";
import { Link } from "react-router-dom";
import { getExperiments, getInsights, useIgnis } from "@/app/data";
import { Badge, Card, CardContent, Tooltip } from "@/design-system";
import { InsightCard } from "@/features/insights/InsightCard";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

const ENTRY_POINTS = [
  { to: "/app/explore", title: "Explore", text: "Search the experiment library." },
  { to: "/app/simulator", title: "Simulator", text: "Test a cabin condition." },
  { to: "/app/brief", title: "Brief", text: "Export a cited safety brief." },
  { to: "/app/insights", title: "Insights", text: "Read what the evidence says." },
];

/**
 * Platform landing. Deliberately short: three numbers, three insights, four
 * doors. Every list and caveat lives one click deeper so arriving here does not
 * feel like opening the whole old app at once.
 */
export function HomePage() {
  const { scenario } = useIgnis();
  const experiments = getExperiments();
  const insights = useMemo(() => getInsights(scenario), [scenario]);
  const [modelViewerReady, setModelViewerReady] = useState(false);

  useEffect(() => {
    if (modelViewerReady) return;
    if (document.querySelector('script[src*="model-viewer"]')) {
      setModelViewerReady(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.onload = () => setModelViewerReady(true);
    script.onerror = () => console.warn("model-viewer failed to load");
    document.head.appendChild(script);
  }, [modelViewerReady]);

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

  const stats = [
    { label: "Experiments", value: experiments.length },
    { label: "Verified records", value: verified },
    { label: "Insights now", value: insights.length },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="ig-glass rounded-panel p-6 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium text-ig-muted">Mission overview</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
              Fire behaves differently when nothing falls.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
              Pick a scenario once. Every ranking, insight and playbook follows it.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Tooltip label="Opens the experiment library where you can search, filter and compare every record in the dataset.">
                <Link
                  to="/app/explore"
                  className="inline-flex h-11 items-center gap-2 rounded-control bg-ig-flame-blue px-5 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
                >
                  Enter workspace
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </Tooltip>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="gold">{scenario.label}</Badge>
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
                <span className="text-xs font-medium text-ig-ember">Assumed — verify</span>
              )}
            </div>
            {modelViewerReady ? (
              <section className="ig-glass rounded-panel p-4 mt-4">
                <p className="text-xs font-medium text-ig-muted mb-3">ISS CAD model</p>
                <model-viewer
                  src={`${import.meta.env.BASE_URL}iss-cad.glb`}
                  alt="International Space Station"
                  auto-rotate
                  camera-controls
                  className="w-full h-64 rounded-control bg-ig-vacuum"
                ></model-viewer>
              </section>
            ) : (
              <div className="ig-glass rounded-panel p-4 mt-4 h-64 flex items-center justify-center">
                <p className="text-xs text-ig-muted">Loading ISS model…</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Three numbers, nothing else */}
      <section aria-label="Dataset at a glance" className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm" bordered>
            <CardContent>
              <p className="ig-num text-2xl font-semibold leading-none text-ig-frost">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-4 text-ig-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Top insights */}
      <section aria-labelledby="top-insights">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="top-insights" className="text-base font-semibold text-ig-frost">
            Top insights for {scenario.label}
          </h2>
          <Link
            to="/app/insights"
            className="inline-flex items-center gap-1 text-sm font-medium text-ig-flame-blue hover:underline"
          >
            All insights <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {topInsights.length === 0 ? (
          <Card padding="lg" bordered>
            <CardContent className="text-center">
              <p className="text-sm text-ig-muted">No insights for this scenario yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact showActions={false} />
            ))}
          </div>
        )}
      </section>

      {/* Four doors */}
      <section aria-labelledby="entry-points">
        <h2 id="entry-points" className="mb-3 text-base font-semibold text-ig-frost">
          Go deeper
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRY_POINTS.map((entry) => {
            const descriptions: Record<string, string> = {
              Explore:
                "Search the full experiment library with filters for gravity, oxygen, fuel type and facility.",
              Simulator:
                "Estimate fire risk for any material, gravity, oxygen, pressure and flow combination.",
              Brief:
                "Generate a one-click Mission Safety Brief with citations, exportable as markdown or PDF.",
              Insights:
                "Read evidence-linked fire-safety insights grouped by severity.",
            };
            return (
              <Tooltip key={entry.to} label={descriptions[entry.title] ?? entry.text}>
                <Link
                  key={entry.to}
                  to={entry.to}
                  className="group flex items-center justify-between gap-3 rounded-panel border border-ig-glass-control-rim bg-ig-glass-control px-4 py-3 hover:bg-ig-glass-hover"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ig-frost group-hover:text-ig-flame-blue">
                      {entry.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-ig-muted">{entry.text}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-ig-muted group-hover:text-ig-flame-blue"
                  />
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </div>
  );
}
