import { Collapsible } from "@/design-system";

const ROLES = [
  { id: "ceo", label: "CEO", role: "Chief Executive Officer", desc: "Strategy, vision and partnerships." },
  { id: "cto", label: "CTO", role: "Chief Technology Officer", desc: "Architecture and platform engineering." },
  { id: "cso", label: "CSO", role: "Chief Scientific Officer", desc: "Method, research integrity and validation." },
  { id: "coo", label: "COO", role: "Chief Operating Officer", desc: "Operations and project delivery." },
  { id: "cpo", label: "CPO", role: "Chief Product Officer", desc: "Product strategy and user experience." },
  { id: "cbo", label: "CBO", role: "Chief Business Officer", desc: "Business development and partnerships." },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-6 lg:p-10">
        <p className="text-xs font-medium text-ig-muted">About</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">
          Making hard research easier to use.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ig-muted">
          Ignis Labs builds scientific intelligence software. Our first product turns microgravity
          combustion research into fire-safety answers.
        </p>
      </section>

      <section className="space-y-2" aria-label="Company background">
        <Collapsible
          title="Where this started"
          summary="A NASA Space Apps 2026 challenge about flames in freefall."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            Ignis Labs began at the NASA Space Apps Challenge 2026 with the prompt "Flame in
            Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data". The focus
            on microgravity combustion led to a wider idea: research software that helps teams read,
            compare and interpret experimental evidence.
          </p>
          <p className="mt-2 text-ig-amber">
            Participation in NASA Space Apps does not imply NASA endorsement.
          </p>
        </Collapsible>

        <Collapsible
          title="Where it goes next"
          summary="Same data model, more research domains."
          openLabel="Read"
          closeLabel="Close"
        >
          <p>
            The first product stays on microgravity combustion and its relevance to fire safety in
            space exploration. The longer-term ambition is to apply the same evidence-first model to
            other aerospace and engineering research domains.
          </p>
        </Collapsible>

        <Collapsible
          title="Leadership roles"
          summary="Six role placeholders. No roles are filled yet."
          openLabel="See roles"
          closeLabel="Close"
        >
          <p className="text-xs text-ig-muted">
            These are organisational placeholders, not claims that the positions are filled.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ROLES.map((person) => (
              <li key={person.id} className="rounded-control border border-ig-line px-3 py-2">
                <p className="text-sm font-medium text-ig-frost">{person.label}</p>
                <p className="text-xs text-ig-muted">{person.role}</p>
                <p className="mt-1 text-xs leading-5 text-ig-muted">{person.desc}</p>
              </li>
            ))}
          </ul>
        </Collapsible>
      </section>
    </div>
  );
}
