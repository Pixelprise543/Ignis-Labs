import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getExperiments, useIgnis } from "@/app/data";
import { Button, Card, CardContent, Collapsible } from "@/design-system";

const CAPABILITIES = [
  {
    id: "explore",
    title: "Research discovery",
    summary: "Search 20 cited NASA records by fuel, facility, gravity and oxygen.",
    link: "/app/explore",
    linkText: "Open the library",
  },
  {
    id: "compare",
    title: "Comparison",
    summary: "Put two to four experiments side by side with chart overlays.",
    link: "/app/compare",
    linkText: "Compare experiments",
  },
  {
    id: "rankings",
    title: "Rankings",
    summary: "Weighted fire-risk scores with a visible breakdown.",
    link: "/app/rankings",
    linkText: "See rankings",
  },
  {
    id: "materials",
    title: "Material risks",
    summary: "Eight spacecraft materials across four scenarios.",
    link: "/app/materials",
    linkText: "Open the matrix",
  },
  {
    id: "simulator",
    title: "Simulator",
    summary: "Change gravity, oxygen, pressure and flow. See what drives the risk.",
    link: "/app/simulator",
    linkText: "Run a what-if",
  },
  {
    id: "ask",
    title: "Ask Ignis",
    summary: "Answers grounded only in this dataset, with experiment citations.",
    link: "/app/insights",
    linkText: "See the answers",
  },
];

/**
 * Six capabilities, one line each. Every row is a live route, so the proof is a
 * click away instead of a paragraph.
 */
export function ProductPage() {
  const { setDrawerOpen } = useIgnis();
  const experiments = getExperiments();
  const verified = experiments.filter((experiment) => experiment.confidence === "verified").length;

  return (
    <div className="space-y-8">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-10">
        <p className="text-xs font-medium text-ig-muted">Product</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
          The Ignis research platform.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
          Six tools, one dataset, every number cited. Pick a scenario and they all follow it.
        </p>
      </section>

      <section aria-labelledby="capabilities">
        <h2 id="capabilities" className="mb-3 text-base font-semibold text-ig-frost">
          Platform capabilities
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CAPABILITIES.map((cap) => (
            <Link
              key={cap.id}
              to={cap.link}
              className="group flex items-start justify-between gap-3 rounded-panel border border-ig-line bg-ig-vacuum px-4 py-3 hover:bg-ig-raised"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ig-frost group-hover:text-ig-flame-blue">
                  {cap.title}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-ig-muted">{cap.summary}</span>
              </span>
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="mt-1 shrink-0 text-ig-muted group-hover:text-ig-flame-blue"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ig-frost">
              {experiments.length} experiments, {verified} verified
            </h2>
            <p className="mt-1 text-sm leading-6 text-ig-muted">
              Each record names its facility, conditions and NASA source.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<Sparkles size={15} />}
            onClick={() => setDrawerOpen(true)}
          >
            Ask Ignis about the data
          </Button>
        </div>

        <Collapsible
          className="mt-4"
          tone="plain"
          title="How confident is the dataset?"
          summary="Verified, curated and illustrative records, and what each badge means."
          openLabel="Read"
          closeLabel="Close"
        >
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-ig-frost">Verified</span> means the test condition and finding come
              from a NASA source we retrieved.
            </li>
            <li>
              <span className="text-ig-frost">Curated</span> means we summarised a cited source without
              re-testing it.
            </li>
            <li>
              <span className="text-ig-frost">Illustrative</span> means placeholder data. Treat it as a
              demo, not evidence.
            </li>
          </ul>
        </Collapsible>
      </section>

      <Card bordered padding="sm">
        <CardContent>
          <p className="text-xs leading-5 text-ig-muted">
            Everything on this site is decision support. Scores, material risks and simulator output
            are estimates built from cited experiments, not physics simulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
