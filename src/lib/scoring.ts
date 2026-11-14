import type {
  Experiment,
  RankedExperiment,
  Scenario,
  ScoreWeights,
} from '@/contracts/types'

/**
 * Ranking is a transparent, additive score, not a model. Every component is
 * computed from fields that exist in the dataset, so a reader can argue with a
 * number and see where it came from. Weights are normalised at use time, which
 * means the UI can expose them as four independent sliders.
 *
 * The one asymmetry worth knowing: there is no partial-gravity experiment in the
 * dataset. For lunar and Mars scenarios every microgravity record is scored down
 * and the rationale says it is an extrapolation. Scoring it up would be a lie
 * with a number attached.
 */
export const defaultWeights: ScoreWeights = {
  hazardSeverity: 0.4,
  exploration: 0.25,
  evidence: 0.2,
  recency: 0.15,
}

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value))

const round = (value: number) => Math.round(clamp(value))

const round1 = (value: number) => Math.round(clamp(value) * 10) / 10

const FUEL_RELEVANCE: Record<Experiment['fuelType'], number> = {
  solid: 100,
  gas: 75,
  droplet: 65,
  liquid: 60,
  'cool-flame': 55,
  dust: 50,
}

function gravityScore(experiment: Experiment, scenario: Scenario): number {
  if (scenario.gravityG < 0.01) {
    return experiment.regime === 'microgravity' ? 100 : 45
  }
  if (scenario.gravityG < 0.9) {
    if (experiment.regime === 'partial-g') return 100
    // Microgravity data is the closest evidence available, but it is not the
    // regime being asked about, so it cannot score like a direct match.
    return experiment.regime === 'microgravity' ? 55 : 45
  }
  if (experiment.regime === 'normal-g') return 100
  return experiment.regime === 'partial-g' ? 60 : 45
}

function oxygenScore(experiment: Experiment, scenario: Scenario): number {
  const tags = new Set(experiment.tags)
  const testedEnriched =
    tags.has('oxygen-enriched') ||
    experiment.metrics.some(
      (metric) =>
        metric.key === 'oxygen-concentration' &&
        typeof metric.value === 'number' &&
        metric.value >= 25,
    )

  if (scenario.o2Percent >= 30) {
    // An enriched scenario is only informed by experiments that actually burned
    // in enriched air.
    return testedEnriched ? 90 : 45
  }

  const tested = experiment.conditions.o2Percent
  if (tested === null) return 70
  return Math.abs(tested - scenario.o2Percent) <= 5 ? 85 : 55
}

function pressureScore(experiment: Experiment, scenario: Scenario): number {
  const tags = new Set(experiment.tags)
  const testedPressure =
    tags.has('pressure') ||
    experiment.metrics.some(
      (metric) => metric.key === 'pressure' || metric.key === 'extinction-pressure',
    )

  if (scenario.pressureKPa < 60) {
    return testedPressure ? 90 : 50
  }

  const tested = experiment.conditions.pressureKPa
  if (tested === null) return 70
  return Math.abs(tested - scenario.pressureKPa) <= 15 ? 85 : 60
}

const TAG_POINTS: Record<string, number> = {
  'large-scale': 22,
  scale: 18,
  'partial-g': 15,
  'data-set': 14,
  'extinction-limit': 12,
  'concealed-fire': 12,
  'flame-spread': 8,
  suppression: 8,
  'material-flammability': 8,
  modelling: 8,
  method: 6,
  screening: 6,
  ventilation: 6,
  'low-flow': 6,
  heritage: 4,
}

function explorationScore(experiment: Experiment): number {
  const tagPoints = Math.min(
    40,
    experiment.tags.reduce((sum, tag) => sum + (TAG_POINTS[tag] ?? 0), 0),
  )
  const measured = experiment.metrics.filter((metric) => metric.value !== null).length
  const metricPoints = Math.min(30, measured * 8)
  const findingPoints = Math.min(20, experiment.findings.length * 6)
  return clamp(18 + tagPoints + metricPoints + findingPoints)
}

function evidenceScore(experiment: Experiment): number {
  const base =
    experiment.confidence === 'verified'
      ? 100
      : experiment.confidence === 'curated'
        ? 72
        : 30
  const sourceBonus = Math.max(0, experiment.sources.length - 1) * 3
  const findingBonus = Math.max(0, experiment.findings.length - 2) * 2
  return clamp(base + sourceBonus + findingBonus)
}

function recencyScore(experiment: Experiment): number {
  const lastYear = experiment.years[1] ?? 2026
  return clamp(100 - (2026 - lastYear) * 4)
}

function rationaleFor(
  experiment: Experiment,
  scenario: Scenario,
  scores: RankedExperiment['scores'],
  composite: number,
  normalised: ScoreWeights,
): string {
  const drivers = [
    {
      name: 'hazard relevance',
      weighted: scores.hazardSeverity * normalised.hazardSeverity,
      score: scores.hazardSeverity,
      phrase: `its test conditions are the closest match to ${scenario.label.toLowerCase()}`,
    },
    {
      name: 'exploration value',
      weighted: scores.exploration * normalised.exploration,
      score: scores.exploration,
      phrase: 'it was designed to extend the evidence base rather than confirm it',
    },
    {
      name: 'evidence strength',
      weighted: scores.evidence * normalised.evidence,
      score: scores.evidence,
      phrase: `${experiment.confidence} record with ${experiment.sources.length} NASA source${experiment.sources.length === 1 ? '' : 's'} and ${experiment.findings.length} findings`,
    },
    {
      name: 'recency',
      weighted: scores.recency * normalised.recency,
      score: scores.recency,
      phrase: `the data runs to ${experiment.years[1] ?? 2026}`,
    },
  ]

  const top = drivers.reduce((best, driver) => (driver.weighted > best.weighted ? driver : best))

  const caveat =
    scenario.gravityG >= 0.01 && scenario.gravityG < 0.9
      ? ' No partial-gravity flame-spread data exists, so this is an extrapolation from microgravity and theory.'
      : ''

  return `${experiment.acronym} scores ${composite}/100 for ${scenario.label}. Strongest driver: ${top.name} (${top.score}/100) - ${top.phrase}.${caveat}`
}

/**
 * Ranks a copy of the given experiments. The input array is never reordered.
 * A weight vector of all zeros degrades to equal weights rather than NaN.
 */
export function rankExperiments(
  experiments: Experiment[],
  weights: ScoreWeights,
  scenario: Scenario,
): RankedExperiment[] {
  const raw = Object.values(weights).reduce((sum, value) => sum + value, 0)
  const normalised: ScoreWeights =
    raw > 0
      ? {
          hazardSeverity: weights.hazardSeverity / raw,
          exploration: weights.exploration / raw,
          evidence: weights.evidence / raw,
          recency: weights.recency / raw,
        }
      : { hazardSeverity: 0.25, exploration: 0.25, evidence: 0.25, recency: 0.25 }

  return experiments
    .map((experiment) => {
      const scores = {
        hazardSeverity: round(
          0.4 * gravityScore(experiment, scenario) +
            0.3 * oxygenScore(experiment, scenario) +
            0.15 * pressureScore(experiment, scenario) +
            0.15 * FUEL_RELEVANCE[experiment.fuelType],
        ),
        exploration: round(explorationScore(experiment)),
        evidence: round(evidenceScore(experiment)),
        recency: round(recencyScore(experiment)),
      }

      const composite = round1(
        scores.hazardSeverity * normalised.hazardSeverity +
          scores.exploration * normalised.exploration +
          scores.evidence * normalised.evidence +
          scores.recency * normalised.recency,
      )

      return {
        experiment,
        scores,
        composite,
        rationale: rationaleFor(experiment, scenario, scores, composite, normalised),
      }
    })
    .sort((a, b) => b.composite - a.composite)
}
