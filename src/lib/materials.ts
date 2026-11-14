import type {
  Material,
  MaterialRisk,
  Scenario,
  ScenarioId,
} from '@/contracts/types'
import { getMaterials } from '@/lib/data'
import { getScenario } from '@/lib/scenarios'
import { levelForRisk } from '@/lib/severity'

/**
 * The Materials view is a qualitative risk matrix, not a fire model.
 *
 * Risk starts from each material's curated flammability index and moves with the
 * scenario: microgravity removes buoyant cooling, an enriched atmosphere widens
 * the flammable range, and a low-pressure cabin changes the flame without
 * necessarily making it safer. Every number is labelled qualitative in the
 * rationale, and the matrix is scenario-by-material so a reader can see the whole
 * design space at once.
 */

export const MATRIX_SCENARIOS: ScenarioId[] = ['iss', 'lunar', 'mars', 'eva']

export interface MaterialMatrixRow {
  material: Material
  /** Risk in the same order as `scenarios`. */
  risks: number[]
}

export interface MaterialMatrix {
  scenarios: Scenario[]
  rows: MaterialMatrixRow[]
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}`

function gravityAdjustment(scenario: Scenario): { points: number; reason: string } {
  if (scenario.gravityG < 0.01) {
    return {
      points: 12,
      reason: 'microgravity, where there is no buoyant plume to carry heat away from the surface',
    }
  }
  if (scenario.gravityG < 0.9) {
    return {
      points: 6,
      reason: 'partial gravity, where buoyancy is weakened but not gone',
    }
  }
  return { points: 0, reason: 'normal gravity' }
}

function oxygenAdjustment(scenario: Scenario): { points: number; reason: string } {
  if (scenario.o2Percent > 21) {
    return {
      points: clamp((scenario.o2Percent - 21) * 1.2, 0, 30),
      reason: `${scenario.o2Percent}% oxygen, above the 21% of sea-level air`,
    }
  }
  if (scenario.o2Percent < 21) {
    return {
      points: clamp((scenario.o2Percent - 21) * 1.2, -20, 0),
      reason: `${scenario.o2Percent}% oxygen, below sea-level air`,
    }
  }
  return { points: 0, reason: 'sea-level oxygen fraction' }
}

function pressureAdjustment(scenario: Scenario): { points: number; reason: string } {
  if (scenario.pressureKPa < 60) {
    return {
      points: clamp((60 - scenario.pressureKPa) * 0.2, 0, 10),
      reason: `${Number(scenario.pressureKPa.toPrecision(3))} kPa, a low-pressure cabin where the flame changes before it dies`,
    }
  }
  return { points: 0, reason: 'a sea-level cabin pressure' }
}

function riskFor(material: Material, scenario: Scenario): MaterialRisk {
  const gravity = gravityAdjustment(scenario)
  const oxygen = oxygenAdjustment(scenario)
  const pressure = pressureAdjustment(scenario)

  const risk = Math.round(
    clamp(material.baseFlammability + gravity.points + oxygen.points + pressure.points),
  )

  const extrapolated =
    scenario.gravityG >= 0.01 && scenario.gravityG < 0.9
      ? ' No partial-gravity flame-spread data exists, so this row is an extrapolation from microgravity evidence.'
      : ''

  return {
    materialId: material.id,
    scenarioId: scenario.id,
    risk,
    level: levelForRisk(risk),
    rationale:
      `Qualitative flammability index ${material.baseFlammability}/100, adjusted ${signed(gravity.points)} for ${gravity.reason}, ` +
      `${signed(oxygen.points)} for ${oxygen.reason} and ${signed(pressure.points)} for ${pressure.reason}. ` +
      `Decision-support estimate, not a physics simulation.${extrapolated}`,
    evidenceIds: [...material.evidenceIds],
  }
}

/** Risk rows for one scenario, in catalogue order. */
export function getMaterialRisks(scenario: Scenario): MaterialRisk[] {
  return getMaterials().map((material) => riskFor(material, scenario))
}

/**
 * The full material x preset-scenario matrix. The custom scenario is deliberately
 * excluded: it is a live what-if, and its column would change on every keystroke.
 */
export function getMaterialMatrix(): MaterialMatrix {
  const scenarios = MATRIX_SCENARIOS.map((id) => getScenario(id))
  const materials = getMaterials()

  return {
    scenarios,
    rows: materials.map((material) => ({
      material,
      risks: scenarios.map((scenario) => riskFor(material, scenario).risk),
    })),
  }
}
