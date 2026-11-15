import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible } from "@/design-system";

export function TechnologyPage() {
  return (
    <div className="space-y-8">
      <section className="ig-glass rounded-panel p-6 lg:p-10">
        <p className="text-xs font-medium text-ig-muted">Technology</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
          How Ignis works.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
          Four short explanations. If a number cannot be traced to a source, it is not shown.
        </p>
      </section>

      <section className="space-y-2" aria-label="How Ignis works">
        <Collapsible
          title="The data"
          summary="20 experiments, each with conditions, metrics and a NASA source."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Every experiment records gravity regime, oxygen fraction, pressure, fuel type, facility,
            metrics and a one-line safety takeaway. Missing metrics read "not published" and are
            never filled in.
          </p>
          <p className="mt-2">Each record carries a confidence badge: verified, curated or illustrative.</p>
        </Collapsible>

        <Collapsible
          title="The insights"
          summary="Curated rules, not generated prose. Each one cites finding ids."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Insights are written rules that reference findings which exist in the dataset. Severity
            moves with the scenario: oxygen enrichment in an EVA suit is critical, while the same
            lesson does not apply to the ISS cabin.
          </p>
        </Collapsible>

        <Collapsible
          title="The scoring"
          summary="Four weighted factors produce a 0-100 score you can audit."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Hazard severity, exploration value, evidence strength and recency are normalised into one
            score. Material risks start from a base flammability index and adjust for gravity, oxygen
            and pressure. You can move the weights and watch the order change.
          </p>
          <p className="mt-2">Scores are decision support. They are not ignition predictions.</p>
        </Collapsible>

        <Collapsible
          title="Ask Ignis"
          summary="Answers grounded only in this dataset, citations audited before display."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            The assistant answers from the dataset and cites experiment ids. Unsupported citations are
            stripped before the answer is shown. With no model key configured it falls back to a
            deterministic offline answer, so the demo works without a network.
          </p>
        </Collapsible>
      </section>

      <section className="ig-glass rounded-panel p-6 lg:p-8">
        <h2 className="text-base font-semibold text-ig-frost">Known limits</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ig-muted">
          <li>Not a physics simulation. Estimates only.</li>
          <li>No partial-gravity flame-spread data exists, so lunar and Mars views extrapolate.</li>
          <li>Ventilation in the simulator uses a heuristic, because flow-rate data is not published.</li>
        </ul>
        <Link
          to="/app/method"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
        >
          Read the method
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
