import { Link } from "react-router-dom";
import { Panel, Term } from "@/design-system";

export function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ig-frost">How Ignis works</h1>
        <p className="mt-1 text-sm leading-6 text-ig-muted">
          The scoring, confidence, assistant grounding and simulator are deliberately simple so you can
          audit them. This page states what is measured, what is estimated and what the dataset cannot
          answer.
        </p>
      </header>

      <Panel title="Summarize, rank, interpret">
        <div className="space-y-2 text-sm leading-6 text-ig-muted">
          <p>
            Every experiment is a record with a facility, gravity regime, fuel, conditions, findings,
            a plain-language safety takeaway and at least one source. Ignis never displays an
            experiment without its confidence badge and sources.
          </p>
          <p>
            Views share one scenario. Changing gravity, oxygen or pressure in the scenario bar
            re-scores rankings, re-orders insights, re-baselines the simulator and rewrites the
            playbook and brief.
          </p>
        </div>
      </Panel>

      <Panel title="Ranking and scores">
        <div className="space-y-2 text-sm leading-6 text-ig-muted">
          <p>
            Each experiment receives four sub-scores from 0 to 100: hazard severity, exploration
            value, evidence strength and recency. The composite is a weighted average of those four,
            normalised by the sum of the weights, so moving one slider never inflates the scale.
          </p>
          <p>
            The scenario changes hazard severity: a finding that matters in a 34% oxygen cabin weighs
            differently in a 21% cabin. Every ranked row shows the four sub-scores and a short
            rationale, so a surprising rank can be traced instead of guessed.
          </p>
          <p>
            Weights are yours to change on the{" "}
            <Link to="/rankings" className="text-ig-flame-blue hover:underline">
              Rankings page
            </Link>
            . Nothing is hidden behind a single opaque number.
          </p>
        </div>
      </Panel>

      <Panel title="Confidence badges">
        <dl className="space-y-3 text-sm leading-6">
          <div>
            <dt className="font-medium text-ig-frost">Verified</dt>
            <dd className="text-ig-muted">
              The record was checked against a cited NASA source that the team actually retrieved. The
              numbers shown are from that source.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ig-frost">Curated</dt>
            <dd className="text-ig-muted">
              The record is summarized from a cited source by a person. Treat the wording as a reading
              of the source, not a verbatim extract.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ig-frost">Illustrative</dt>
            <dd className="text-ig-muted">
              A placeholder used to demonstrate the interface. It is not a NASA result and must not be
              quoted as one. If you see this badge in a demo, say so out loud.
            </dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-ig-line pt-3 text-xs leading-5 text-ig-muted">
          Confidence describes the record, not the physics. A verified record can still be old, narrow
          or only loosely related to your scenario.
        </p>
      </Panel>

      <Panel title="Grounded assistant">
        <div className="space-y-2 text-sm leading-6 text-ig-muted">
          <p>
            Ask Ignis answers only from the experiments, insights, materials and playbooks in this
            dataset. The assistant returns markdown plus a citation list. A citation guard drops any ID
            that does not map to a real experiment and reports how many it removed.
          </p>
          <p>
            Without a model key, the deterministic offline fallback runs instead. It is labeled
            &ldquo;Offline fallback&rdquo; and still answers with cited experiment IDs, so the demo works
            with no network.
          </p>
          <p>
            Grounding score is the share of the answer&rsquo;s citations that survived validation. It is not a
            confidence score for the science.
          </p>
        </div>
      </Panel>

      <Panel title="Simulator and material risk">
        <div className="space-y-2 text-sm leading-6 text-ig-muted">
          <p>
            The simulator combines a qualitative material baseline with oxygen, gravity, pressure and
            flow adjustments. Each adjustment is shown as a driver with a direction, a relative weight,
            an explanation and the experiments behind it. The nearest supporting experiments are
            matched by gravity and oxygen.
          </p>
          <p className="text-ig-amber">
            These are decision-support estimates, not physics simulations, ignition thresholds or
            probabilities. A score of 60 does not mean a 60% chance of fire.
          </p>
        </div>
      </Panel>

      <Panel title="Coverage and gaps">
        <div className="space-y-2 text-sm leading-6 text-ig-muted">
          <p>
            The coverage map counts experiments in gravity and oxygen bands. Empty cells are research
            gaps, not safe conditions. The{" "}
            <Link to="/coverage" className="text-ig-flame-blue hover:underline">
              Coverage view
            </Link>{" "}
            names the gaps and the assistant can interpret them for the active scenario.
          </p>
        </div>
      </Panel>

      <Panel title="Terms used here">
        <p className="text-sm leading-6 text-ig-muted">
          <Term id="microgravity" /> removes <Term id="buoyancy" />, so a flame can settle into a{" "}
          <Term id="flame-sphere" /> instead of an Earth-like teardrop. Underlined terms show a plain
          definition on hover or keyboard focus. The full list is in the{" "}
          <Link to="/glossary" className="text-ig-flame-blue hover:underline">
            Glossary
          </Link>
          .
        </p>
      </Panel>

      <Panel title="Limitations">
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-ig-muted">
          <li>The dataset is small and unevenly distributed across gravity and oxygen bands.</li>
          <li>Scenario values marked as assumed are planning inputs, not measured cabin readings.</li>
          <li>Scores and material indices are qualitative and cannot replace a flammability test.</li>
          <li>Source years vary. Older results may not reflect current materials or procedures.</li>
          <li>Nothing here uses live vehicle telemetry or a validated fire model.</li>
          <li>Absence of a risk signal is not evidence of safety.</li>
        </ul>
      </Panel>

      <p className="border-t border-ig-line pt-3 text-xs leading-5 text-ig-muted">
        Read the <Link to="/brief" className="text-ig-flame-blue hover:underline">Mission Safety Brief</Link>{" "}
        for the current scenario, or open the{" "}
        <Link to="/playbook" className="text-ig-flame-blue hover:underline">
          Crew playbook
        </Link>{" "}
        page any time from the rail.
      </p>
    </div>
  );
}
