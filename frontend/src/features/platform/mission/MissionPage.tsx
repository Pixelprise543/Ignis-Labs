import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Copy } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../../api/mock/experiments.mock'
import { formatAtmosphere } from '../../../lib/format'
import { ScenarioControls } from '../../../app/ScenarioControls'
import { SeverityBadge } from '../shared/SeverityBadge'

const PLAYBOOKS = [
  {
    id: 'cabin-fire-response',
    title: 'Cabin Fire Response',
    scenario: 'ISS',
    description: 'Immediate actions for a fire event in a pressurized crewed module.',
    steps: [
      'Confirm fire location and severity using available sensors.',
      'Isolate affected module if possible without endangering crew.',
      'Deploy portable fire extinguisher aimed at base of flames.',
      'Monitor O₂ and CO₂ levels post-suppression.',
      'Initiate emergency return procedures if fire cannot be controlled.',
    ],
    relevantTags: ['suppression', 'extinction', 'flammability'],
  },
  {
    id: 'material-screening',
    title: 'Cabin Material Screening',
    scenario: 'All',
    description: 'Evaluate candidate cabin materials for microgravity flammability risk.',
    steps: [
      'Compile candidate material list with technical data sheets.',
      'Compare against microgravity flammability experiment records.',
      'Flag materials with safety_relevance_score ≥ 85 for review.',
      'Conduct microgravity-specific screening for borderline materials.',
      'Document material selection rationale with cited experiment IDs.',
    ],
    relevantTags: ['material-selection', 'flammability', 'extinction'],
  },
  {
    id: 'atmosphere-monitoring',
    title: 'Cabin Atmosphere Monitoring',
    scenario: 'EVA',
    description: 'Oxygen fraction and pressure monitoring protocols for EVA operations.',
    steps: [
      'Verify O₂ fraction within suit operating limits (100% O₂ at 29.6 kPa).',
      'Monitor pressure differential between suit and cabin.',
      'Review flame-spread data for high-O₂ environments.',
      'Ensure suppression agents are compatible with high-O₂ conditions.',
    ],
    relevantTags: ['cabin-atmosphere', 'flammability', 'suppression'],
  },
]

export function MissionPage() {
  const [searchParams] = useSearchParams()
  const scenario = searchParams.get('scenario') || 'ISS'

  const SCENARIO_LABELS: Record<string, string> = {
    ISS: 'International Space Station',
    Lunar: 'Lunar Gateway / Surface',
    Martian: 'Mars Transit / Surface',
    EVA: 'Extravehicular Activity',
    Custom: 'Custom parameters',
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Mission Intelligence</h1>
          <p className="text-sm text-slate-400">
            Safety playbooks, mission briefs, and scenario summaries for aerospace research.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors"
        >
          <ArrowRight size={14} className="-mr-1" aria-hidden="true" />
          Return to website
        </Link>
      </div>

      {/* Scenario selector */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Active scenario
        </h3>
        <ScenarioControls onChange={() => {}} />
        <p className="mt-3 text-[10px] text-slate-500">
          {SCENARIO_LABELS[scenario] || scenario} &middot;
          {formatAtmosphere({ o2_percent: 21, pressure_kpa: 101.3, flow_cm_s: 5 })}
        </p>
      </div>

      {/* Safety playbooks */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Safety playbooks
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {PLAYBOOKS.length} protocols
          </span>
        </div>
        <div className="space-y-3">
          {PLAYBOOKS.map((playbook) => (
            <div
              key={playbook.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-ember-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{playbook.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {playbook.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {playbook.scenario}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {playbook.relevantTags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1">
                {playbook.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 text-[10px] text-slate-500 italic">
                This playbook is based on experiment data from the Ignis platform.
                It is not a certified safety procedure — verify against operational
                documentation before use.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission brief generator */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Mission brief generator
          </h3>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-colors"
          >
            <Copy size={14} aria-hidden="true" />
            Print brief
          </button>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Scenario: {SCENARIO_LABELS[scenario] || scenario}
          </p>
          <p className="text-sm text-slate-200 leading-relaxed mb-4">
            This brief summarizes ignition-relevant research for the selected scenario.
            It draws on {MOCK_EXPERIMENTS.length} experiment records from the Ignis platform.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 text-ember-400">1.</span>
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Review <strong>{MOCK_EXPERIMENTS.length}</strong> microgravity combustion
                  experiment records relevant to {SCENARIO_LABELS[scenario] || scenario.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 text-ember-400">2.</span>
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Identify materials with safety_relevance_score ≥ 85 for priority screening.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 text-ember-400">3.</span>
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Validate suppression agent effectiveness against microgravity-specific
                              extinction limits.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] text-slate-500">
              Generated from Ignis platform data. Not a certified mission safety procedure.
              Always verify against original sources and operational documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario-relevant experiments */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Relevant experiments
          </h3>
          <Link
            to="/app/research"
            className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
          >
            Explore all <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_EXPERIMENTS.slice(0, 6).map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-ember-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                  to={`/app/research/experiments/${record.id}`}
                  className="text-sm font-semibold text-slate-200 hover:text-ember-300 line-clamp-1"
                >
                  {record.title}
                </Link>
                <SeverityBadge
                  severity={
                    record.safety_relevance_score >= 85 ? 'critical' :
                    record.safety_relevance_score >= 70 ? 'high' :
                    record.safety_relevance_score >= 55 ? 'caution' : 'info'
                  }
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                {record.ai_summary}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="font-mono">{record.platform}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-300">{formatAtmosphere(record.atmosphere)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
