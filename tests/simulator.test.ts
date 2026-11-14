import { describe, expect, it } from 'vitest'
import { simulateRisk } from '@/lib/simulator'
import { getFinding, getExperiment } from '@/lib/data'
import type { SimInput } from '@/contracts/types'

const base: SimInput = {
  materialId: 'sibal-fabric',
  gravityG: 0,
  o2Percent: 21,
  pressureKPa: 101.3,
  flowCmPerS: 5,
}

const factors = (input: SimInput) => simulateRisk(input).drivers.map((driver) => driver.factor)

describe('simulateRisk: shape and honesty', () => {
  it('returns a bounded risk and a matching level', () => {
    const result = simulateRisk(base)
    expect(result.risk).toBeGreaterThanOrEqual(0)
    expect(result.risk).toBeLessThanOrEqual(100)
    const expected =
      result.risk >= 70 ? 'critical' : result.risk >= 45 ? 'high' : result.risk >= 25 ? 'caution' : 'info'
    expect(result.level).toBe(expected)
  })

  it('explains every driver with a direction, weight and evidence', () => {
    const result = simulateRisk({
      ...base,
      gravityG: 0.16,
      o2Percent: 34,
      pressureKPa: 70,
      flowCmPerS: 10,
    })
    expect(result.drivers.length).toBeGreaterThanOrEqual(3)
    for (const driver of result.drivers) {
      expect(driver.factor.length).toBeGreaterThan(0)
      expect(['raises', 'lowers']).toContain(driver.direction)
      expect(driver.weight).toBeGreaterThan(0)
      expect(driver.explanation.length).toBeGreaterThan(20)
      expect(driver.evidenceIds.length).toBeGreaterThan(0)
      for (const findingId of driver.evidenceIds) {
        expect(getFinding(findingId), `${driver.factor} -> ${findingId}`).toBeDefined()
      }
    }
  })

  it('always starts from the material baseline', () => {
    expect(factors(base)).toContain('Material baseline')
  })

  it('names the drivers that moved the result', () => {
    const moved = factors({
      ...base,
      gravityG: 0.16,
      o2Percent: 34,
      pressureKPa: 40,
      flowCmPerS: 10,
    })
    expect(moved).toEqual(
      expect.arrayContaining(['Gravity', 'Oxygen', 'Pressure', 'Ventilation']),
    )
  })

  it('returns three real, unique nearest experiments', () => {
    const ids = simulateRisk(base).nearestExperimentIds
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    for (const id of ids) expect(getExperiment(id), id).toBeDefined()
  })

  it('always says it is a decision-support estimate', () => {
    expect(simulateRisk(base).caveats.join(' ')).toMatch(/decision-support/i)
  })

  it('admits that the ventilation term is a heuristic', () => {
    expect(simulateRisk(base).caveats.join(' ')).toMatch(/flow|ventilation/i)
    expect(simulateRisk(base).caveats.join(' ')).toMatch(/heuristic|not measured|no experiment/i)
  })

  it('is deterministic', () => {
    expect(simulateRisk(base)).toEqual(simulateRisk(base))
    expect(simulateRisk({ ...base, o2Percent: 34 })).toEqual(
      simulateRisk({ ...base, o2Percent: 34 }),
    )
  })

  it('does not throw for an unknown material', () => {
    const result = simulateRisk({ ...base, materialId: 'unobtainium' })
    expect(Number.isFinite(result.risk)).toBe(true)
    expect(result.caveats.join(' ')).toMatch(/unknown|not in the catalogue/i)
    expect(result.drivers[0].factor).toBe('Material baseline')
  })

  it('clamps absurd inputs instead of returning NaN or Infinity', () => {
    const result = simulateRisk({
      materialId: 'cotton',
      gravityG: 99,
      o2Percent: 500,
      pressureKPa: -20,
      flowCmPerS: 1e6,
    })
    expect(Number.isFinite(result.risk)).toBe(true)
    expect(result.risk).toBeGreaterThanOrEqual(0)
    expect(result.risk).toBeLessThanOrEqual(100)
  })
})

describe('simulateRisk: sensitivity', () => {
  it('raises risk as oxygen rises', () => {
    const low = simulateRisk({ ...base, o2Percent: 21 }).risk
    const mid = simulateRisk({ ...base, o2Percent: 30 }).risk
    const high = simulateRisk({ ...base, o2Percent: 40 }).risk
    expect(mid).toBeGreaterThan(low)
    expect(high).toBeGreaterThan(mid)
  })

  it('lowers risk for an oxygen-poor atmosphere', () => {
    expect(simulateRisk({ ...base, o2Percent: 15 }).risk).toBeLessThan(
      simulateRisk({ ...base, o2Percent: 21 }).risk,
    )
  })

  it('keeps cotton above Nomex', () => {
    expect(simulateRisk({ ...base, materialId: 'cotton' }).risk).toBeGreaterThan(
      simulateRisk({ ...base, materialId: 'nomex' }).risk,
    )
  })

  it('scores microgravity above normal gravity', () => {
    expect(simulateRisk({ ...base, gravityG: 0 }).risk).toBeGreaterThan(
      simulateRisk({ ...base, gravityG: 1 }).risk,
    )
  })

  it('raises risk for more ventilation over a solid surface', () => {
    expect(simulateRisk({ ...base, flowCmPerS: 20 }).risk).toBeGreaterThan(
      simulateRisk({ ...base, flowCmPerS: 0 }).risk,
    )
  })

  it('raises risk for a low-pressure cabin rather than assuming it is safer', () => {
    expect(simulateRisk({ ...base, pressureKPa: 40 }).risk).toBeGreaterThan(
      simulateRisk({ ...base, pressureKPa: 101.3 }).risk,
    )
  })

  it('warns about extrapolation in a partial-gravity environment', () => {
    expect(simulateRisk({ ...base, gravityG: 0.16 }).caveats.join(' ')).toMatch(
      /partial-gravity|extrapolat/i,
    )
  })

  it('does not warn about partial-gravity in microgravity', () => {
    expect(simulateRisk(base).caveats.join(' ')).not.toMatch(/no partial-gravity/i)
  })

  it('answers the demo question: 34% oxygen on the Moon is riskier than 21%', () => {
    const cabin = simulateRisk({
      materialId: 'sibal-fabric',
      gravityG: 0.16,
      o2Percent: 21,
      pressureKPa: 101.3,
      flowCmPerS: 5,
    })
    const enriched = simulateRisk({
      materialId: 'sibal-fabric',
      gravityG: 0.16,
      o2Percent: 34,
      pressureKPa: 101.3,
      flowCmPerS: 5,
    })
    expect(enriched.risk).toBeGreaterThan(cabin.risk)
    expect(enriched.level).toBe('critical')
  })
})
