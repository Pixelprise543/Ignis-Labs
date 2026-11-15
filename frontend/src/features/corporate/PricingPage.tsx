import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const TIERS = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Available functionality only.',
    cta: 'Launch Platform',
    ctaLink: '/app',
    ctaVariant: 'primary',
    available: true,
    comingSoon: false,
    features: [
      { label: 'Experiment search and filtering', available: true },
      { label: 'Experiment detail pages', available: true },
      { label: 'Weighted rankings', available: true },
      { label: 'Side-by-side comparison (up to 3)', available: true },
      { label: 'AI-grounded insights (Ask Ignis)', available: true },
      { label: 'Mission safety brief exports', available: true },
      { label: 'Scenario controls (ISS, Lunar, Martian, EVA)', available: true },
      { label: 'Custom scenario parameters', available: true },
    ],
  },
  {
    name: 'Research Pro',
    price: 'Coming Soon',
    description: 'Potential future advanced workflows.',
    cta: 'Coming Soon',
    ctaLink: '#',
    ctaVariant: 'disabled',
    available: false,
    comingSoon: true,
    features: [
      { label: 'All Explorer features', available: true },
      { label: 'Unlimited experiment comparisons', available: false },
      { label: 'Custom ranking weight presets', available: false },
      { label: 'Prioritized insight generation', available: false },
      { label: 'Team workspace sharing', available: false },
      { label: 'Export to PDF and citation managers', available: false },
      { label: 'Research project organization', available: false },
      { label: 'API access for research pipelines', available: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Future Availability',
    description: 'Potential custom research integrations and organizational capabilities.',
    cta: 'Contact us',
    ctaLink: '/about',
    ctaVariant: 'outline',
    available: false,
    comingSoon: false,
    features: [
      { label: 'All Research Pro features', available: false },
      { label: 'Custom experiment corpus ingestion', available: false },
      { label: 'Organization-level access controls', available: false },
      { label: 'Dedicated research support', available: false },
      { label: 'On-premises deployment options', available: false },
      { label: 'Custom scenario model development', available: false },
      { label: 'Service-level agreements', available: false },
      { label: 'Compliance and audit reporting', available: false },
    ],
  },
]

export function PricingPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-lg border border-ember-500/20 bg-ember-500/5 px-3 py-1 text-xs font-semibold text-ember-300 uppercase tracking-wider">
              Pricing
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mt-4">
              Transparent research pricing
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mt-6">
              Ignis Labs offers research access tiers for the Ignis platform. No fake payment
              infrastructure — just clear availability and honest timelines.
            </p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="px-4 py-16 lg:px-6 lg:py-24 bg-void-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 flex flex-col ${
                  tier.name === 'Research Pro'
                    ? 'border-ember-500/30 bg-ember-500/5'
                    : 'border-void-700 bg-void-950'
                } ${tier.comingSoon ? 'relative' : ''}`}
              >
                {tier.comingSoon && (
                  <span className="absolute top-4 left-4 z-10 rounded-md bg-ember-500/10 px-2 py-0.5 text-[10px] font-semibold text-ember-300 uppercase tracking-wider">
                    Coming soon
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-sm text-slate-500">/mo</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                    {tier.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                      <span
                        className={`shrink-0 mt-0.5 ${
                          feature.available ? 'text-ember-400' : 'text-slate-600'
                        }`}
                      >
                        {feature.available ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2A1 1 0 009.555 7.168z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className={`${feature.available ? 'text-slate-300' : 'text-slate-500'}`}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (tier.ctaLink !== '#') navigate(tier.ctaLink)
                  }}
                  disabled={tier.ctaVariant === 'disabled'}
                  className={`w-full py-3 rounded-md text-sm font-semibold transition-colors ${
                    tier.ctaVariant === 'primary'
                      ? 'bg-ember-500 text-white hover:bg-ember-400'
                      : tier.ctaVariant === 'disabled'
                        ? 'bg-void-800 text-slate-500 border border-void-700 cursor-not-allowed'
                        : 'border border-void-700 bg-void-900 text-slate-200 hover:border-ember-500/50 hover:text-ember-300'
                  }`}
                >
                  {tier.cta}
                </button>
                {tier.comingSoon && (
                  <p className="mt-4 text-[10px] text-slate-500 text-center">
                    Advanced workflows planned for future release.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-void-700">
              <thead>
                <tr className="border-b border-void-700">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Feature</th>
                  {TIERS.map((tier) => (
                    <th key={tier.name} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-void-700">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS[0].features.map((feature, i) => {
                  const rowLabel = feature.label
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (s) => s.toUpperCase())
                  return (
                    <tr key={i} className="border-b border-void-700">
                      <td className="px-4 py-3 text-sm text-slate-300 font-medium">{rowLabel}</td>
                      {TIERS.map((tier) => {
                        const availability = tier.features[i].available
                        return (
                          <td
                            key={tier.name}
                            className="px-4 py-3 border-l border-void-700 text-center"
                          >
                            {availability ? (
                              <span className="inline-flex items-center gap-1 text-xs">
                                <svg className="w-3 h-3 text-ember-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Available now
                              </span>
                            ) : tier.comingSoon ? (
                              <span className="inline-flex items-center gap-1 text-xs text-ember-400">
                                Coming soon
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                Not available
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs text-slate-500 text-center">
            Availability reflects current and planned capabilities. Pricing and tier
            structure are subject to change. No payment infrastructure is available at
            this time — Explorer access is free.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-ember-500/20 bg-ember-500/5 p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Start researching today
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Explorer access is free. Launch the Ignis platform and begin exploring
              microgravity combustion research immediately.
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
