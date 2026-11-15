import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getExperiments, useIgnis } from "@/app/data";
import { PLATFORM_HOME } from "@/app/nav";
import { Badge, Button, Card, CardContent, Collapsible } from "@/design-system";

const INSIDE = [
  { to: "/app/explore", title: "Experiment library", text: "Twenty NASA records, each with sources." },
  { to: "/app/rankings", title: "Rankings", text: "Weighted fire-risk scores you can audit." },
  { to: "/app/materials", title: "Material risks", text: "Eight materials across four scenarios." },
  { to: "/app/simulator", title: "Simulator", text: "Test a cabin condition and see the drivers." },
];

/**
 * Marketing landing. Short on purpose: the platform, not this page, is where the
 * dataset lives. Four doors, three numbers, and the honesty caveat folded away.
 */
export function HomePage() {
  const { scenario, setDrawerOpen } = useIgnis();
  const experiments = getExperiments();
  const verified = experiments.filter((experiment) => experiment.confidence === "verified").length;
  const cited = experiments.reduce((total, experiment) => total + experiment.sources.length, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-xs font-medium text-ig-muted">Ignis Labs</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
              Scientific intelligence for the next frontier.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
              Research software that turns microgravity combustion data into fire-safety answers you
              can trace back to a NASA source.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={PLATFORM_HOME}
                className="inline-flex h-11 items-center gap-2 rounded-control bg-ig-flame-blue px-5 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
              >
                Open platform
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Button
                variant="outline"
                size="lg"
                icon={<Sparkles size={15} />}
                onClick={() => setDrawerOpen(true)}
              >
                Ask Ignis
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-start gap-2 lg:justify-end">
            <Badge tone="gold">{scenario.label}</Badge>
            <span className="ig-num text-xs leading-none text-ig-muted">
              {scenario.gravityG.toFixed(2)}g
            </span>
            <span className="ig-num text-xs leading-none text-ig-muted">
              {scenario.o2Percent ?? "—"}% O2
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Dataset at a glance" className="grid grid-cols-3 gap-3">
        {[
          { label: "Experiments", value: experiments.length },
          { label: "Verified records", value: verified },
          { label: "Cited sources", value: cited },
        ].map((stat) => (
          <Card key={stat.label} padding="sm" bordered>
            <CardContent>
              <p className="ig-num text-2xl font-semibold leading-none text-ig-frost">{stat.value}</p>
              <p className="mt-2 text-xs leading-4 text-ig-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="inside">
        <h2 id="inside" className="mb-3 text-base font-semibold text-ig-frost">
          What's inside
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {INSIDE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between gap-3 rounded-panel border border-ig-line bg-ig-vacuum px-4 py-3 hover:bg-ig-raised"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ig-frost group-hover:text-ig-flame-blue">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-ig-muted">{item.text}</span>
              </span>
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="shrink-0 text-ig-muted group-hover:text-ig-flame-blue"
              />
            </Link>
          ))}
        </div>
      </section>

      <Collapsible
        title="What Ignis does not claim"
        summary="Scope, limits and the honesty rules behind every number."
        openLabel="Read"
        closeLabel="Close"
      >
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No claim that NASA or any research institution currently uses Ignis.</li>
          <li>Partial-gravity flame spread is not measured. Lunar and Mars views extrapolate.</li>
          <li>Scores and material risks are decision-support estimates, not physics simulations.</li>
          <li>Twenty experiments is a curated set, not all aerospace combustion research.</li>
        </ul>
        <Link to="/app/method" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ig-flame-blue hover:underline">
          Read the method <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </Collapsible>
    </div>
  );
}
