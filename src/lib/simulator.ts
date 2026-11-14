import type {
  Experiment,
  FuelType,
  Material,
  SimDriver,
  SimInput,
  SimResult,
} from '@/contracts/types'
import { getExperiment, getExperiments, getMaterial } from '@/lib/data'
import { levelForRisk } from '@/lib/severity'

/**
 * A transparent what-if estimator, not a physics simulation.
 *
 * The score is the material's qualitative index plus four named adjustments.
 * Every adjustment is also returned as a driver with its own weight and evidence,
 * so the UI can show why the number moved instead of asking the reader to trust
 * it. The one term with no measured data behind it is ventilation: every record's
 * flow field is unpublished, so that term is a heuristic and a caveat says so.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const usable = (value: number, fallback = 0) =>
  Number.isFinite(value) ? value : fallback

const round1 = (value: number) => Math.round(value * 10) / 10

const TARGET_FUEL: Record<Material['category'], FuelType[]> = {
  textile: ['solid'],
  polymer: ['solid'],
  foam: ['solid'],
  paper: ['solid'],
  composite: ['solid'],
  'liquid-fuel': ['droplet', 'liquid'],
  gas: ['gas'],
}

function gravityDriver(gravityG: number): SimDriver | null {
  if (gravityG >= 0.01 && gravityG < 0.9) {
    return {
      factor: 'Gravity',
      direction: 'raises',
      weight: 6,
      explanation:
        'Partial gravity weakens buoyancy without removing it, and no partial-gravity flame-spread data exists, so the result is an extrapolation.',
      evidenceIds: ['acme-bre-f2', 'saffire-vi-f1'],
    }
  }
  if (gravityG < 0.01) {
    return {
      factor: 'Gravity',
      direction: 'raises',
      weight: 12,
      explanation:
        'In microgravity there is no buoyant plume to carry heat away from the surface, so a flame relies on the ventilation flow and can persist on materials that would cool on Earth.',
      evidenceIds: ['saffire-iii-f1', 'sofie-rtdfs-f1'],
    }
  }
  return null
}

function oxygenDriver(o2Percent: number): SimDriver | null {
  const delta = round1(clamp((o2Percent - 21) * 1.2, -20, 30))
  if (delta === 0) return null

  if (delta > 0) {
    return {
      factor: 'Oxygen',
      direction: 'raises',
      weight: delta,
      explanation:
        `At ${o2Percent}% oxygen the atmosphere carries more oxidiser than sea-level air, which lowers ignition energy and widens the range of materials that will sustain a flame.`,
      evidenceIds: ['saffire-vi-f1', 'sofie-gel-f1'],
    }
  }

  return {
    factor: 'Oxygen',
    direction: 'lowers',
    weight: Math.abs(delta),
    explanation:
      `At ${o2Percent}% oxygen there is less oxidiser than in sea-level air, which narrows the flammable range; the gain is a narrower margin, not a guarantee.`,
    evidenceIds: ['sofie-gel-f1'],
  }
}

function pressureDriver(pressureKPa: number): SimDriver | null {
  if (pressureKPa >= 60) return null
  const weight = round1(clamp((60 - pressureKPa) * 0.2, 0, 10))
  return {
    factor: 'Pressure',
    direction: 'raises',
    weight,
    explanation:
      `At ${Number(pressureKPa.toPrecision(3))} kPa the flame changes colour and size before it extinguishes, and the extinction pressure depends on the material and the oxygen fraction, so lower pressure is not automatically safer.`,
    evidenceIds: ['sofie-gel-f1', 'sofie-gel-f2'],
  }
}

function ventilationDriver(flowCmPerS: number): SimDriver | null {
  if (flowCmPerS <= 0) return null
  const weight = round1(clamp(flowCmPerS * 0.4, 0, 12))
  return {
    factor: 'Ventilation',
    direction: 'raises',
    weight,
    explanation:
      `A forced flow of ${flowCmPerS} cm/s sets the flow field around the surface; the same fabric burned differently at different airflow rates, so ventilation is scored as an added spread driver.`,
    evidenceIds: ['saffire-iii-f1', 'sofie-rtdfs-f1'],
  }
}

function nearestExperiments(input: SimInput, material: Material | undefined): string[] {
  const targetFuel = material ? TARGET_FUEL[material.category] : []
  const o2 = clamp(usable(input.o2Percent, 21), 0, 100)
  const pressure = clamp(usable(input.pressureKPa, 101.3), 0, 150)
  const flow = clamp(usable(input.flowCmPerS), 0, 100)
  const gravity = clamp(usable(input.gravityG), 0, 2)

  const ranked = getExperiments()
    .map((experiment: Experiment) => {
      const gravityDistance = Math.abs(experiment.conditions.gravityG - gravity)
      const fuelDistance =
        targetFuel.length === 0 || targetFuel.includes(experiment.fuelType) ? 0 : 0.4
      const o2Distance =
        experiment.conditions.o2Percent === null
          ? 0.3
          : Math.abs(experiment.conditions.o2Percent - o2) / 100
      const pressureDistance =
        experiment.conditions.pressureKPa === null
          ? 0.3
          : Math.abs(experiment.conditions.pressureKPa - pressure) / 150
      const flowDistance =
        experiment.conditions.flowCmPerS === null
          ? 0.2
          : Math.abs(experiment.conditions.flowCmPerS - flow) / 100

      return {
        id: experiment.id,
        distance:
          gravityDistance + fuelDistance + o2Distance + pressureDistance + flowDistance,
      }
    })
    .sort((a, b) => a.distance - b.distance)

  return ranked.slice(0, 3).map((entry) => entry.id)
}

/** Material, gravity, oxygen, pressure and flow in; explained estimate out. */
export function simulateRisk(input: SimInput): SimResult {
  const gravityG = clamp(usable(input.gravityG), 0, 2)
  const o2Percent = clamp(usable(input.o2Percent, 21), 0, 100)
  const pressureKPa = clamp(usable(input.pressureKPa, 101.3), 0, 150)
  const flowCmPerS = clamp(usable(input.flowCmPerS), 0, 100)

  const material = getMaterial(input.materialId)
  const baseline = material ? material.baseFlammability : 50

  const drivers: SimDriver[] = [
    {
      factor: 'Material baseline',
      direction: 'raises',
      weight: baseline,
      explanation: material
        ? `${material.name} carries a qualitative flammability index of ${material.baseFlammability}/100 in the curated catalogue.`
        : `The material is not in the catalogue, so the baseline uses a neutral index of 50/100.`,
      evidenceIds: material ? [...material.evidenceIds] : ['saffire-i-f1'],
    },
  ]

  const gravity = gravityDriver(gravityG)
  const oxygen = oxygenDriver(o2Percent)
  const pressure = pressureDriver(pressureKPa)
  const ventilation = ventilationDriver(flowCmPerS)

  for (const driver of [gravity, oxygen, pressure, ventilation]) {
    if (driver) drivers.push(driver)
  }

  const signedTotal =
    baseline +
    (gravity?.weight ?? 0) +
    (oxygen ? (oxygen.direction === 'raises' ? oxygen.weight : -oxygen.weight) : 0) +
    (pressure?.weight ?? 0) +
    (ventilation?.weight ?? 0)

  const risk = Math.round(clamp(signedTotal, 0, 100))
  const partialGravity = gravityG >= 0.01 && gravityG < 0.9

  const caveats = ['Decision-support estimate, not a physics simulation.']

  if (partialGravity) {
    caveats.push(
      'No partial-gravity flame-spread data exists; this result extrapolates from microgravity evidence.',
    )
  }

  caveats.push(
    'No experiment in the dataset reports a measured flow rate, so the ventilation term is a heuristic.',
  )

  if (o2Percent > 30) {
    caveats.push(
      'Above 30% oxygen the result sits outside the tested range of most records; read the oxygen term as an upper-bound indicator.',
    )
  }

  if (pressureKPa < 60) {
    caveats.push(
      'Low-pressure behaviour is recorded only as extinction observations, so the pressure term is qualitative.',
    )
  }

  if (!material) {
    caveats.push(
      'The selected material is not in the catalogue, so only the atmosphere terms are specific to it.',
    )
  }

  return {
    risk,
    level: levelForRisk(risk),
    drivers,
    nearestExperimentIds: nearestExperiments(input, material).filter(
      (id) => getExperiment(id) !== undefined,
    ),
    caveats,
  }
}
