import { describe, expect, it } from 'vitest'
import { defaultWeights, rankExperiments } from '@/lib/scoring'
import { getExperiments } from '@/lib/data'
import { getScenario } from '@/lib/scenarios'
import type { ScoreWeights } from '@/contracts/types'

const experiments = getExperiments()

function scoreOf(list: ReturnType<typeof rankExperiments>, id: string) {
  const found = list.find((entry) => entry.experiment.id === id)
  if (!found) throw new Error(`${id} is missing from the ranking`)
  return found
}

describe('defaultWeights', () => {
  it('gives every dimension a weight between 0 and 1 that sums to one', () => {
    const values = Object.values(defaultWeights)
    for (const value of values) {
      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThanOrEqual(1)
    }
    expect(values.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1)
  })
})

describe('rankExperiments', () => {
  it('returns every experiment, highest composite first', () => {
    const ranked = rankExperiments(experiments, defaultWeights, getScenario('iss'))
    expect(ranked).toHaveLength(experiments.length)
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].composite).toBeGreaterThanOrEqual(ranked[i].composite)
    }
  })

  it('keeps every score and the composite inside 0-100', () => {
    for (const entry of rankExperiments(experiments, defaultWeights, getScenario('mars'))) {
      for (const score of Object.values(entry.scores)) {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }
      expect(entry.composite).toBeGreaterThanOrEqual(0)
      expect(entry.composite).toBeLessThanOrEqual(100)
    }
  })

  it('is deterministic for the same inputs', () => {
    const a = rankExperiments(experiments, defaultWeights, getScenario('iss'))
    const b = rankExperiments(experiments, defaultWeights, getScenario('iss'))
    expect(a).toEqual(b)
  })

  it('does not reorder or mutate the caller array', () => {
    const copy = [...experiments]
    rankExperiments(copy, defaultWeights, getScenario('iss'))
    expect(copy.map((e) => e.id)).toEqual(experiments.map((e) => e.id))
  })

  it('puts a spacecraft-scale fire test above a 1995 droplet study for the ISS cabin', () => {
    const ranked = rankExperiments(experiments, defaultWeights, getScenario('iss'))
    expect(ranked.slice(0, 5).map((entry) => entry.experiment.id)).toContain('saffire-iii')
    expect(ranked.findIndex((entry) => entry.experiment.id === 'dce-usml2')).toBeGreaterThan(10)
  })

  it('sorts by evidence alone when the other weights are zero', () => {
    const weights: ScoreWeights = {
      hazardSeverity: 0,
      exploration: 0,
      evidence: 1,
      recency: 0,
    }
    const ranked = rankExperiments(experiments, weights, getScenario('iss'))
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].scores.evidence).toBeGreaterThanOrEqual(ranked[i].scores.evidence)
    }
    expect(ranked[0].scores.evidence).toBe(100)
  })

  it('falls back to equal weights instead of dividing by zero', () => {
    const zero: ScoreWeights = {
      hazardSeverity: 0,
      exploration: 0,
      evidence: 0,
      recency: 0,
    }
    for (const entry of rankExperiments(experiments, zero, getScenario('iss'))) {
      expect(Number.isFinite(entry.composite)).toBe(true)
      expect(entry.composite).toBeGreaterThan(0)
    }
  })

  it('lowers hazard relevance for a partial-gravity scenario with no partial-g data', () => {
    const iss = scoreOf(rankExperiments(experiments, defaultWeights, getScenario('iss')), 'saffire-vi')
    const lunar = scoreOf(
      rankExperiments(experiments, defaultWeights, getScenario('lunar')),
      'saffire-vi',
    )
    expect(lunar.scores.hazardSeverity).toBeLessThan(iss.scores.hazardSeverity)
  })

  it('raises the hazard score of an oxygen-enriched experiment in the pure-oxygen suit', () => {
    const iss = scoreOf(rankExperiments(experiments, defaultWeights, getScenario('iss')), 'saffire-vi')
    const eva = scoreOf(rankExperiments(experiments, defaultWeights, getScenario('eva')), 'saffire-vi')
    expect(eva.scores.hazardSeverity).toBeGreaterThan(iss.scores.hazardSeverity)
  })

  it('writes a rationale that names the scenario and the strongest driver', () => {
    const entry = rankExperiments(experiments, defaultWeights, getScenario('iss'))[0]
    expect(entry.rationale.length).toBeGreaterThan(30)
    expect(entry.rationale).toContain('ISS cabin')
  })

  it('warns in the rationale when a partial-gravity scenario is being extrapolated', () => {
    const entry = scoreOf(
      rankExperiments(experiments, defaultWeights, getScenario('mars')),
      'saffire-iii',
    )
    expect(entry.rationale).toMatch(/no partial-gravity|extrapolat/i)
  })
})
