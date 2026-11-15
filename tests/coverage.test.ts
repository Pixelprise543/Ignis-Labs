import { describe, expect, it } from 'vitest'
import {
  COVERAGE_GRAVITY_BANDS,
  COVERAGE_O2_BANDS,
  GRAVITY_BANDS,
  O2_BANDS,
  O2_NOT_REPORTED_BAND,
  getCoverage,
  getGaps,
  getPartialGravityExperiments,
  hasPartialGravityData,
  maxMeasuredPartialGravityG,
} from '@/lib/coverage'
import { getExperiments } from '@/lib/data'
import { getScenario } from '@/lib/scenarios'

describe('getCoverage', () => {
  it('returns a full 3 x 4 grid of gravity and oxygen bands', () => {
    const cells = getCoverage()
    expect(cells).toHaveLength(12)
    expect(new Set(cells.map((cell) => `${cell.gravityBand}|${cell.o2Band}`)).size).toBe(12)
  })

  it('partitions every experiment into exactly one cell', () => {
    const ids = getCoverage().flatMap((cell) => cell.experimentIds)
    expect(ids).toHaveLength(getExperiments().length)
    expect(new Set(ids).size).toBe(ids.length)
    expect(getCoverage().reduce((sum, cell) => sum + cell.count, 0)).toBe(getExperiments().length)
  })

  it('keeps count and gap flag consistent', () => {
    for (const cell of getCoverage()) {
      expect(cell.count).toBe(cell.experimentIds.length)
      expect(cell.gap).toBe(cell.count === 0)
    }
  })

  it('fills the partial-gravity row from lunar records instead of leaving it empty', () => {
    const partial = getCoverage().filter((cell) => cell.gravityBand === 'partial-gravity')
    expect(partial).toHaveLength(4)
    const populated = partial.filter((cell) => cell.count > 0)
    expect(populated.length).toBeGreaterThan(0)
    for (const cell of populated) {
      for (const id of cell.experimentIds) {
        expect(getExperiments().find((experiment) => experiment.id === id)?.regime).toBe('partial-g')
      }
    }
    // Mars gravity (0.38 g) is still outside anything measured.
    expect(maxMeasuredPartialGravityG()).toBeLessThan(0.38)
  })

  it('has at least one populated microgravity cell', () => {
    const micro = getCoverage().filter((cell) => cell.gravityBand === 'microgravity')
    expect(micro.some((cell) => cell.count > 0)).toBe(true)
  })

  it('maps each band to the scenarios that live in it', () => {
    for (const cell of getCoverage()) {
      if (cell.gravityBand === 'partial-gravity') {
        expect(cell.relevantScenarios).toEqual(expect.arrayContaining(['lunar', 'mars', 'custom']))
      }
      if (cell.gravityBand === 'microgravity') {
        expect(cell.relevantScenarios).toEqual(expect.arrayContaining(['iss', 'eva']))
      }
      expect(cell.relevantScenarios.length).toBeGreaterThan(0)
    }
  })

  it('is sorted by gravity band then oxygen band', () => {
    const gravity = getCoverage().map((cell) => cell.gravityBand)
    expect(gravity).toEqual([
      'microgravity',
      'microgravity',
      'microgravity',
      'microgravity',
      'partial-gravity',
      'partial-gravity',
      'partial-gravity',
      'partial-gravity',
      'normal-gravity',
      'normal-gravity',
      'normal-gravity',
      'normal-gravity',
    ])
  })

  it('returns a fresh array the caller can mutate', () => {
    const first = getCoverage()
    first[0].experimentIds.push('tampered')
    expect(getCoverage().flatMap((cell) => cell.experimentIds)).not.toContain('tampered')
  })
})

describe('getGaps', () => {
  it('returns only empty cells in the scenario gravity band', () => {
    for (const scenario of [getScenario('iss'), getScenario('lunar'), getScenario('mars'), getScenario('eva')]) {
      const gaps = getGaps(scenario)
      expect(gaps.every((cell) => cell.gap)).toBe(true)
      expect(gaps.every((cell) => cell.relevantScenarios.includes(scenario.id))).toBe(true)
    }
  })

  it('reports only the still-empty partial-gravity cells for lunar and Mars', () => {
    for (const id of ['lunar', 'mars'] as const) {
      const gaps = getGaps(getScenario(id))
      expect(gaps.every((cell) => cell.gravityBand === 'partial-gravity')).toBe(true)
      // Lunar evidence fills some cells, so Mars (0.38 g) now has a real gap and
      // lunar keeps only the atmosphere bands nobody flew.
      expect(gaps.length).toBeGreaterThan(0)
      expect(gaps.length).toBeLessThan(4)
    }
  })

  it('does not report the partial-gravity row for the ISS cabin', () => {
    for (const cell of getGaps(getScenario('iss'))) {
      expect(cell.gravityBand).toBe('microgravity')
    }
  })

  it('does not return populated cells', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      for (const cell of getGaps(getScenario(id))) expect(cell.count).toBe(0)
    }
  })

  it('returns a copy', () => {
    const first = getGaps(getScenario('lunar'))
    const before = first.length
    first.pop()
    expect(getGaps(getScenario('lunar'))).toHaveLength(before)
  })
})

describe('partial-gravity helpers', () => {
  it('returns only partial-gravity records, and says the data exists', () => {
    const records = getPartialGravityExperiments()
    expect(records.length).toBeGreaterThan(0)
    for (const experiment of records) expect(experiment.regime).toBe('partial-g')
    expect(hasPartialGravityData()).toBe(true)
  })

  it('reports the highest measured partial gravity so Mars can be called extrapolation', () => {
    const measured = maxMeasuredPartialGravityG()
    expect(measured).toBeGreaterThan(0)
    expect(measured).toBeLessThan(1)
    expect(measured).toBeCloseTo(
      Math.max(...getPartialGravityExperiments().map((e) => e.conditions.gravityG)),
      5,
    )
  })

  it('hands back a fresh array, so a caller cannot drop a record', () => {
    const first = getPartialGravityExperiments()
    const before = first.length
    first.pop()
    expect(getPartialGravityExperiments()).toHaveLength(before)
  })
})

describe('band metadata', () => {
  it('labels the gravity bands with the values the cells carry', () => {
    expect(COVERAGE_GRAVITY_BANDS.map((band) => band.label)).toEqual([...GRAVITY_BANDS])
    expect(COVERAGE_GRAVITY_BANDS.map((band) => band.id)).toEqual([...GRAVITY_BANDS])
    for (const band of COVERAGE_GRAVITY_BANDS) {
      expect(getCoverage().some((cell) => cell.gravityBand === band.label)).toBe(true)
    }
  })

  it('labels the numeric oxygen bands, with the missing band named separately', () => {
    expect(COVERAGE_O2_BANDS.map((band) => band.label)).toEqual(
      O2_BANDS.filter((band) => band !== O2_NOT_REPORTED_BAND),
    )
    expect(O2_NOT_REPORTED_BAND).toBe('not specified')
    expect(new Set([...COVERAGE_O2_BANDS.map((band) => band.label), O2_NOT_REPORTED_BAND])).toEqual(
      new Set(O2_BANDS),
    )
  })

  it('matches exactly one gravity band per gravity value, including both edges', () => {
    for (const gravityG of [0, 0.009, 0.01, 0.5, 0.899, 0.9, 1, 3.7]) {
      const matched = COVERAGE_GRAVITY_BANDS.filter((band) => band.matches(gravityG))
      expect(matched, `gravity ${gravityG}`).toHaveLength(1)
    }
    expect(COVERAGE_GRAVITY_BANDS.find((band) => band.matches(0))?.label).toBe('microgravity')
    expect(COVERAGE_GRAVITY_BANDS.find((band) => band.matches(0.16))?.label).toBe('partial-gravity')
    expect(COVERAGE_GRAVITY_BANDS.find((band) => band.matches(1))?.label).toBe('normal-gravity')
  })

  it('matches exactly one numeric oxygen band per value, including both edges', () => {
    for (const o2Percent of [0, 21, 21.5, 30, 30.1, 100]) {
      const matched = COVERAGE_O2_BANDS.filter((band) => band.matches(o2Percent))
      expect(matched, `oxygen ${o2Percent}`).toHaveLength(1)
    }
    expect(COVERAGE_O2_BANDS.find((band) => band.matches(21))?.label).toBe('<= 21%')
    expect(COVERAGE_O2_BANDS.find((band) => band.matches(30))?.label).toBe('21-30%')
    expect(COVERAGE_O2_BANDS.find((band) => band.matches(30.1))?.label).toBe('> 30%')
  })

  it('agrees with the cells the dataset produces', () => {
    for (const cell of getCoverage()) {
      expect(GRAVITY_BANDS).toContain(cell.gravityBand)
      expect(O2_BANDS).toContain(cell.o2Band)
    }
  })
})
