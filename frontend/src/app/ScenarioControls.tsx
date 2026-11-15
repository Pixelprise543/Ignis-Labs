import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Atmosphere } from '../api/types'
import { formatAtmosphere } from '../lib/format'

export type ScenarioId = 'ISS' | 'Lunar' | 'Martian' | 'EVA' | 'Custom'

/**
 * Ground scenario parameters in the existing Atmosphere model (O2%, pressure, flow).
 * Values are representative baselines for each mission scenario.
 */
const SCENARIO_PRESETS: Record<ScenarioId, Atmosphere> = {
  ISS: { o2_percent: 21, pressure_kpa: 101.3, flow_cm_s: 5 },
  Lunar: { o2_percent: 21, pressure_kpa: 70.3, flow_cm_s: 3 },
  Martian: { o2_percent: 21, pressure_kpa: 10.2, flow_cm_s: 2 },
  EVA: { o2_percent: 100, pressure_kpa: 29.6, flow_cm_s: 1 },
  Custom: { o2_percent: null, pressure_kpa: null, flow_cm_s: null },
}

const SCENARIO_LABELS: Record<ScenarioId, string> = {
  ISS: 'ISS',
  Lunar: 'Lunar',
  Martian: 'Martian',
  EVA: 'EVA',
  Custom: 'Custom',
}

const URL_PARAMS = {
  scenario: 'scenario',
  o2: 'o2',
  pressure: 'pressure',
  flow: 'flow',
} as const

interface ScenarioControlsProps {
  atmosphere?: Atmosphere
  onChange?: (atmosphere: Atmosphere) => void
}

export function ScenarioControls({
  atmosphere: initialAtmosphere,
  onChange,
}: ScenarioControlsProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [active, setActive] = useState<ScenarioId>('ISS')
  const [custom, setCustom] = useState<Atmosphere>(() =>
    initialAtmosphere ?? { o2_percent: null, pressure_kpa: null, flow_cm_s: null }
  )

  // Hydrate active scenario and custom values from URL search params on mount.
  useEffect(() => {
    const urlScenario = (searchParams.get(URL_PARAMS.scenario) || 'ISS') as ScenarioId
    if (Object.prototype.hasOwnProperty.call(SCENARIO_PRESETS, urlScenario)) {
      setActive(urlScenario)
    }

    const o2 = searchParams.get(URL_PARAMS.o2)
    const pressure = searchParams.get(URL_PARAMS.pressure)
    const flow = searchParams.get(URL_PARAMS.flow)
    if (o2 !== null || pressure !== null || flow !== null) {
      setCustom({
        o2_percent: o2 === null ? null : Number(o2),
        pressure_kpa: pressure === null ? null : Number(pressure),
        flow_cm_s: flow === null ? null : Number(flow),
      })
    }
  }, [searchParams])

  const selectedPreset = useMemo(() => SCENARIO_PRESETS[active], [active])

  // Derive the effective atmosphere: preset for named scenarios, custom values for Custom.
  const atmosphere = useMemo<Atmosphere>(() => {
    if (active === 'Custom') return custom
    return selectedPreset
  }, [active, custom, selectedPreset])

  const selectScenario = useCallback(
    (next: ScenarioId) => {
      setActive(next)
      if (next !== 'Custom') {
        setCustom({ o2_percent: null, pressure_kpa: null, flow_cm_s: null })
      }
      const preset = SCENARIO_PRESETS[next]
      setSearchParams({
        [URL_PARAMS.scenario]: next,
        [URL_PARAMS.o2]: preset.o2_percent === null ? '' : String(preset.o2_percent),
        [URL_PARAMS.pressure]: preset.pressure_kpa === null ? '' : String(preset.pressure_kpa),
        [URL_PARAMS.flow]: preset.flow_cm_s === null ? '' : String(preset.flow_cm_s),
      })
      onChange?.(preset)
    },
    [onChange, setSearchParams]
  )

  const updateCustom = useCallback(
    (field: keyof Atmosphere, value: string) => {
      const next = { ...custom, [field]: value === '' ? null : Number(value) }
      setCustom(next)
      setSearchParams({
        [URL_PARAMS.scenario]: 'Custom',
        [URL_PARAMS.o2]: String(next.o2_percent ?? ''),
        [URL_PARAMS.pressure]: String(next.pressure_kpa ?? ''),
        [URL_PARAMS.flow]: String(next.flow_cm_s ?? ''),
      })
      setActive('Custom')
      onChange?.(next)
    },
    [custom, onChange, setSearchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-3">
      <label className="flex items-center gap-2 text-xs text-slate-400">
        Scenario
        <select
          value={active}
          onChange={(event) => selectScenario(event.target.value as ScenarioId)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-ember-500/60"
        >
          {Object.keys(SCENARIO_PRESETS).map((key) => (
            <option key={key} value={key as ScenarioId}>
              {SCENARIO_LABELS[key as ScenarioId]}
            </option>
          ))}
        </select>
      </label>

      {active === 'Custom' && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <label className="flex flex-col gap-0.5">
            <span>O₂ %</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={custom.o2_percent === null ? '' : String(custom.o2_percent)}
              onChange={(event) => updateCustom('o2_percent', event.target.value)}
              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-ember-500/60"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span>Pressure</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={custom.pressure_kpa === null ? '' : String(custom.pressure_kpa)}
              onChange={(event) => updateCustom('pressure_kpa', event.target.value)}
              className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-ember-500/60"
            />
            <span className="text-[0.65rem] opacity-60">kPa</span>
          </label>
          <label className="flex flex-col gap-0.5">
            <span>Flow</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={custom.flow_cm_s === null ? '' : String(custom.flow_cm_s)}
              onChange={(event) => updateCustom('flow_cm_s', event.target.value)}
              className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-ember-500/60"
            />
            <span className="text-[0.65rem] opacity-60">cm/s</span>
          </label>
        </div>
      )}

      <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
        <span className="text-ember-400">{atmosphere.o2_percent ?? '—'}%</span>
        <span className="text-slate-300">·</span>
        <span className="text-ember-400">{atmosphere.pressure_kpa ?? '—'} kPa</span>
        <span className="text-slate-300">·</span>
        <span className="text-ember-400">{atmosphere.flow_cm_s ?? '—'} cm/s</span>
      </span>

      <p className="ml-auto text-xs text-slate-500">
        {formatAtmosphere(atmosphere)}
      </p>
    </div>
  )
}
