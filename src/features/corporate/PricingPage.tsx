import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, Collapsible } from "@/design-system";
import { PLATFORM_HOME } from "@/app/nav";

const tiers = [
  {
    id: "explorer",
    name: "Explorer",
    status: "Available now",
    price: "Free",
    description: "For students, educators and independent researchers.",
    features: [
      { label: "20 verified NASA experiments", available: true },
      { label: "Scenario-based ranking", available: true },
      { label: "Material risk matrix", available: true },
      { label: "What-if simulator", available: true },
      { label: "Mission safety brief export", available: true },
      { label: "Ask Ignis chatbot", available: true },
      { label: "Saved research workspaces", available: false },
      { label: "Expanded exports", available: false },
      { label: "Team collaboration", available: false },
    ],
    button: "Open platform",
    buttonLink: PLATFORM_HOME,
  },
  {
    id: "pro",
    name: "Research Pro",
    status: "Coming soon",
    price: "Not priced",
    description: "For researchers who need saved workspaces and richer exports.",
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
    button: null,
    buttonLink: null,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    status: "Future availability",
    price: "Not priced",
    description: "For organisations with their own datasets and deployments.",
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

const COMPARE_ROWS = [
  "20 verified NASA experiments",
  "Scenario-based ranking",
  "Material risk matrix",
  "What-if simulator",
  "Mission safety brief export",
  "Ask Ignis chatbot",
  "Saved research workspaces",
  "Expanded exports",
  "Advanced analysis workflows",
  "Team collaboration",
  "Custom datasets",
  "Organization deployments",
];

/**
 * Three short cards, one table behind a fold. The cards used to repeat the whole
 * feature list three times before the table repeated it again.
 */
export function PricingPage() {
  return (
    <div className="space-y-8">
      <section className="ig-glass rounded-panel p-6 lg:p-10">
        <p className="text-xs font-medium text-ig-muted">Pricing</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
          Pricing for research teams.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
          Ignis is free to use. Paid tiers are planned, and nothing here is a checkout page.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-3" aria-label="Pricing tiers">
        {tiers.map((tier) => {
          const included = tier.features.filter((feature) => feature.available).length;
          return (
            <Card
              key={tier.id}
              bordered
              padding="md"
              className={`flex flex-col ${tier.id === "pro" ? "border-ig-amber" : ""}`}
            >
              <CardContent className="flex flex-1 flex-col">
                <p className="text-xs font-medium text-ig-muted">{tier.status}</p>
                <h2 className="mt-1 text-lg font-semibold text-ig-frost">{tier.name}</h2>
                <p className="ig-num mt-1 text-base text-ig-frost">{tier.price}</p>
                <p className="mt-2 text-sm leading-6 text-ig-muted">{tier.description}</p>
                <p className="mt-3 text-xs text-ig-muted">
                  {included} of {tier.features.length} features included today
                </p>

                <div className="mt-auto pt-4">
                  {tier.button && tier.buttonLink ? (
                    <Link
                      to={tier.buttonLink}
                      className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
                    >
                      {tier.button}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  ) : (
                    <p className="text-xs text-ig-muted">No sign-up yet. Use the free tier.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Collapsible
        title="Compare every feature"
        summary="Twelve features across the three tiers."
        openLabel="Open table"
        closeLabel="Close table"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Feature availability by pricing tier</caption>
            <thead>
              <tr className="border-b border-ig-line">
                <th scope="col" className="py-2 pr-4 text-xs font-medium text-ig-muted">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.id}
                    scope="col"
                    className="py-2 text-center text-xs font-medium text-ig-muted"
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((feature) => (
                <tr key={feature} className="border-b border-ig-line last:border-0">
                  <td className="py-2 pr-4 text-xs font-medium text-ig-frost">{feature}</td>
                  {tiers.map((tier) => {
                    const available =
                      tier.features.find((entry) => entry.label === feature)?.available ?? false;
                    return (
                      <td key={tier.id} className="py-2 text-center">
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          title={available ? "Included" : "Not included"}
                        >
                          <span className={available ? "text-ig-quench" : "text-ig-muted"}>
                            {available ? "✓" : "–"}
                          </span>
                          <span className="sr-only">{available ? "Included" : "Not included"}</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ig-muted">
          Included means the feature exists today. Voice any tier request through the About page.
        </p>
      </Collapsible>
    </div>
  );
}
