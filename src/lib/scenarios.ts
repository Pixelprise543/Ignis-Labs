import type { GravityRegime, Scenario, ScenarioId } from '@/contracts/types'

/**
 * Scenario presets. Every view in Ignis is a function of the selected scenario,
 * so these values are the single source of truth for gravity, oxygen and pressure.
 *
 * `assumption: true` means "notional habitat design point, not a measured cabin
 * atmosphere". The UI must badge those; only the ISS cabin and the EVA suit are
 * operational values (ISS: sea-level air; EMU: 29.6 kPa pure O2).
 *
 * Microgravity is stored as exactly 0 rather than the ISS's ~1e-6 g so the
 * scoring and simulator arithmetic stay readable. `regimeFor` treats anything
 * under 0.01 g as microgravity.
 */

const ISS: Scenario = {
  id: 'iss',
  label: 'ISS cabin',
  gravityG: 0,
  o2Percent: 21,
  pressureKPa: 101.3,
  description:
    'Pressurized ISS module at sea-level air composition. Buoyancy is absent, so flames rely on ventilation flow and can creep over surfaces that would self-extinguish on Earth.',
  assumption: false,
}

const LUNAR: Scenario = {
  id: 'lunar',
  label: 'Lunar habitat',
  gravityG: 0.16,
  o2Percent: 21,
  pressureKPa: 101.3,
  description:
    'Notional lunar surface habitat at one-sixth g. Weak buoyancy gives a short, rounded flame; forced ventilation still dominates the flow field.',
  assumption: true,
}

const MARS: Scenario = {
  id: 'mars',
  label: 'Mars transit',
  gravityG: 0.38,
  o2Percent: 21,
  pressureKPa: 101.3,
  description:
    'Notional Mars transit habitat at three-eighths g. Enough buoyancy to shape a flame, not enough to rely on terrestrial fire behaviour.',
  assumption: true,
}

const EVA: Scenario = {
  id: 'eva',
  label: 'EVA suit',
  gravityG: 0,
  o2Percent: 100,
  pressureKPa: 29.6,
  description:
    'EMU operating point: 29.6 kPa (4.3 psia) pure oxygen. Any ignition has the highest oxygen fraction in the mission and no cabin dilution to fall back on.',
  assumption: false,
}

const CUSTOM_DEFAULTS = { gravityG: 0.16, o2Percent: 21, pressureKPa: 101.3 } as const

function defaultCustom(): Scenario {
  return {
    id: 'custom',
    label: 'Custom',
    gravityG: CUSTOM_DEFAULTS.gravityG,
    o2Percent: CUSTOM_DEFAULTS.o2Percent,
    pressureKPa: CUSTOM_DEFAULTS.pressureKPa,
    description:
      'Your own gravity, oxygen and pressure. Use it to test a vehicle concept before the design is fixed.',
    assumption: true,
  }
}

/** Presets shown in the Scenario Bar, in display order. */
export const SCENARIOS: Scenario[] = [ISS, LUNAR, MARS, EVA, defaultCustom()]

const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min

/**
 * A custom scenario keeps a copy, never a reference into SCENARIOS, so editing
 * the result cannot corrupt the preset list.
 */
export function customScenario(gravityG: number, o2Percent: number, pressureKPa: number): Scenario {
  const base = defaultCustom()
  return {
    ...base,
    gravityG: clamp(gravityG, 0, 2),
    o2Percent: clamp(o2Percent, 5, 100),
    pressureKPa: clamp(pressureKPa, 5, 150),
  }
}

/** Unknown ids can arrive from a hand-edited URL; fall back to the ISS preset. */
export function getScenario(id: ScenarioId): Scenario {
  if (id === 'custom') return defaultCustom()
  const found = SCENARIOS.find((s) => s.id === id)
  return found ? { ...found } : { ...ISS }
}

/** Contract's three gravity regimes. 0.01 g is the usual microgravity boundary. */
export function regimeFor(gravityG: number): GravityRegime {
  if (gravityG < 0.01) return 'microgravity'
  if (gravityG < 0.9) return 'partial-g'
  return 'normal-g'
}

/** Two significant digits: 0.16 g, 0.38 g, 1.6 g. Microgravity always reads 0 g. */
export function formatGravity(gravityG: number): string {
  if (!Number.isFinite(gravityG) || gravityG < 0.01) return '0 g'
  return `${Number(gravityG.toPrecision(2))} g`
}

/** Human label for a scenario, used in the SI prompt and the brief. */
export function scenarioContextLabel(scenario: Scenario): string {
  const o2 = Number(scenario.o2Percent.toPrecision(3))
  const kPa = Number(scenario.pressureKPa.toPrecision(3))
  return `${scenario.label} - ${formatGravity(scenario.gravityG)}, ${o2}% O2, ${kPa} kPa`
}
