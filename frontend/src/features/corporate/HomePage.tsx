import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Flame, Microscope, BarChart3, Layers, ShieldCheck, Play } from 'lucide-react'

export function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-ember-400" />
                Ignis Labs
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Scientific intelligence for the <span className="text-ember-400">next frontier.</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-lg">
                Ignis Labs develops intelligent research software that transforms complex scientific evidence into
                accessible insights for aerospace research and engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember-500 px-6 py-3 text-sm font-semibold text-white hover:bg-ember-400 transition-colors"
                >
                  Launch Ignis <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  to="/product"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-void-700 bg-void-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-ember-500/50 hover:text-ember-300 transition-colors"
                >
                  Explore the Platform
                </Link>
              </div>
            </div>

            <div className="relative group">
              {/* Product preview panel */}
              <div className="relative rounded-xl border border-void-700 bg-void-900 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-ember-500/5 group-hover:bg-ember-500/10 transition-colors" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-lg border border-void-600 bg-void-800" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-3/4 rounded bg-void-700" />
                      <div className="h-2 w-1/2 rounded bg-void-700" />
                    </div>
                    <span className="text-xs font-mono text-slate-500">ignis.io/app</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border border-void-600 bg-void-800" />
                      <div className="flex-1">
                        <div className="h-3 w-3/4 rounded bg-void-700 mb-2" />
                        <div className="h-2 w-full rounded bg-void-700" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border border-void-600 bg-void-800" />
                      <div className="flex-1">
                        <div className="h-3 w-2/3 rounded bg-void-700 mb-2" />
                        <div className="h-2 w-2/4 rounded bg-void-700" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-void-950 to-transparent">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Flame size={14} className="text-ember-400" aria-hidden="true" />
                    <span>Real application preview — microgravity combustion research platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Research is complex. Understanding it shouldn&rsquo;t be.
            </h2>
            <p className="text-lg text-slate-400">
              Scientific research is fragmented across thousands of papers, datasets, and platforms. Researchers
              spend more time finding and validating evidence than applying it. Ignis Labs closes that gap with
              research intelligence software built for aerospace and engineering teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-ember-500/10 flex items-center justify-center mb-4">
                <Flame size={20} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fragmented evidence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Combustion research is scattered across NASA reports, journals, and datasets with no single source
                of truth.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-ember-500/10 flex items-center justify-center mb-4">
                <Microscope size={20} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Validation burden</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every claim must be traced to its source. Manual citation checking slows research to a crawl.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-ember-500/10 flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No scenario context</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Findings don&rsquo;t account for mission-specific conditions like cabin atmosphere or gravity regime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">From data to understanding.</h2>
            <p className="text-lg text-slate-400">
              Ignis turns raw experimental records into evidence-linked insights you can trust and act on.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-xl border border-void-700 bg-void-900 hover:border-ember-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-void-800 flex items-center justify-center mb-6">
                <Layers size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Discover</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Search and filter microgravity combustion experiments by platform, fuel, safety tag, and relevance.
              </p>
              <Link
                to="/solutions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ember-400 hover:text-ember-300"
              >
                Explore <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="p-8 rounded-xl border border-void-700 bg-void-900 hover:border-ember-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-void-800 flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Analyze</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Rank experiments by weighted safety relevance, compare up to three side by side, and model scenario
                conditions.
              </p>
              <Link
                to="/product"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ember-400 hover:text-ember-300"
              >
                Explore <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="p-8 rounded-xl border border-void-700 bg-void-900 hover:border-ember-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-void-800 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Interpret</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Ask research questions grounded in selected experiments. Every answer cites only verified record IDs.
              </p>
              <Link
                to="/technology"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ember-400 hover:text-ember-300"
              >
                Explore <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ignis: The research platform</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Ignis is a research intelligence platform for microgravity combustion science. It combines experiment
                discovery, weighted ranking, side-by-side comparison, and AI-grounded insight generation into a
                single workspace for aerospace researchers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center shrink-0">
                    <Play size={18} className="text-ember-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Experiment search</h4>
                    <p className="text-sm text-slate-400">Filter 8+ microgravity combustion records by platform, material, and safety tag.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center shrink-0">
                    <Play size={18} className="text-ember-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">AI research assistant</h4>
                    <p className="text-sm text-slate-400">Ask questions about selected experiments. Every answer cites verified record IDs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center shrink-0">
                    <Play size={18} className="text-ember-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Experiment comparison</h4>
                    <p className="text-sm text-slate-400">Compare up to three experiments side by side across all attributes.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl border border-void-700 bg-void-950 p-6">
                <div className="flex items-center gap-3 mb-4 text-xs font-mono text-slate-500">
                  <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                  <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                  <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-void-800" />
                  <div className="h-3 w-full rounded bg-void-800" />
                  <div className="h-4 w-2/3 rounded bg-void-800" />
                  <div className="h-3 w-1/2 rounded bg-void-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-lg text-slate-400">
              A simple workflow from discovery to understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-ember-500/10 flex items-center justify-center mx-auto mb-4">
                <Flame size={24} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Explore</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Search scientific evidence across microgravity combustion experiments with filters for platform,
                material, and safety focus.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-ember-500/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={24} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Analyze</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rank by weighted safety relevance, compare experiments side by side, and model scenario conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-ember-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-ember-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Understand</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate evidence-linked answers with citations to verified experiment records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Explore the next generation of research intelligence.
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Start with microgravity combustion research. Expand to any scientific domain.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember-500 px-8 py-4 text-sm font-semibold text-white hover:bg-ember-400 transition-colors"
            >
              Launch Ignis <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
