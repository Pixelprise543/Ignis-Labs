import { Card, CardContent } from "@/design-system";

const leadership = [
  { id: "ceo", role: "Chief Executive Officer", label: "CEO", desc: "Company strategy, vision, partnerships and overall leadership." },
  { id: "cto", role: "Chief Technology Officer", label: "CTO", desc: "Software architecture, technical strategy, platform engineering and technology development." },
  { id: "cso", role: "Chief Scientific Officer", label: "CSO", desc: "Scientific methodology, research integrity, validation and technical research direction." },
  { id: "coo", role: "Chief Operating Officer", label: "COO", desc: "Company operations, internal coordination, project execution and organizational development." },
  { id: "cpo", role: "Chief Product Officer", label: "CPO", desc: "Product strategy, user experience, feature prioritization and product development." },
  { id: "cbo", role: "Chief Business Officer", label: "CBO", desc: "Business development, market strategy, customer relationships and commercial growth." },
];

export function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-panel border border-ig-line bg-ig-hull p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold text-ig-muted uppercase tracking-wider">About</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ig-frost lg:text-4xl">Making complex scientific research easier to understand and apply.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ig-muted">Ignis Labs develops scientific intelligence software that helps researchers, engineers and organizations explore complex experimental research, identify meaningful relationships and generate evidence-grounded insights.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ig-frost">Our story</h2>
        <p className="mt-3 text-sm leading-6 text-ig-muted">Ignis Labs began through the NASA Space Apps Challenge 2026 - "Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data." The initial focus on microgravity combustion research inspired the broader vision of scientific intelligence software that helps teams explore, analyze and interpret research across aerospace and engineering domains.</p>
        <p className="mt-3 text-sm text-ig-amber">Participation in NASA Space Apps does not imply NASA endorsement.</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ig-frost">Our vision</h2>
        <p className="mt-3 text-sm leading-6 text-ig-muted">Our first product, Ignis, focuses on NASA microgravity combustion research and its relevance to fire safety in space exploration. Our long-term ambition is to expand scientific intelligence software into additional aerospace and engineering research applications.</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ig-frost">Leadership & team</h2>
        <p className="mt-3 text-[10px] text-ig-muted">Organizational role placeholders - not claims that these positions are filled. Replace with real names, photos and biographies as the team grows.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{leadership.map((person) => (
          <Card key={person.id} bordered padding="md" className="flex flex-col items-center text-center">
            <CardContent>
              <div className="w-16 h-16 rounded-full border border-ig-line bg-ig-raised flex items-center justify-center mx-auto mb-4 text-sm text-ig-muted">? </div>
              <p className="text-sm font-semibold text-ig-frost">{person.label}</p>
              <p className="mt-1 text-[10px] text-ig-muted">{person.role}</p>
              <p className="mt-3 text-xs text-ig-muted">{person.desc}</p>
              <div className="mt-3 pt-3 border-t border-ig-line text-[10px] text-ig-amber">Placeholder - role not filled</div>
            </CardContent>
          </Card>
        ))}</div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ig-frost">Future direction</h2>
        <p className="mt-3 text-sm leading-6 text-ig-muted">Ignis Labs plans to expand scientific intelligence software into additional aerospace and engineering research domains beyond microgravity combustion. The platform architecture is designed to support new datasets, research domains and analytical tools as the team grows.</p>
      </section>
    </div>
  );
}
