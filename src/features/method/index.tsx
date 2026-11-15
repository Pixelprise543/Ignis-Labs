import { Link } from "react-router-dom";
import { Collapsible, Term } from "@/design-system";

/**
 * Method notes. Nine sections, each folded to one line. The honesty rules are
 * still all here, just not stacked in front of the reader at once.
 */
export function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ig-frost">How Ignis works</h1>
        <p className="mt-1 text-sm leading-6 text-ig-muted">
          What is measured, what is estimated, and what this dataset cannot answer. Open a section when
          you need it.
        </p>
      </header>

      <div className="space-y-2">
        <Collapsible
          title="One scenario drives every view"
          summary="Change gravity once. Rankings, insights, simulator and playbook follow."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Every experiment is a record with a facility, gravity regime, fuel, conditions, findings, a
            plain-language takeaway and at least one source. Ignis never shows an experiment without
            its confidence badge and sources.
          </p>
          <p className="mt-2">
            Gravity, oxygen and pressure are set once in the scenario bar. Every list re-scores from
            that one input, so two views can never disagree about the scenario.
          </p>
        </Collapsible>

        <Collapsible
          title="Ranking and scores"
          summary="Four sub-scores, weighted and normalised, with a visible rationale."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Each experiment gets four sub-scores from 0 to 100: hazard severity, exploration value,
            evidence strength and recency. The composite is their weighted average divided by the sum
            of the weights, so moving one slider never inflates the scale.
          </p>
          <p className="mt-2">
            The scenario changes hazard severity. A finding that matters in a 34% oxygen cabin weighs
            differently in a 21% cabin. Every ranked row shows its four sub-scores and a short
            rationale, so a surprising rank can be traced rather than guessed.
          </p>
          <p className="mt-2">
            Weights are yours to change on the{" "}
            <Link to="/app/rankings" className="text-ig-flame-blue hover:underline">
              Rankings page
            </Link>
            .
          </p>
        </Collapsible>

        <Collapsible
          title="What the confidence badges mean"
          summary="Verified, curated and illustrative, and what each one does not promise."
          openLabel="Read"
          closeLabel="Close"
        >
          <dl className="space-y-3">
            <div>
              <dt className="font-medium text-ig-frost">Verified</dt>
              <dd>
                Checked against a cited NASA source the team actually retrieved. The numbers shown come
                from that source.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ig-frost">Curated</dt>
              <dd>
                Summarised from a cited source by a person. Treat the wording as a reading of the
                source, not a verbatim extract.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ig-frost">Illustrative</dt>
              <dd>
                A placeholder used to demonstrate the interface. Not a NASA result, and never to be
                quoted as one.
              </dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-ig-line pt-3 text-xs leading-5">
            Confidence describes the record, not the physics. A verified record can still be old,
            narrow or loosely related to your scenario.
          </p>
        </Collapsible>

        <Collapsible
          title="How Ask Ignis stays grounded"
          summary="Dataset-only answers, citation auditing, offline fallback."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            The assistant answers only from the experiments, insights, materials and playbooks in this
            dataset. A citation guard drops any id that does not map to a real experiment and reports
            how many it removed.
          </p>
          <p className="mt-2">
            With no model key, a deterministic offline fallback runs. It is labelled "Offline fallback"
            and still cites experiment ids, so the demo works without a network.
          </p>
          <p className="mt-2">
            The grounding score is the share of citations that survived validation. It is not a
            confidence score for the science.
          </p>
        </Collapsible>

        <Collapsible
          title="Simulator and material risk"
          summary="Four adjustments, each explained and evidence-linked. Estimates only."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            The simulator combines a qualitative material baseline with oxygen, gravity, pressure and
            flow adjustments. Each adjustment appears as a driver with a direction, a relative weight,
            an explanation and the experiments behind it. Nearest experiments are matched by gravity
            and oxygen.
          </p>
          <p className="mt-2 text-ig-amber">
            These are decision-support estimates, not physics simulations, ignition thresholds or
            probabilities. A score of 60 does not mean a 60% chance of fire.
          </p>
        </Collapsible>

        <Collapsible
          title="Coverage and gaps"
          summary="Empty cells are missing research, not safe conditions."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            The coverage map counts experiments per gravity and oxygen band. The{" "}
            <Link to="/app/coverage" className="text-ig-flame-blue hover:underline">
              Coverage view
            </Link>{" "}
            names the gaps, and the assistant can interpret them for the active scenario.
          </p>
        </Collapsible>

        <Collapsible
          title="Terms used here"
          summary="microgravity, buoyancy and friends, in plain language."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            <Term id="microgravity" /> removes <Term id="buoyancy" />, so a flame can settle into a
            round sphere instead of an Earth-like teardrop. Underlined terms show a plain definition on
            hover or keyboard focus. The full list is in the{" "}
            <Link to="/app/glossary" className="text-ig-flame-blue hover:underline">
              Glossary
            </Link>
            .
          </p>
        </Collapsible>

        <Collapsible
          title="Limitations"
          summary="Six limits that apply to every number on this site."
          openLabel="Read"
          closeLabel="Close"
          defaultOpen
        >
          <ul className="list-disc space-y-1.5 pl-5">
            <li>The dataset is small and unevenly spread across gravity and oxygen bands.</li>
            <li>Scenario values marked assumed are planning inputs, not measured cabin readings.</li>
            <li>Scores and material indices are qualitative and cannot replace a flammability test.</li>
            <li>Source years vary. Older results may not reflect current materials or procedures.</li>
            <li>Nothing here uses live telemetry or a validated fire model.</li>
            <li>Absence of a risk signal is not evidence of safety.</li>
          </ul>
        </Collapsible>
      </div>

      <p className="border-t border-ig-line pt-3 text-xs leading-5 text-ig-muted">
        Read the{" "}
        <Link to="/app/brief" className="text-ig-flame-blue hover:underline">
          Mission Safety Brief
        </Link>{" "}
        for the current scenario, or open the{" "}
        <Link to="/app/playbook" className="text-ig-flame-blue hover:underline">
          crew playbook
        </Link>
        .
      </p>
    </div>
  );
}
