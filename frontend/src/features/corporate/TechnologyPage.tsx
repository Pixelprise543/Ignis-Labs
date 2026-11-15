import { Link } from 'react-router-dom'
import { ArrowRight, Microscope, BarChart3, Layers, Sparkles, ShieldCheck, Play } from 'lucide-react'

export function TechnologyPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
              Technology
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mt-4">
              Scientific methodology, built for research
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mt-6">
              Ignis Labs technology is grounded in real microgravity combustion research.
              Every claim traces to verified experiment records — no invented data, no black-box science.
            </p>
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Scientific data sources</h2>
            <p className="text-lg text-slate-400">
              All experiment records are sourced from documented microgravity combustion research.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <Microscope size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">NASA research</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Microgravity combustion experiment records from NASA-sponsored research, including ISS,
                drop tower, parabolic flight, sounding rocket, and free-flyer platforms.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <Layers size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Verified records</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every record includes a source URL for independent verification. Mock data (marked [MOCK])
                is used only for development and is clearly labeled.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">No invented data</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unknown values are recorded as null, never guessed. Data pipeline follows a strict
                collect-clean-normalize-tag-validate process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence-linked AI */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Evidence-linked AI</h2>
            <p className="text-lg text-slate-400">
              Ask Ignis generates answers grounded in selected experiments, with citations validated
              against the actual corpus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-6">
              <div className="rounded-xl border border-void-700 bg-void-900 p-6">
                <h4 className="font-semibold text-white mb-2">Citation validation</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Every citation in an AI-generated answer is checked against the IDs of selected
                  experiments. Unknown IDs are never cited.
                </p>
              </div>
              <div className="rounded-xl border border-void-700 bg-void-900 p-6">
                <h4 className="font-semibold text-white mb-2">Deterministic fallback</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  When no LLM is configured, insights are synthesized by reordering and quoting
                  selected records — never invented.
                </p>
              </div>
              <div className="rounded-xl border border-void-700 bg-void-900 p-6">
                <h4 className="font-semibold text-white mb-2">Scenario context</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Platform scenario controls (ISS, Lunar, Martian, EVA, custom) let researchers
                  model mission-specific atmospheric conditions.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-8">
              <div className="flex items-center gap-3 mb-4 text-xs font-mono text-slate-500">
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-700" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-void-800" />
                <div className="h-3 w-4/5 rounded bg-void-800" />
                <div className="h-4 w-2/3 rounded bg-void-800" />
                <div className="h-3 w-1/2 rounded bg-void-800" />
              </div>
              <div className="mt-4 text-xs text-slate-500 font-mono">
                <code className="block whitespace-pre break-all text-slate-400">
                  POST /api/insights{'  '}
                  &#123;experiment_ids: ['mock-flame-spread-pmma'], question: '...'&#125;{'  '}
                  &#123;insight: '...', citations: ['mock-flame-spread-pmma']&#125;
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings methodology */}
      <section className="px-4 py-16 lg:px-6 lg:py-20 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Rankings and methodology</h2>
            <p className="text-lg text-slate-400">
              Transparent weighted scoring with no black-box algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Relevance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Safety relevance score (0–100) based on tags, atmospheric data completeness, and
                oxygen-enriched conditions.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <Play size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Confidence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Data completeness across year, atmosphere fields, key findings, abstract, and source URL.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <div className="h-10 w-10 rounded-lg bg-void-800 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-slate-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Recency</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Publication year normalized against a 30-year span. Recent research scores higher.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-void-700 bg-void-900 p-6">
            <p className="text-sm text-slate-400">
              Weights are user-adjustable (default: relevance 0.5, confidence 0.3, recency 0.2).
              The score breakdown is shown for every ranked experiment so the math is always visible.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Known limitations</h2>
            <p className="text-lg text-slate-400">
              We are transparent about what the platform does and does not do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <h4 className="font-semibold text-ember-400 mb-2">Mock data</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Development uses synthetic mock records (IDs starting with `mock-`, URLs on
                `example.invalid`). These are not real research.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <h4 className="font-semibold text-ember-400 mb-2">No real-time data</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                The platform does not stream live experiment data. Records are added through the
                data pipeline and require manual curation.
              </p>
            </div>
            <div className="rounded-xl border border-void-700 bg-void-950 p-6">
              <h4 className="font-semibold text-ember-400 mb-2">Research tool only</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ignis is research intelligence software, not a certified safety system. Findings
                should be verified against original sources before operational use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Explore the platform
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              See the technology in action with real experiment data.
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
