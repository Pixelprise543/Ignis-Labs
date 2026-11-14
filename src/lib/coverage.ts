import type {
  CoverageCell,
  Experiment,
  GravityRegime,
  Scenario,
  ScenarioId,
} from '@/contracts/types'
import { getExperiments } from '@/lib/data'

/**
 * Evidence coverage: how many experiments sit in each gravity x oxygen cell.
 *
 * The grid is deliberately fixed, including empty rows, because the empty row is
 * the finding. Every flight record in the dataset is microgravity, so the entire
 * partial-gravity row is a gap for lunar and Mars design work. Rendering that row
 * as blank-but-present is more honest than hiding it.
 *
 * `not specified` is a real oxygen band, not a bug: most records were retrieved
 * without a published cabin oxygen fraction, and moving them into a numeric band
 * would be inventing a condition.
 */

export const GRAVITY_BANDS = ['microgravity', 'partial-gravity', 'normal-gravity'] as const
export type GravityBand = (typeof GRAVITY_BANDS)[number]

export const O2_BANDS = ['<= 21%', '21-30%', '> 30%', 'not specified'] as const
export type O2Band = (typeof O2_BANDS)[number]

const SCENARIOS_BY_BAND: Record<GravityBand, ScenarioId[]> = {
  microgravity: ['iss', 'eva', 'custom'],
  'partial-gravity': ['lunar', 'mars', 'custom'],
  'normal-gravity': ['custom'],
}

const BAND_BY_REGIME: Record<GravityRegime, GravityBand> = {
  microgravity: 'microgravity',
  'partial-g': 'partial-gravity',
  'normal-g': 'normal-gravity',
}

function gravityBandFor(gravityG: number): GravityBand {
  if (gravityG < 0.01) return 'microgravity'
  if (gravityG < 0.9) return 'partial-gravity'
  return 'normal-gravity'
}

function o2BandFor(experiment: Experiment): O2Band {
  const oxygen = experiment.conditions.o2Percent
  if (oxygen === null) return 'not specified'
  if (oxygen <= 21) return '<= 21%'
  if (oxygen <= 30) return '21-30%'
  return '> 30%'
}

/**
 * The complete grid, in display order. Empty cells are returned with
 * `count: 0` and `gap: true`.
 */
export function getCoverage(): CoverageCell[] {
  const experiments = getExperiments()
  const cells: CoverageCell[] = []

  for (const gravityBand of GRAVITY_BANDS) {
    for (const o2Band of O2_BANDS) {
      const experimentIds = experiments
        .filter(
          (experiment) =>
            BAND_BY_REGIME[experiment.regime] === gravityBand && o2BandFor(experiment) === o2Band,
        )
        .map((experiment) => experiment.id)

      cells.push({
        gravityBand,
        o2Band,
        count: experimentIds.length,
        experimentIds,
        gap: experimentIds.length === 0,
        relevantScenarios: [...SCENARIOS_BY_BAND[gravityBand]],
      })
    }
  }

  return cells
}

/**
 * Empty cells in the gravity band the selected scenario lives in. A lunar or
 * Mars scenario gets the whole partial-gravity row; the ISS gets only the
 * microgravity oxygen cells nobody flew.
 */
export function getGaps(scenario: Scenario): CoverageCell[] {
  const band = gravityBandFor(scenario.gravityG)
  return getCoverage()
    .filter((cell) => cell.gravityBand === band && cell.gap)
    .map((cell) => ({ ...cell, experimentIds: [...cell.experimentIds] }))
}
