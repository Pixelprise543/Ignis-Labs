import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Rocket, Microscope, Users, Building2 } from 'lucide-react'

// Centralized leadership configuration — placeholders only, no invented names/credentials
const LEADERSHIP = [
  {
    role: 'Chief Executive Officer (CEO)',
    name: '[TBD]',
    responsibilities: 'Overall company strategy, vision, and execution.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
  {
    role: 'Chief Technology Officer (CTO)',
    name: '[TBD]',
    responsibilities: 'Technology strategy, platform architecture, and engineering.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
  {
    role: 'Chief Scientific Officer (CSO)',
    name: '[TBD]',
    responsibilities: 'Scientific direction, research integrity, and data methodology.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
  {
    role: 'Chief Operating Officer (COO)',
    name: '[TBD]',
    responsibilities: 'Operations, research workflows, and program delivery.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
  {
    role: 'Chief Product Officer (CPO)',
    name: '[TBD]',
    responsibilities: 'Product strategy, user experience, and platform capabilities.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
  {
    role: 'Chief Business Officer (CBO)',
    name: '[TBD]',
    responsibilities: 'Business development, partnerships, and growth strategy.',
    bio: 'Placeholder — position not yet filled.',
    link: '#',
  },
]

export function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
              About
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mt-4">
              Behind Ignis Labs
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mt-6">
              Ignis Labs makes complex scientific research more accessible, interpretable, and useful.
              We build research intelligence software for aerospace and engineering teams.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Our mission</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Scientific research is powerful but hard to access. Evidence is scattered,
                validation is manual, and context is lost. Ignis Labs builds research
                intelligence software that transforms complex scientific evidence into
                accessible, actionable insights for aerospace and engineering teams.
              </p>
              <div className="pt-8">
                <Link
                  to="/product"
                  className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-ember-500/50 hover:text-ember-300 transition-colors"
                >
                  Explore the product <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-8">
              <div className="h-16 w-16 rounded-xl bg-ember-500/10 flex items-center justify-center mb-6">
                <Flame size={32} className="text-ember-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed text-center">
                &ldquo;Making complex scientific research easier to understand and apply.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Company story</h2>
          </div>

          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center">
                  <Rocket size={24} className="text-ember-400" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-white">NASA Space Apps Challenge 2026</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Ignis Labs originated from the NASA International Space Apps Challenge 2026,
                  &ldquo;Flame in Freefall&rdquo; — SI-Powered Fire Safety Insights from Microgravity
                  Combustion Data.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center">
                  <Microscope size={24} className="text-ember-400" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-white">Research focus</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The flagship platform focuses on NASA microgravity combustion research —
                  understanding how fire behaves in space environments to improve spacecraft
                  and habitat fire safety.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center">
                  <Building2 size={24} className="text-ember-400" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-white">Broader vision</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Beyond combustion, Ignis Labs aims to build scientific intelligence tools
                  for aerospace and engineering research across disciplines.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-void-700 bg-void-900 p-8">
              <p className="text-sm text-slate-400 leading-relaxed">
                Ignis Labs is not affiliated with, endorsed by, or funded by NASA or any space
                agency. All references to NASA research are for educational and research purposes
                and should be verified against original sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Vision</h2>
          </div>
          <div className="rounded-xl border border-void-700 bg-void-950 p-12 text-center">
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Build scientific intelligence tools that make research evidence accessible,
              interpretable, and useful — starting with aerospace, expanding to engineering
              and scientific research broadly.
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Research intelligence for the next frontier
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Leadership</h2>
            <p className="text-lg text-slate-400">
              All leadership positions are currently placeholders. No names, photographs, or
              credentials have been assigned.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {LEADERSHIP.map((person) => (
              <div
                key={person.role}
                className="rounded-xl border border-void-700 bg-void-950 p-6 flex flex-col"
              >
                <div className="h-14 w-14 rounded-full bg-void-800 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                  <Users size={20} className="text-slate-500" aria-hidden="true" />
                </div>
                <h4 className="text-sm font-semibold text-white text-center mb-1">
                  {person.name}
                </h4>
                <p className="text-xs text-ember-400 text-center font-medium mb-3">
                  {person.role}
                </p>
                <p className="text-xs text-slate-400 text-center leading-relaxed mb-4 flex-1">
                  {person.responsibilities}
                </p>
                <p className="text-[10px] text-slate-500 text-center italic mb-4">
                  {person.bio}
                </p>
                <a
                  href={person.link}
                  className="inline-block text-[10px] font-medium text-slate-400 hover:text-slate-200 uppercase tracking-wider"
                >
                  View profile
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-slate-500 text-center">
            Positions shown are role placeholders. No individuals have been appointed to these roles.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the next frontier
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Start exploring microgravity combustion research today.
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
