import { describe, expect, it } from 'vitest'
import {
  SCENARIOS,
  customScenario,
  formatGravity,
  getScenario,
  regimeFor,
} from '@/lib/scenarios'

describe('SCENARIOS presets', () => {
  it('exposes exactly the five scenario ids from the contract', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual(['iss', 'lunar', 'mars', 'eva', 'custom'])
  })

  it('gives every preset the gravity expected of its body', () => {
    expect(getScenario('iss').gravityG).toBe(0)
    expect(getScenario('lunar').gravityG).toBeCloseTo(0.16)
    expect(getScenario('mars').gravityG).toBeCloseTo(0.38)
  })

  it('flags every notional habitat as an assumption and operational values as not', () => {
    expect(getScenario('iss').assumption).toBe(false)
    expect(getScenario('eva').assumption).toBe(false)
    expect(getScenario('lunar').assumption).toBe(true)
    expect(getScenario('mars').assumption).toBe(true)
    expect(getScenario('custom').assumption).toBe(true)
  })

  it('keeps EVA as a pure-oxygen low-pressure suit', () => {
    const eva = getScenario('eva')
    expect(eva.o2Percent).toBe(100)
    expect(eva.pressureKPa).toBeCloseTo(29.6)
  })
})

describe('customScenario', () => {
  it('returns a custom scenario carrying the values it was given', () => {
    const s = customScenario(0.16, 34, 70)
    expect(s.id).toBe('custom')
    expect(s.gravityG).toBeCloseTo(0.16)
    expect(s.o2Percent).toBeCloseTo(34)
    expect(s.pressureKPa).toBeCloseTo(70)
    expect(s.assumption).toBe(true)
  })

  it('clamps values that are physically impossible instead of propagating them', () => {
    const low = customScenario(-2, 0, 0)
    expect(low.gravityG).toBe(0)
    expect(low.o2Percent).toBeGreaterThan(0)
    expect(low.pressureKPa).toBeGreaterThan(0)

    const high = customScenario(9, 120, 400)
    expect(high.gravityG).toBe(2)
    expect(high.o2Percent).toBe(100)
    expect(high.pressureKPa).toBe(150)
  })

  it('never shares state with the preset list', () => {
    const s = customScenario(1, 21, 101.3)
    s.o2Percent = 30
    expect(getScenario('custom').o2Percent).not.toBe(30)
  })
})

describe('regimeFor', () => {
  it('classifies gravity into the three contract regimes', () => {
    expect(regimeFor(0)).toBe('microgravity')
    expect(regimeFor(0.000001)).toBe('microgravity')
    expect(regimeFor(0.16)).toBe('partial-g')
    expect(regimeFor(0.38)).toBe('partial-g')
    expect(regimeFor(1)).toBe('normal-g')
    expect(regimeFor(1.6)).toBe('normal-g')
  })
})

describe('formatGravity', () => {
  it('renders microgravity as 0 g and keeps two significant decimals elsewhere', () => {
    expect(formatGravity(0)).toBe('0 g')
    expect(formatGravity(0.16)).toBe('0.16 g')
    expect(formatGravity(0.38)).toBe('0.38 g')
    expect(formatGravity(1)).toBe('1 g')
    expect(formatGravity(1.6234)).toBe('1.6 g')
  })
})

describe('getScenario', () => {
  it('falls back to the ISS preset for an unknown id at runtime', () => {
    // The type system prevents this, but persisted URL state can be hand-edited.
    expect(getScenario('nope' as never).id).toBe('iss')
  })
})
