import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/design-system";

export function TechnologyPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Technology</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">How Ignis works</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">Every number traces to a cited NASA record. The platform is deliberately simple so you can audit it.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">Research Data Architecture</h3>
            <p className="text-sm text-ig-muted">20 experiments, 45 findings, 8 materials, 21 glossary terms - all traceable to cited NASA sources. Each experiment carries gravity regime, oxygen fraction, pressure, fuel type, facility, metrics and safety takeaway.</p>
            <p className="mt-3 text-xs text-ig-muted">Source: data/experiments/*.ts - every experiment imports from @/contracts/types (frozen).</p>
          </CardContent>
        </Card>
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">Scientific Intelligence</h3>
            <p className="text-sm text-ig-muted">Insights are curated rules, not generated prose. Each rule cites finding IDs that exist in the dataset. Severity moves with the scenario - oxygen enrichment in EVA is critical, the same lesson is absent from ISS.</p>
          </CardContent>
        </Card>
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">AI Assistant - Ask Ignis</h3>
            <p className="text-sm text-ig-muted">Deterministic answers grounded only in the dataset. Every citation is audited before display - unsupported citations are stripped. Falls back to offline answers when no model key is configured.</p>
            <p className="mt-3 text-xs text-ig-muted">Modes: summarize, compare, interpret, ask, brief, playbook.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">Scenario Analysis</h3>
            <p className="text-sm text-ig-muted">Five presets: ISS cabin (0g, 21% O2), Lunar habitat (0.16g), Mars transit (0.38g), EVA suit (0g, 100% O2, 29.6 kPa), Custom. Lunar/Mars are notional - marked as assumptions.</p>
          </CardContent>
        </Card>
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">Ranking & Risk Methodology</h3>
            <p className="text-sm text-ig-muted">Four weighted factors (hazard severity, exploration, evidence, recency) produce 0-100 scores. Weights are normalised; material risks use base flammability index adjusted for gravity, oxygen and pressure.</p>
            <p className="mt-3 text-xs text-ig-muted">See /app/method for full equations and thresholds.</p>
          </CardContent>
        </Card>
        <Card bordered padding="md">
          <CardContent>
            <h3 className="text-sm font-semibold text-ig-frost mb-3">Scientific Transparency</h3>
            <p className="text-sm text-ig-muted">Every confidence badge (verified/curated/illustrative), every citation chip, every finding ID resolves to a real record. Missing metrics show "not published" - never estimated.</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Limitations</p>
            <h2 className="mt-2 text-xl font-semibold text-ig-frost">What Ignis does not do</h2>
          </div>
          <div className="flex justify-end">
            <Link to="/app/method" className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-white hover:bg-ig-amber">Read methodology<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="mt-4 text-sm leading-6 text-ig-muted space-y-2">
          <li>• Not a physics simulation - decision-support estimates only.</li>
          <li>No partial-gravity flame-spread data exists; lunar/Mars results extrapolate from microgravity.</li>
          <li>20 experiments only - does not cover all aerospace combustion research.</li>
          <li>Ventilation term in the simulator is a heuristic - no published flow rate data.</li>
          <li>Metric values marked "not published" are never estimated.</li>
        </div>
      </section>
    </div>
  );
}
