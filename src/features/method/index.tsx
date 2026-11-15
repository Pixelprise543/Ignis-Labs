import { Panel } from "@/design-system";

export function MethodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Method</h2>
        <p className="text-sm text-ig-muted">
          How scoring, confidence, SI grounding and the simulator work — plus limitations.
        </p>
      </div>

      <Panel title="Scoring" subtitle="Transparent, additive, not a model.">
        <p className="text-sm text-ig-muted mb-3">
          Every ranked experiment gets four 0–100 scores — hazard severity, exploration value,
          evidence strength, and recency — plus a composite. Weights are normalised at use time,
          so the sliders on the Rankings page are independent.
        </p>
        <ul className="space-y-2 text-xs text-ig-muted">
          <li>
            <span className="font-semibold text-ig-frost">Hazard severity:</span> gravity, oxygen,
            pressure match to the scenario, plus fuel relevance.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Exploration value:</span> tags, measured
            metrics, and findings count.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Evidence strength:</span> confidence level
            (verified / curated / illustrative), source count, finding count.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Recency:</span> years since the last
            recorded result.
          </li>
        </ul>
      </Panel>

      <Panel title="Confidence" subtitle="Every experiment carries a badge.">
        <ul className="space-y-2 text-xs text-ig-muted">
          <li>
            <span className="font-semibold text-ig-frost">Verified:</span> from a cited NASA source
            actually retrieved.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Curated:</span> summarized from a cited
            source.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Illustrative:</span> placeholder.
          </li>
        </ul>
      </Panel>

      <Panel title="SI grounding" subtitle="Ask Ignis cites experiment IDs.">
        <p className="text-sm text-ig-muted mb-3">
          The "Ask Ignis" drawer is grounded only in our dataset. It cites experiment IDs and
          never presents invented numbers as NASA fact. If the API is unavailable, it falls back
          to a deterministic offline answer.
        </p>
      </Panel>

      <Panel title="Simulator" subtitle="Decision-support estimate, not a physics simulation.">
        <p className="text-sm text-ig-muted mb-3">
          The what-if risk estimator starts from a material's qualitative flammability index and
          applies named adjustments for gravity, oxygen, pressure, and ventilation. Every driver
          shows its weight, direction, and evidence IDs. No experiment reports a measured flow
          rate, so the ventilation term is a heuristic.
        </p>
      </Panel>

      <Panel title="Limitations" subtitle="Be honest about the data.">
        <ul className="space-y-2 text-xs text-ig-muted">
          <li>
            <span className="font-semibold text-ig-frost">No partial-gravity data:</span> Mars
            gravity (0.38 g) has no experimental record; results there extrapolate from
            microgravity.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Not physics:</span> scores, risks, and
            simulator outputs are decision-support estimates, not simulations.
          </li>
          <li>
            <span className="font-semibold text-ig-frost">Oxygen not always reported:</span> some
            records lack a published oxygen fraction and sit in a "not specified" band.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
