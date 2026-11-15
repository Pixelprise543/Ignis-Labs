import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent, Collapsible } from "@/design-system";

const SOLUTIONS = [
  {
    id: "aerospace",
    title: "Aerospace research",
    summary: "Find the one experiment that fits your habitat design question.",
    problem:
      "Combustion results are scattered across decades of publications, datasets and technical reports, so finding the right experiment is slow.",
    solution:
      "Twenty verified NASA microgravity experiments, with findings, conditions and sources, in one searchable library.",
    features: ["Library search", "Scenario filters", "Gap identification"],
    limitation: "Dataset covers microgravity only. Lunar and Mars results are extrapolations.",
  },
  {
    id: "fire-safety",
    title: "Spacecraft fire safety",
    summary: "Rank evidence by scenario and turn it into a crew playbook.",
    problem:
      "No buoyant plume, unpredictable spread and hidden smouldering mean cabin fire safety needs space-specific evidence.",
    solution:
      "Rank experiments for your scenario, compare materials across gravity regimes, and generate crew response steps with cited evidence.",
    features: ["Scenario ranking", "Material risk matrix", "Crew playbooks"],
    limitation: "No partial-gravity flight data exists. Lunar and Mars habitat views extrapolate.",
  },
  {
    id: "academic",
    title: "Academic research",
    summary: "Every finding links back to its experiment and source.",
    problem:
      "Comparing findings and verifying citations usually means manually aggregating records from many papers.",
    solution:
      "Each finding links to its experiment and source. The citation audit strips unsupported claims before anything is shown.",
    features: ["Citation auditing", "Full records", "Markdown export"],
    limitation: "Twenty experiments only. It does not cover every combustion domain.",
  },
  {
    id: "engineering",
    title: "Engineering R&D",
    summary: "Check a material at a specific gravity, oxygen and pressure.",
    problem:
      "Engineers need material behaviour at a given condition before hardware is built.",
    solution:
      "Run a what-if with the material matrix and the simulator. See the risk drivers and the nearest supporting experiments.",
    features: ["Material matrix", "What-if simulator", "Nearest evidence"],
    limitation: "Scores are qualitative indices, not physics simulations.",
  },
  {
    id: "knowledge",
    title: "Knowledge management",
    summary: "One glossary, one timeline, one cited data model.",
    problem:
      "Teams need a single source of truth for terms, findings and method without hunting through PDFs.",
    solution:
      "Plain-language glossary with inline tooltips, a research timeline, and method notes that explain every score.",
    features: ["Glossary", "Timeline", "Method notes"],
    limitation: "Curated scope, focused on microgravity combustion.",
  },
];

export function SolutionsPage() {
  return (
    <div className="space-y-8">
      <section className="ig-glass rounded-panel p-6 lg:p-10">
        <p className="text-xs font-medium text-ig-muted">Solutions</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
          Research problems Ignis addresses.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
          Five problem areas. Open one to see the fix and the limit.
        </p>
      </section>

      <section className="grid gap-2">
        {SOLUTIONS.map((solution) => (
          <Card key={solution.id} bordered padding="none">
            <CardContent>
              <Collapsible
                tone="plain"
                className="px-4"
                title={solution.title}
                summary={solution.summary}
                openLabel="Details"
                closeLabel="Close"
              >
                <div className="space-y-3 pb-1">
                  <p>
                    <span className="font-medium text-ig-frost">Problem.</span> {solution.problem}
                  </p>
                  <p>
                    <span className="font-medium text-ig-frost">What Ignis does.</span>{" "}
                    {solution.solution}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.features.map((feature) => (
                      <Badge key={feature} tone="neutral">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <p className="rounded-control border border-ig-amber px-3 py-2 text-xs leading-5 text-ig-amber">
                    <span className="font-semibold">Limit.</span> {solution.limitation}
                  </p>
                </div>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="ig-glass rounded-panel p-6 lg:p-8">
        <h2 className="text-base font-semibold text-ig-frost">What Ignis does not claim</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ig-muted">
          <li>No claim that NASA, aerospace contractors or research institutions use Ignis.</li>
          <li>No claim that partial-gravity fire behaviour is measured. Only microgravity data exists.</li>
          <li>No claim that scores predict ignition or fire spread in a real cabin.</li>
        </ul>
        <Link
          to="/app"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          Open platform
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
