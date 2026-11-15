import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/design-system";
import { PLATFORM_HOME } from "@/app/nav";

const tiers = [
  {
    id: "explorer",
    name: "Explorer",
    price: "Free",
    description: "For students, educators and independent researchers.",
    features: [
      { label: "20 verified NASA experiments", available: true },
      { label: "Scenario-based ranking (ISS, lunar, Mars, EVA)", available: true },
      { label: "Material risk matrix", available: true },
      { label: "What-if simulator", available: true },
      { label: "Mission safety brief export", available: true },
      { label: "Ask Ignis chatbot (offline fallback)", available: true },
      { label: "Saved research workspaces", available: false },
      { label: "Expanded exports", available: false },
      { label: "Team collaboration", available: false },
    ],
    button: "Launch Platform",
    buttonLink: PLATFORM_HOME,
  },
  {
    id: "pro",
    name: "Research Pro",
    price: "Coming soon",
    description: "For researchers seeking more advanced workflows.",
    features: [
      { label: "20 verified NASA experiments", available: true },
      { label: "Scenario-based ranking", available: true },
      { label: "Material risk matrix", available: true },
      { label: "What-if simulator", available: true },
      { label: "Mission safety brief export", available: true },
      { label: "Ask Ignis chatbot", available: true },
      { label: "Saved research workspaces", available: false },
      { label: "Expanded exports (PDF, CSV)", available: false },
      { label: "Advanced analysis workflows", available: false },
      { label: "Team collaboration", available: false },
    ],
    button: "Coming soon",
    buttonLink: null,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Future availability",
    description: "For research organizations with specialized requirements.",
    features: [
      { label: "Custom scientific datasets", available: false },
      { label: "Research platform integrations", available: false },
      { label: "Organization-specific deployments", available: false },
      { label: "Team access & management", available: false },
      { label: "Custom analysis workflows", available: false },
      { label: "Dedicated support", available: false },
    ],
    button: null,
    buttonLink: null,
  },
];

export function PricingPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Pricing</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">Pricing for research teams</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">Ignis is free to use. Paid tiers are planned - nothing here is a checkout page.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.id} bordered padding="md" className={`flex flex-col group ${tier.id === "pro" ? "border-2 border-ig-flame-blue" : ""}`}>
            <CardContent>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">{tier.id === "pro" ? "Coming soon" : tier.id === "enterprise" ? "Future availability" : "Available now"}</span>
                <h3 className="text-xl font-semibold text-ig-frost">{tier.name}</h3>
                <p className="text-xl font-semibold text-ig-frost">{tier.price}</p>
                <p className="text-sm text-ig-muted">{tier.description}</p>
                <div className="mt-4 space-y-2 text-sm text-ig-muted">
                  {tier.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-2">
                      <span className={`text-[10px] shrink-0 ${f.available ? "text-ig-quench" : "text-ig-muted"}`}>{f.available ? "\u2713" : "\u2013"}</span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
                {tier.button && tier.buttonLink ? (
                  <Link to={tier.buttonLink} className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber">{tier.button}<ArrowRight size={15} aria-hidden="true" /></Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">Feature comparison</p>
            <h2 className="mt-2 text-xl font-semibold text-ig-frost">What each tier includes</h2>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ig-line">
                <th className="py-3 pr-4 text-[10px] font-medium text-ig-muted uppercase tracking-wider">Feature</th>
                {tiers.map((t) => <th key={t.id} className="py-3 text-[10px] font-medium text-ig-muted uppercase tracking-wider">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {["20 verified NASA experiments", "Scenario-based ranking", "Material risk matrix", "What-if simulator", "Mission safety brief export", "Ask Ignis chatbot", "Saved research workspaces", "Expanded exports", "Advanced analysis workflows", "Team collaboration", "Custom datasets", "Organization deployments"].map((feature) => (
                <tr key={feature} className="border-b border-ig-line last:border-0">
                  <td className="py-3 pr-4 text-xs font-medium text-ig-frost">{feature}</td>
                  {tiers.map((t) => {
                    const available = t.features.find((f) => f.label === feature)?.available ?? false;
                    return (
                      <td key={t.id} className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${available ? "bg-ig-quench text-ig-vacuum" : "bg-ig-line text-ig-muted"}`}>{available ? "\u2713" : "\u2013"}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-ig-muted space-y-1">
          <p>• Available now = feature exists in the Ignis Research Platform today.</p>
          <p>• Planned = under consideration for a future paid tier; no date committed.</p>
          <p>• Not available = not part of the current or planned offering.</p>
        </div>
      </section>
    </div>
  );
}
