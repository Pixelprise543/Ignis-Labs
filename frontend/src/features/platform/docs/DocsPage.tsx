import { Link } from 'react-router-dom'
import { Flame, BookOpen, Microscope, ShieldCheck } from 'lucide-react'

const DOC_SECTIONS = [
  {
    id: 'methodology',
    title: 'Methodology',
    icon: Flame,
    description: 'How experiment records are collected, enriched, and scored.',
    content: (
      <>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          The Ignis data pipeline follows a strict collect-clean-normalize-tag-validate
          process. Every record requires a real source_url for independent verification.
          Unknown numeric values are recorded as null — never guessed.
        </p>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Pipeline stages
        </h4>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2 mb-4">
          <li><strong>Collect:</strong> Download source material from NASA NTRS and other public sources.</li>
          <li><strong>Clean:</strong> Strip markup and normalize whitespace from source documents.</li>
          <li><strong>Normalize:</strong> Map records onto the CONTRACT.md schema with null for unknowns.</li>
          <li><strong>Tag:</strong> Assign safety tags from the allow-list using keyword rules.</li>
          <li><strong>Validate:</strong> Check every record against the JSON schema.</li>
          <li><strong>Build:</strong> Output experiments.json for the backend to serve.</li>
        </ol>
        <p className="text-sm text-slate-300 leading-relaxed">
          The pipeline output is committed so the backend can run without rebuilding.
          Until real records are curated, the backend falls back to synthetic mock data
          (IDs starting with <code className="font-mono text-ember-400">mock-</code>, URLs on
          <code className="font-mono text-ember-400">example.invalid</code>).
        </p>
      </>
    ),
  },
  {
    id: 'scoring',
    title: 'Scoring & Rankings',
    icon: ShieldCheck,
    description: 'How the weighted safety relevance score is calculated.',
    content: (
      <>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Every experiment receives a safety relevance score (0–100) and a transparent
          score breakdown. The weighted score formula is:
        </p>
        <p className="text-sm font-mono text-ember-400 bg-white/5 p-3 rounded-lg mb-4">
          Score = 100 × (relevance × w₁ + confidence × w₂ + recency × w₃)
        </p>
        <ul className="space-y-3 text-sm text-slate-300">
          <li>
            <strong>Relevance:</strong> Safety relevance score (0–100) based on safety tags,
            atmospheric data completeness, and oxygen-enriched conditions.
          </li>
          <li>
            <strong>Confidence:</strong> Data completeness across year, atmosphere fields,
            key findings, abstract, and source URL.
          </li>
          <li>
            <strong>Recency:</strong> Publication year normalized against a 30-year span.
          </li>
        </ul>
        <p className="text-sm text-slate-300 leading-relaxed mt-4">
          Default weights are relevance 0.5, confidence 0.3, recency 0.2. Weights are
          user-adjustable in the Analysis Workspace, and the score breakdown is shown for
          every ranked experiment.
        </p>
      </>
    ),
  },
  {
    id: 'limitations',
    title: 'Scientific Limitations',
    icon: Microscope,
    description: 'What the platform does and does not do.',
    content: (
      <>
        <ul className="space-y-4 text-sm text-slate-300">
          <li>
            <strong>Mock data for development:</strong> Until real records are curated,
            the platform uses synthetic mock records (IDs starting with
            <code className="font-mono text-ember-400">mock-</code>). These are not real
            research and must never be presented as such.
          </li>
          <li>
            <strong>No real-time data:</strong> The platform does not stream live
            experiment data. Records are added through the data pipeline and require
            manual curation.
          </li>
          <li>
            <strong>Research tool, not certified safety system:</strong> Ignis is
            research intelligence software, not a certified safety system. Findings
            should be verified against original sources before operational use.
          </li>
          <li>
            <strong>No NASA endorsement:</strong> Ignis Labs is not affiliated with,
            endorsed by, or funded by NASA or any space agency. All references to NASA
            research are for educational and research purposes.
          </li>
          <li>
            <strong>No invented data:</strong> Unknown values are recorded as null,
            never guessed. AI-generated summaries and insights are grounded in selected
            experiment records with validated citations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'glossary',
    title: 'Glossary',
    icon: BookOpen,
    description: 'Key terms used across the Ignis platform.',
    content: (
      <>
        <table className="w-full text-left border-collapse border border-white/10">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Term
              </th>
              <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Definition
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {[
              { term: 'Microgravity combustion', def: 'Combustion processes occurring in low-gravity environments where buoyant flow is absent or greatly reduced.' },
              { term: 'Flame spread', def: 'The rate at which a flame propagates across a fuel surface.' },
              { term: 'Extinction limit', def: 'The condition under which a flame can no longer sustain itself and self-extinguishes.' },
              { term: 'Smoldering', def: 'Flameless combustion that propagates through a porous solid fuel.' },
              { term: 'Suppression', def: 'The act of extinguishing a fire using an agent such as CO₂, water mist, or inert gas.' },
              { term: 'Safety relevance score', def: 'A 0–100 score indicating how directly an experiment constrains cabin fire safety for human spaceflight.' },
              { term: 'Enriched experiment', def: 'An experiment record augmented with AI summary, safety relevance score, rationale, and mission implications.' },
              { term: 'Citation', def: 'A reference to a specific experiment record ID, validated against the actual corpus.' },
            ].map((item) => (
              <tr key={item.term} className="hover:bg-white/5 transition-colors">
                <td className="p-3 text-sm font-semibold text-slate-200 font-mono">{item.term}</td>
                <td className="p-3 text-sm text-slate-300">{item.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'references',
    title: 'Research References',
    icon: BookOpen,
    description: 'Source material and data provenance.',
    content: (
      <>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          All experiment records in the Ignis platform trace to source URLs for
          independent verification. Preferred publishers include NASA NTRS,
          NASA Glenn Research Center combustion pages, and NASA ISS experiment pages.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Synthetic mock records used for development use the reserved
          <code className="font-mono text-ember-400">example.invalid</code> domain and
          are prefixed with <code className="font-mono text-ember-400">[MOCK]</code>.
          They must never be mistaken for real research.
        </p>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Data sources
          </p>
          <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
            <li>NASA NTRS (ntrs.nasa.gov)</li>
            <li>NASA Glenn Research Center combustion pages</li>
            <li>NASA ISS experiment pages (nasa.gov)</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Do not cite aggregators, blogs, or generated text as sources.
        </p>
      </>
    ),
  },
]

export function DocsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Documentation</h1>
          <p className="text-sm text-slate-400">
            Methodology, glossary, scientific limitations, and research references for
            the Ignis platform.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sidebar navigation */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 sticky top-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Contents
            </h3>
            <nav className="space-y-2">
              {DOC_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  to={`#${section.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-6">
          {DOC_SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-ember-500/10 flex items-center justify-center">
                  <section.icon size={24} className="text-ember-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{section.title}</h2>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>
              <div className="prose prose-sm text-slate-300 max-w-none">
                {section.content}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              About the data
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ignis Labs is not affiliated with, endorsed by, or funded by NASA or any space
              agency. All references to NASA research are for educational and research
              purposes and should be verified against original sources.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              Synthetic mock records (IDs starting with
              <code className="font-mono text-ember-400">mock-</code>) are used for
              development only and must never be presented as real research.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
