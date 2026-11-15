import { describe, expect, it } from 'vitest'
import { getExperiments } from '@/lib/data'
import { getCoverage, getPartialGravityExperiments, hasPartialGravityData, maxMeasuredPartialGravityG } from '@/lib/coverage'

/**
 * Guards the lunar-gravity records and the rule they created.
 *
 * The dataset used to have no partial-gravity experiment, and four separate
 * pieces of copy said so. These tests make the replacement claim explicit, so a
 * future record cannot quietly change the message without a test failing.
 */
describe('partial-gravity records', () => {
  it('exist, and all of them are lunar gravity', () => {
    expect(hasPartialGravityData()).toBe(true)
    for (const experiment of getPartialGravityExperiments()) {
      expect(experiment.regime).toBe('partial-g')
      expect(experiment.conditions.gravityG).toBeCloseTo(0.16, 2)
    }
  })

  it('leave Mars gravity outside anything measured', () => {
    const highest = maxMeasuredPartialGravityG()
    expect(highest).not.toBeNull()
    expect(highest).toBeLessThan(0.38)
  })

  it('are the only records in the partial-gravity coverage row', () => {
    const ids = new Set(getPartialGravityExperiments().map((experiment) => experiment.id))
    const cells = getCoverage().filter((cell) => cell.gravityBand === 'partial-gravity')
    const placed = cells.flatMap((cell) => cell.experimentIds)
    expect(placed.length).toBe(ids.size)
    for (const id of placed) expect(ids.has(id)).toBe(true)
  })

  it('keep the plan/result distinction visible in the records themselves', () => {
    const fm2 = getExperiments().find((experiment) => experiment.id === 'fm2')
    const luci = getExperiments().find((experiment) => experiment.id === 'luci')
    // FM2 has not flown: open-ended years and curated confidence.
    expect(fm2?.years[1]).toBeNull()
    expect(fm2?.confidence).toBe('curated')
    // LUCI measured numbers in flight, so it may claim verified.
    expect(luci?.confidence).toBe('verified')
    expect(luci?.summary).toMatch(/sounding rocket|New Shepard/i)
  })

  it('cite an NTRS page that was retrieved, not a guessed link', () => {
    for (const experiment of getPartialGravityExperiments()) {
      expect(experiment.sources.length).toBeGreaterThan(0)
      for (const source of experiment.sources) {
        expect(source.url).toMatch(/^https:\/\/ntrs\.nasa\.gov\/citations\/\d+/)
      }
    }
  })
})
