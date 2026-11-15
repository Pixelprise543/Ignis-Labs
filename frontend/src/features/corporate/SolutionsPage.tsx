import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Rocket, Microscope, ShieldCheck, Layers } from 'lucide-react'

const SOLUTIONS = [
  {
    area: 'Aerospace Research',
    icon: Rocket,
    problem: 'Combustion research for space environments is scattered across NASA technical reports, journal articles, and experimental datasets with no unified discovery layer.',
    capabilities: [
      'Search microgravity combustion experiments by platform, fuel material, and safety tag.',
      'Filter by gravity regime (ISS, drop tower, parabolic flight, sounding rocket, free-flyer).',
      'Trace every finding to its source record with verified citations.',
    ],
    value: 'Researchers spend less time hunting for evidence and more time applying it to spacecraft design.',
    link: '/app/research',
    linkLabel: 'Explore research',
  },
  {
    area: 'Spacecraft Fire Safety Research',
    icon: Flame,
    problem: 'Fire safety in spacecraft and habitats requires understanding material flammability under microgravity conditions — conditions that differ fundamentally from terrestrial fire behavior.',
    capabilities: [
      'Review flame-spread and extinction limits measured in microgravity.',
      'Compare suppression agent performance across experimental records.',
      'Model how cabin atmosphere (oxygen fraction, pressure, flow) affects flame behavior.',
    ],
    value: 'Fire safety engineers can base material selection and suppression design on microgravity-specific data, not terrestrial assumptions.',
    link: '/app/analysis?tab=rankings',
    linkLabel: 'View rankings',
  },
  {
    area: 'Academic Research',
    icon: Microscope,
    problem: 'Navigating scientific experiments and publications requires cross-referencing multiple sources, each with different formats and citation conventions.',
    capabilities: [
      'Access a curated corpus of microgravity combustion experiment records.',
      'Export cited Markdown briefs for papers and literature reviews.',
      'Validate claims against real experiment IDs with source URLs.',
    ],
    value: 'Academic researchers can build literature reviews and citations on verified experimental records.',
    link: '/app/insights',
    linkLabel: 'Ask Ignis',
  },
  {
    area: 'Engineering R&D',
    icon: ShieldCheck,
    problem: 'Engineering teams need to compare experimental findings and investigate uncertainty without becoming combustion domain experts.',
    capabilities: [
      'Rank experiments by weighted safety relevance with transparent score breakdowns.',
      'Compare up to three experiments side by side across all measured attributes.',
      'Read AI-generated summaries, rationale, and mission implications for each record.',
    ],
    value: 'Engineers get actionable safety insights that inform material selection, suppression design, and cabin atmosphere policy.',
    link: '/app/analysis?tab=compare',
    linkLabel: 'Compare experiments',
  },
  {
    area: 'Scientific Knowledge Management',
    icon: Layers,
    problem: 'Organizing complex research evidence across projects, teams, and missions requires a single source of truth.',
    capabilities: [
      'Centralize experiment records with consistent metadata and tagging.',
      'Generate mission safety briefs that export cited Markdown documentation.',
      'Maintain scenario context (ISS, Lunar, Martian, EVA, custom) across research sessions.',
    ],
    value: 'Teams maintain a persistent, citable knowledge base of combustion research for ongoing programs.',
    link: '/app',
    linkLabel: 'Open platform',
  },
]

export function SolutionsPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
              Solutions
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mt-4">
              Research solutions for every aerospace challenge
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mt-6">
              Ignis helps aerospace teams discover, analyze, and interpret microgravity combustion research.
              Choose your domain to see how the platform applies to your work.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="px-4 py-16 lg:px-6 lg:py-24 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {SOLUTIONS.map((solution) => (
              <div
                key={solution.area}
                className="rounded-xl border border-void-700 bg-void-950 p-8 hover:border-ember-500/50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-lg bg-ember-500/10 flex items-center justify-center mb-6 group-hover:bg-ember-500/20 transition-colors">
                  <solution.icon size={24} className="text-ember-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{solution.area}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{solution.problem}</p>
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Capabilities
                </h4>
                <ul className="space-y-2 mb-6">
                  {solution.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                      <span className="flex shrink-0 mt-1">
                        <svg className="w-3 h-3 text-ember-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {cap}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-white font-medium mb-6">
                  {solution.value}
                </p>
                <Link
                  to={solution.link}
                  className="inline-flex items-center gap-1 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-ember-500/50 hover:text-ember-300 transition-colors"
                >
                  {solution.linkLabel} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important notes */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-void-700 bg-void-900 p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-void-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-ember-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-white">What we do not claim</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Ignis Labs does not claim operational certification, validated safety predictions,
                  or endorsement by NASA or any space agency. All data is provided for research
                  purposes and should be verified against original sources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Find your research workflow
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Start with the platform that fits your domain, or explore all capabilities.
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
