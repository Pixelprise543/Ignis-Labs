import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Microscope, Flame, ArrowRight } from 'lucide-react'
import { MOCK_EXPERIMENTS } from '../../../api/mock/experiments.mock'
import { formatAtmosphere } from '../../../lib/format'
import { ScenarioControls } from '../../../app/ScenarioControls'

export function SimulatorView() {
  const [searchParams] = useSearchParams()
  const scenario = searchParams.get('scenario') || 'ISS'
  const o2 = searchParams.get('o2')
  const pressure = searchParams.get('pressure')
  const flow = searchParams.get('flow')

  const experiments = useMemo(() => MOCK_EXPERIMENTS, [])

  // Simple risk model: weight experiments by how relevant they are to the current scenario
  const scenarioRelevance = useMemo(() => {
    const o2Val = o2 === null ? null : Number(o2)
    const pressureVal = pressure === null ? null : Number(pressure)

    return [...experiments].map((record) => {
      let relevance = record.safety_relevance_score
      const reasons: string[] = []

      // Adjust relevance based on scenario conditions
      if (o2Val !== null && record.atmosphere.o2_percent !== null) {
        const o2Diff = Math.abs(record.atmosphere.o2_percent - o2Val)
        if (o2Diff <= 5) {
          relevance += 10
          reasons.push('Similar O₂ fraction to scenario')
        }
      }
      if (pressureVal !== null && record.atmosphere.pressure_kpa !== null) {
        const pDiff = Math.abs(record.atmosphere.pressure_kpa - pressureVal)
        if (pDiff <= 20) {
          relevance += 5
          reasons.push('Similar pressure to scenario')
        }
      }

      return { record, relevance: Math.min(100, relevance), reasons }
    })
  }, [experiments, o2, pressure, flow])

  const topRelevant = useMemo(() => {
    return [...scenarioRelevance]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 6)
  }, [scenarioRelevance])

  const SCENARIO_LABELS: Record<string, string> = {
    ISS: 'International Space Station',
    Lunar: 'Lunar Gateway / Surface',
    Martian: 'Mars Transit / Surface',
    EVA: 'Extravehicular Activity',
    Custom: 'Custom parameters',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Risk simulator</h1>
          <p className="text-sm text-slate-400">
            Model how microgravity combustion research applies to your scenario conditions.
          </p>
        </div>
      </div>

      {/* Scenario controls */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Scenario parameters
          </h3>
          <Link
            to="/app/research"
            className="text-[10px] font-medium text-ember-400 hover:text-ember-300"
          >
            Change scenario <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <ScenarioControls onChange={() => {}} />
        <p className="mt-3 text-[10px] text-slate-500">
          {SCENARIO_LABELS[scenario] || scenario} &middot;
          {formatAtmosphere({
            o2_percent: o2 === null ? null : Number(o2),
            pressure_kpa: pressure === null ? null : Number(pressure),
            flow_cm_s: flow === null ? null : Number(flow),
          })}
        </p>
      </div>

      {/* Scenario-relevant experiments */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Microscope size={16} className="text-ember-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Scenario-relevant experiments
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Ranked by scenario fit
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRelevant.map(({ record, relevance, reasons }) => (
            <div
              key={record.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-ember-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                  to={`/app/research/experiments/${record.id}`}
                  className="text-sm font-semibold text-slate-200 hover:text-ember-300 line-clamp-1"
                >
                  {record.title}
                </Link>
                <span className="text-[10px] font-mono text-slate-500">
                  {record.id.replace('mock-', '')}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                {record.ai_summary}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3">
                <span className="font-mono">{record.platform}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono">{formatAtmosphere(record.atmosphere)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ember-400">
                  {relevance.toFixed(0)}/100 scenario fit
                </span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ember-500"
                    style={{ width: `${relevance}%` }}
                  />
                </div>
              </div>
              {reasons.length > 0 && (
                <p className="mt-2 text-[10px] text-slate-500 italic">
                  {reasons.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Simulation notes */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-ember-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Simulation notes
          </h3>
        </div>
        <ul className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <li>
            Scenario fit is estimated by matching experimental atmospheric conditions
            (O₂ fraction, pressure, flow) to your selected scenario parameters.
          </li>
          <li>
            This is a research tool, not a certified safety prediction. Results should be
            verified against original sources before operational use.
          </li>
          <li>
            The simulator does not model fire spread, suppression, or detection directly —
            it surfaces experiments relevant to your scenario for further review.
          </li>
        </ul>
      </div>
    </div>
  )
}
