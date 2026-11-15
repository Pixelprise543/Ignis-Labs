import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getExperiments, getInsights, useIgnis } from "@/app/data";
import { Badge, Button, Card, CardContent, CardFooter, CardTitle } from "@/design-system";
import { InsightCard } from "@/features/insights/InsightCard";

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, caution: 2, info: 3 };

export function ProductPage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const experiments = getExperiments();
  const insights = useMemo(() => getInsights(scenario), [scenario]);

  const topInsights = useMemo(
    () => [...insights].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.confidence - a.confidence).slice(0, 3),
    [insights],
  );

  const verified = experiments.filter((e) => e.confidence === "verified").length;

  const capabilities = [
    {
      id: "explore",
      title: "Research Discovery",
      summary: "Search, filter and browse 20 verified NASA microgravity combustion experiments. Every record carries citations, confidence badges and full findings.",
      link: "/app/explore",
      linkText: "Explore library",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Experiment library preview</div>,
    },
    {
      id: "compare",
      title: "Experiment Comparison",
      summary: "Side-by-side comparison of 2-4 experiments with chart overlays and SI-generated comparison answers grounded in cited evidence.",
      link: "/app/explore",
      linkText: "Compare experiments",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Comparison view preview</div>,
    },
    {
      id: "rankings",
      title: "Transparent Rankings",
      summary: "Adjustable 0-100 fire-risk scores with four weighted factors: hazard severity, exploration, evidence and recency. Every score is auditable.",
      link: "/app/explore",
      linkText: "View rankings",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Rankings view preview</div>,
    },
    {
      id: "materials",
      title: "Material Risk Matrix",
      summary: "Qualitative flammability risk for 8 spacecraft materials across ISS, lunar, Mars and EVA scenarios. Each cell cites its evidence.",
      link: "/app/explore",
      linkText: "View materials",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Materials matrix preview</div>,
    },
    {
      id: "simulator",
      title: "What-if Simulator",
      summary: "Change gravity, oxygen, pressure and flow to see explained risk drivers. Each driver cites the experiment evidence behind it.",
      link: "/app/simulator",
      linkText: "Run a what-if",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Simulator preview</div>,
    },
    {
      id: "askIgnis",
      title: "Ask Ignis Chatbot",
      summary: "Deterministic AI assistant grounded only in the dataset. Every answer cites experiment IDs. Falls back to offline answers when no model key is configured.",
      link: "/app/explore",
      linkText: "Ask Ignis",
      preview: <div className="h-24 bg-ig-raised rounded-control border border-ig-line flex items-center justify-center text-xs text-ig-muted">Ask Ignis preview</div>,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Product</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">The Ignis Research Platform</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">Every feature below is live in the platform. Click through to use it with real NASA data.</p>
          </div>
          <div className="lg:col-span-5 flex items-end gap-3">
            <Badge tone="gold" className="text-[10px]">{scenario.label}</Badge>
          </div>
        </div>
      </section>

      <section aria-labelledby="capabilities">
        <h2 id="capabilities" className="text-sm font-semibold text-ig-frost">Platform capabilities</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{capabilities.map((cap) => (
          <Card key={cap.id} bordered padding="md" className="group hover:bg-ig-raised transition-colors">
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="h-16 rounded-control border border-ig-line bg-ig-hull flex items-center justify-center">{cap.preview}</div>
                <CardTitle className="text-base">{cap.title}</CardTitle>
                <p className="text-sm text-ig-muted">{cap.summary}</p>
                <CardFooter>
                  <Link to={cap.link} className="text-[10px] font-medium text-ig-flame-blue hover:underline flex items-center gap-1">{cap.linkText}<ArrowRight size={11} aria-hidden="true" /></Link>
                </CardFooter>
              </div>
            </CardContent>
          </Card>
        ))}</div>
      </section>

      <section aria-labelledby="top-insights">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><h2 id="top-insights" className="text-sm font-semibold text-ig-frost">Top insights for {scenario.label}</h2><p className="mt-0.5 text-[10px] text-ig-muted">Sorted by severity, then confidence.</p></div>
          <Link to="/app/insights" className="inline-flex items-center gap-1 text-[10px] font-medium text-ig-flame-blue hover:underline">All insights<ArrowRight size={11} aria-hidden="true" /></Link>
        </div>
        {topInsights.length === 0 ? <p className="text-sm text-ig-muted text-center p-6 rounded-panel border border-ig-line bg-ig-hull">No insights for this scenario yet.</p> : <div className="grid gap-4 lg:grid-cols-3">{topInsights.map((insight) => <InsightCard key={insight.id} insight={insight} compact showActions={false} />)}</div>}
      </section>

      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Dataset at a glance</p>
            <h2 className="mt-2 text-xl font-semibold text-ig-frost">20 verified NASA experiments</h2>
            <p className="mt-3 text-sm leading-6 text-ig-muted">Every experiment in Ignis is traceable to a cited NASA source. {verified} verified, {experiments.length - verified} curated.</p>
          </div>
          <div className="lg:col-span-5 flex items-center justify-end">
            <Button variant="primary" size="lg" icon={<Sparkles size={15} />} onClick={() => setDrawerOpen(true)}>Ask Ignis about the data</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
