import { describe, expect, it } from 'vitest'
import { getMaterialMatrix, getMaterialRisks } from '@/lib/materials'
import { getFinding, getMaterials } from '@/lib/data'
import { getScenario } from '@/lib/scenarios'

const riskOf = (scenarioId: 'iss' | 'lunar' | 'mars' | 'eva', materialId: string) => {
  const risk = getMaterialRisks(getScenario(scenarioId)).find(
    (entry) => entry.materialId === materialId,
  )
  if (!risk) throw new Error(`${materialId} is missing for ${scenarioId}`)
  return risk
}

describe('getMaterialRisks: shape and grounding', () => {
  it('returns one row per material for every preset scenario', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      const risks = getMaterialRisks(getScenario(id))
      expect(risks).toHaveLength(getMaterials().length)
      expect(new Set(risks.map((entry) => entry.materialId)).size).toBe(risks.length)
      for (const entry of risks) expect(entry.scenarioId).toBe(id)
    }
  })

  it('keeps risk inside 0-100 and consistent with the level', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      for (const entry of getMaterialRisks(getScenario(id))) {
        expect(entry.risk).toBeGreaterThanOrEqual(0)
        expect(entry.risk).toBeLessThanOrEqual(100)
        expect(['info', 'caution', 'high', 'critical']).toContain(entry.level)
        const expected =
          entry.risk >= 70 ? 'critical' : entry.risk >= 45 ? 'high' : entry.risk >= 25 ? 'caution' : 'info'
        expect(entry.level).toBe(expected)
      }
    }
  })

  it('cites only findings that exist', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      for (const entry of getMaterialRisks(getScenario(id))) {
        expect(entry.evidenceIds.length).toBeGreaterThan(0)
        for (const findingId of entry.evidenceIds) {
          expect(getFinding(findingId), `${entry.materialId} -> ${findingId}`).toBeDefined()
        }
      }
    }
  })

  it('writes a rationale that names the drivers', () => {
    for (const entry of getMaterialRisks(getScenario('mars'))) {
      expect(entry.rationale.length).toBeGreaterThan(40)
      expect(entry.rationale).toMatch(/qualitative/i)
    }
  })

  it('is deterministic and returns fresh objects', () => {
    const a = getMaterialRisks(getScenario('iss'))
    const b = getMaterialRisks(getScenario('iss'))
    expect(a).toEqual(b)
    a[0].risk = 999
    expect(getMaterialRisks(getScenario('iss'))[0].risk).not.toBe(999)
  })
})

describe('getMaterialRisks: scenario sensitivity', () => {
  it('raises risk in the pure-oxygen suit above the ISS cabin', () => {
    for (const material of getMaterials()) {
      expect(
        riskOf('eva', material.id).risk,
        `${material.id}: ${riskOf('eva', material.id).risk} vs ${riskOf('iss', material.id).risk}`,
      ).toBeGreaterThan(riskOf('iss', material.id).risk)
    }
  })

  it('keeps Nomex below cotton in every scenario', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      expect(riskOf(id, 'nomex').risk).toBeLessThan(riskOf(id, 'cotton').risk)
    }
  })

  it('marks a partial-gravity row as an extrapolation', () => {
    for (const entry of getMaterialRisks(getScenario('lunar'))) {
      expect(entry.rationale).toMatch(/extrapolat/i)
    }
  })

  it('does not call the ISS row an extrapolation', () => {
    for (const entry of getMaterialRisks(getScenario('iss'))) {
      expect(entry.rationale).not.toMatch(/extrapolat/i)
    }
  })
})

describe('getMaterialMatrix', () => {
  it('covers the four preset scenario columns once', () => {
    const matrix = getMaterialMatrix()
    expect(matrix.scenarios.map((scenario) => scenario.id)).toEqual(['iss', 'lunar', 'mars', 'eva'])
  })

  it('has one row per material with a value per scenario', () => {
    const matrix = getMaterialMatrix()
    expect(matrix.rows).toHaveLength(getMaterials().length)
    for (const row of matrix.rows) {
      expect(row.risks).toHaveLength(matrix.scenarios.length)
      for (const risk of row.risks) {
        expect(risk).toBeGreaterThanOrEqual(0)
        expect(risk).toBeLessThanOrEqual(100)
      }
    }
  })

  it('agrees cell by cell with getMaterialRisks', () => {
    const matrix = getMaterialMatrix()
    matrix.scenarios.forEach((scenario, column) => {
      const risks = getMaterialRisks(getScenario(scenario.id))
      for (const row of matrix.rows) {
        const match = risks.find((entry) => entry.materialId === row.material.id)
        expect(match?.risk, `${scenario.id}:${row.material.id}`).toBe(row.risks[column])
      }
    })
  })

  it('is deterministic and returns fresh rows', () => {
    const first = getMaterialMatrix()
    first.rows[0].risks[0] = -1
    const second = getMaterialMatrix()
    expect(second.rows[0].risks[0]).toBeGreaterThanOrEqual(0)
    expect(second).toEqual(getMaterialMatrix())
  })
})
