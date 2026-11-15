import { Link } from 'react-router-dom'
import { ArrowRight, Search, Microscope, BarChart3, Layers, Sparkles, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    category: 'Research discovery',
    icon: Search,
    problem: 'Scientific evidence is scattered across thousands of NASA reports, journal articles, and datasets with no unified search interface.',
    capability: 'Search and filter microgravity combustion experiments by platform, fuel material, safety tag, year, and relevance score. Full-text search across titles, abstracts, and key findings.',
    value: 'Researchers find relevant experiments in minutes instead of hours, with every result traceable to its source.',
    link: '/app/research',
    linkLabel: 'Explore experiments',
  },
  {
    category: 'Scientific analysis',
    icon: BarChart3,
    problem: 'Comparing experimental results requires manual data extraction and normalization across inconsistent formats.',
    capability: 'Weighted scoring model ranks experiments by relevance, confidence, and recency. Side-by-side comparison of up to three experiments across all attributes.',
    value: 'Objective, reproducible analysis with transparent score breakdowns — no black-box algorithms.',
    link: '/app/analysis?tab=rankings',
    linkLabel: 'View rankings',
  },
  {
    category: 'AI research intelligence',
    icon: Sparkles,
    problem: 'Synthesizing findings across multiple experiments is time-consuming and prone to citation errors.',
    capability: 'Ask research questions about selected experiments. Every answer cites only verified experiment record IDs. Citations are validated against the actual corpus.',
    value: 'Evidence-grounded answers with verifiable citations. No hallucinated references.',
    link: '/app/insights',
    linkLabel: 'Ask Ignis',
  },
  {
    category: 'Scenario exploration',
    icon: Microscope,
    problem: 'Research findings don&rsquo;t account for mission-specific conditions like cabin atmosphere, oxygen fraction, or pressure.',
    capability: 'Scenario controls let researchers model conditions (ISS, Lunar, Martian, EVA, custom) and see how experiment findings apply to their specific context.',
    value: 'Research insights are contextualized for actual mission parameters, not generic assumptions.',
    link: '/app',
    linkLabel: 'Open platform',
  },
  {
    category: 'Engineering decision support',
    icon: ShieldCheck,
    problem: 'Engineers need to understand material flammability and suppression requirements without becoming combustion experts.',
    capability: 'Each experiment includes AI summaries, safety rationale, and mission implications written for fire-safety analysts.',
    value: 'Actionable safety insights that inform material selection, suppression design, and cabin atmosphere policy.',
    link: '/app/research',
    linkLabel: 'Browse experiments',
  },
  {
    category: 'Research reporting',
    icon: Layers,
    problem: 'Exporting research findings into reports requires manual copying and formatting.',
    capability: 'Mission safety briefs export cited Markdown documentation for crew or reviewer distribution.',
    value: 'Citation-ready reports that reference real experiment records with source URLs.',
    link: '/app/mission',
    linkLabel: 'Export briefs',
  },
]

export function ProductPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
              Product
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mt-4">
              Ignis: Research intelligence for aerospace
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mt-6">
              A platform for discovering, analyzing, and interpreting microgravity combustion research. Built for
              researchers, engineers, and safety analysts who need evidence-backed answers.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 py-16 lg:px-6 lg:py-24 bg-void-900">
        <div className="max-w-7xl mx-auto">
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.category}
              className={`grid md:grid-cols-12 gap-12 items-center py-12 border-b border-void-800 ${idx % 2 === 0 ? '' : ''}`}
            >
              <div className="md:col-span-4 flex flex-col justify-center">
                <div className="h-14 w-14 rounded-xl bg-ember-500/10 flex items-center justify-center mb-6">
                  <feature.icon size={28} className="text-ember-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.category}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-ember-400 text-sm uppercase tracking-wider mb-1">The problem</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-300 text-sm uppercase tracking-wider mb-1">Product capability</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.capability}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm uppercase tracking-wider mb-1">Practical value</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.value}</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 mt-8 md:mt-0">
                <div className="rounded-xl border border-void-700 bg-void-950 p-6">
                  <div className="flex items-center gap-3 mb-4 text-xs font-mono text-slate-500">
                    <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-void-800" />
                    <div className="h-3 w-4/5 rounded bg-void-800" />
                    <div className="h-4 w-2/3 rounded bg-void-800" />
                    <div className="h-3 w-1/2 rounded bg-void-800" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 mt-8 md:mt-0 flex flex-col justify-center">
                <Link
                  to={feature.link}
                  className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-ember-500/50 hover:text-ember-300 hover:bg-ember-500/5 transition-colors"
                >
                  {feature.linkLabel} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How capabilities work together */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Capabilities that work together</h2>
            <p className="text-lg text-slate-400">
              Ignis isn&rsquo;t a collection of isolated tools. Each capability feeds into the next, creating a
              continuous research workflow.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-0.5 border-dashed border-void-700" />
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[0, 1, 2].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-10 w-10 rounded-full bg-ember-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <span className="text-white font-bold">{i + 1}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">
                    {i === 0 ? 'Discover' : i === 1 ? 'Analyze' : 'Interpret'}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {i === 0 ? 'Find relevant experiments with full-text search and filters.' : i === 1 ? 'Rank and compare experiments with weighted scoring.' : 'Generate evidence-linked insights with verified citations.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to start researching?
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              The Ignis platform is available for microgravity combustion research today.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember-500 px-8 py-4 text-sm font-semibold text-white hover:bg-ember-400 transition-colors"
            >
              Launch Platform <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
