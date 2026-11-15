import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@/design-system";

const solutions = [
  {
    id: "aerospace",
    title: "Aerospace Research",
    problem: "Combustion research is scattered across publications, datasets and technical reports spanning decades. Finding the right experiment for a lunar habitat design is slow.",
    solution: "Ignis indexes 20 verified NASA microgravity combustion experiments with full findings, conditions and sources in one searchable library.",
    features: ["Experiment library search", "Scenario-based filtering", "Evidence gap identification"],
    limitation: "Dataset covers microgravity only; lunar/Mars results are extrapolations.",
  },
  {
    id: "fire-safety",
    title: "Spacecraft Fire-Safety Research",
    problem: "Fire behaves differently in microgravity - no buoyant plume, unpredictable flame spread, hidden smouldering. Designing fire-safe cabins requires evidence specific to space conditions.",
    solution: "Rank experiments by relevance to your scenario, compare materials across gravity regimes, and generate crew response playbooks with cited evidence.",
    features: ["Scenario-based ranking", "Material risk matrix", "Crew response playbooks", "Coverage gap analysis"],
    limitation: "No partial-gravity flight data exists; lunar and Mars habitats are extrapolations.",
  },
  {
    id: "academic",
    title: "Academic Research",
    problem: "Researchers need to compare experimental findings, verify citations and build on prior work without manually aggregating records from multiple papers.",
    solution: "Every finding links to its experiment and source. The citation audit strips unsupported claims. Export mission safety briefs with full citation chains.",
    features: ["Citation auditing", "Full-text experiment records", "Markdown brief export", "Source traceability"],
    limitation: "20 experiments only; does not cover all combustion research domains.",
  },
  {
    id: "engineering",
    title: "Engineering R&D",
    problem: "Engineers need to know how materials behave at specific gravity, oxygen and pressure combinations before building flight hardware.",
    solution: "Run what-if simulations with the material risk matrix and simulator. See explained risk drivers and nearest supporting experiments for any condition.",
    features: ["Material × scenario risk matrix", "What-if risk simulator", "Nearest experiment matching"],
    limitation: "Scores are qualitative indices, not physics simulations.",
  },
  {
    id: "knowledge",
    title: "Scientific Knowledge Management",
    problem: "Research teams need a single source of truth for combustion findings, glossary terms and methodology without hunting through PDFs.",
    solution: "Glossary with inline tooltips, methodology documentation, timeline of combustion research, and a unified data model for all records.",
    features: ["21-term glossary", "Research timeline", "Methodology documentation", "Unified data contract"],
    limitation: "Curated scope - focused on microgravity combustion, not all aerospace research.",
  },
];

export function SolutionsPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Solutions</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">Research problems Ignis addresses</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">Select a problem area to see how Ignis helps, which platform features support it, and what limitations remain.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {solutions.map((sol) => (
          <Card key={sol.id} bordered padding="md" className="group hover:bg-ig-raised transition-colors">
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ig-frost">{sol.title}</h3>
                    <p className="text-sm leading-6 text-ig-muted">{sol.problem}</p>
                  </div>
                  <Badge tone="amber" className="text-[10px]">Scenario-dependent</Badge>
                </div>
                <p className="text-sm text-ig-frost">{sol.solution}</p>
                <div className="mt-4 flex flex-wrap gap-2">{sol.features.map((f) => <Badge key={f} tone="neutral" className="text-[10px]">{f}</Badge>)}</div>
                <div className="mt-3 rounded-control border border-[var(--ig-amber)] bg-[var(--ig-hull)]/50 px-3 py-2 text-[10px] text-ig-amber">
                  <span className="font-semibold">Limitation:</span> {sol.limitation}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Honesty about scope</p>
            <h2 className="mt-2 text-xl font-semibold text-ig-frost">What Ignis does not claim</h2>
            <ul className="mt-3 text-sm leading-6 text-ig-muted space-y-2">
              <li>No claim that NASA, aerospace contractors or research institutions currently use Ignis.</li>
              <li>No claim that partial-gravity fire behaviour is measured - only microgravity data exists.</li>
              <li>No claim that scores predict ignition or fire spread in real cabins.</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Link to="/app/explore" className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber">Start exploring<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
