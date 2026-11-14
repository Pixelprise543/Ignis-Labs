import { describe, expect, it } from 'vitest'
import { getInsights, severityRank } from '@/lib/insights'
import { getFinding } from '@/lib/data'
import { getScenario, customScenario } from '@/lib/scenarios'
import type { ScenarioId } from '@/contracts/types'

const SCENARIO_IDS: ScenarioId[] = ['iss', 'lunar', 'mars', 'eva']

const severityOf = (scenario: ScenarioId, id: string) => {
  const insight = getInsights(getScenario(scenario)).find((entry) => entry.id === id)
  if (!insight) throw new Error(`${id} is missing for ${scenario}`)
  return insight.severity
}

describe('getInsights: shape and grounding', () => {
  it('returns insights for every preset scenario', () => {
    for (const id of SCENARIO_IDS) {
      expect(getInsights(getScenario(id)).length, id).toBeGreaterThanOrEqual(5)
    }
  })

  it('gives every insight a unique id and non-empty copy', () => {
    const insights = getInsights(getScenario('iss'))
    expect(new Set(insights.map((entry) => entry.id)).size).toBe(insights.length)
    for (const insight of insights) {
      expect(insight.title.length).toBeGreaterThan(10)
      expect(insight.summary.length).toBeGreaterThan(40)
      expect(insight.recommendation.length).toBeGreaterThan(20)
      expect(insight.recommendation).not.toBe(insight.summary)
    }
  })

  it('keeps confidence inside 0-100 and severity inside the contract enum', () => {
    for (const id of SCENARIO_IDS) {
      for (const insight of getInsights(getScenario(id))) {
        expect(insight.confidence).toBeGreaterThanOrEqual(0)
        expect(insight.confidence).toBeLessThanOrEqual(100)
        expect(['info', 'caution', 'high', 'critical']).toContain(insight.severity)
      }
    }
  })

  it('cites only findings that exist in the dataset', () => {
    for (const id of SCENARIO_IDS) {
      for (const insight of getInsights(getScenario(id))) {
        expect(insight.evidenceIds.length).toBeGreaterThan(0)
        for (const findingId of insight.evidenceIds) {
          expect(getFinding(findingId), `${insight.id} -> ${findingId}`).toBeDefined()
        }
      }
    }
  })

  it('lists the requested scenario as a place the insight applies', () => {
    for (const id of SCENARIO_IDS) {
      for (const insight of getInsights(getScenario(id))) {
        expect(insight.scenarios, `${insight.id} for ${id}`).toContain(id)
      }
    }
  })

  it('sorts by severity, most urgent first', () => {
    for (const id of SCENARIO_IDS) {
      const ranks = getInsights(getScenario(id)).map((entry) => severityRank(entry.severity))
      expect(ranks).toEqual([...ranks].sort((a, b) => b - a))
    }
  })

  it('is deterministic', () => {
    expect(getInsights(getScenario('mars'))).toEqual(getInsights(getScenario('mars')))
  })

  it('returns a copy the caller can mutate', () => {
    const first = getInsights(getScenario('iss'))
    const count = first.length
    first.pop()
    expect(getInsights(getScenario('iss'))).toHaveLength(count)
  })
})

describe('getInsights: scenario sensitivity', () => {
  it('does not claim a partial-gravity gap for the ISS cabin', () => {
    const ids = getInsights(getScenario('iss')).map((entry) => entry.id)
    expect(ids).not.toContain('no-partial-gravity-data')
  })

  it('flags the partial-gravity gap for lunar and Mars scenarios', () => {
    for (const id of ['lunar', 'mars'] as const) {
      const insight = getInsights(getScenario(id)).find(
        (entry) => entry.id === 'no-partial-gravity-data',
      )
      expect(insight, id).toBeDefined()
      expect(insight?.summary).toMatch(/extrapolat/i)
      expect(insight?.confidence).toBeLessThan(60)
    }
  })

  it('flags the gap for a custom partial-gravity design', () => {
    const ids = getInsights(customScenario(0.2, 21, 101.3)).map((entry) => entry.id)
    expect(ids).toContain('no-partial-gravity-data')
  })

  it('does not flag the gap for a custom microgravity design', () => {
    const ids = getInsights(customScenario(0, 21, 101.3)).map((entry) => entry.id)
    expect(ids).not.toContain('no-partial-gravity-data')
  })

  it('rates oxygen enrichment as critical in the pure-oxygen suit', () => {
    expect(severityOf('eva', 'oxygen-enrichment')).toBe('critical')
    expect(getInsights(getScenario('iss')).map((entry) => entry.id)).not.toContain(
      'oxygen-enrichment',
    )
  })

  it('adds the oxygen insight for an enriched custom atmosphere', () => {
    const ids = getInsights(customScenario(0.16, 35, 101.3)).map((entry) => entry.id)
    expect(ids).toContain('oxygen-enrichment')
  })

  it('leaves the oxygen insight out of a sea-level custom atmosphere', () => {
    const ids = getInsights(customScenario(0.16, 21, 101.3)).map((entry) => entry.id)
    expect(ids).not.toContain('oxygen-enrichment')
  })

  it('adds the pressure-limit insight in an enriched low-pressure design', () => {
    const ids = getInsights(customScenario(0, 35, 40)).map((entry) => entry.id)
    expect(ids).toContain('pressure-extinction-limit')
    expect(ids).toContain('oxygen-enrichment')
  })

  it('keeps the pressure-limit insight out of a sea-level cabin', () => {
    const ids = getInsights(getScenario('iss')).map((entry) => entry.id)
    expect(ids).not.toContain('pressure-extinction-limit')
  })
})

describe('severityRank', () => {
  it('orders critical above high above caution above info', () => {
    expect(severityRank('critical')).toBeGreaterThan(severityRank('high'))
    expect(severityRank('high')).toBeGreaterThan(severityRank('caution'))
    expect(severityRank('caution')).toBeGreaterThan(severityRank('info'))
  })
})
