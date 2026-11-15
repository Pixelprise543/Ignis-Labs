import { describe, expect, it, vi } from 'vitest'

/**
 * The fallback branch, proved live.
 *
 * Part of the app says "no partial-gravity data exists" and part says "the only
 * partial-gravity evidence is at lunar gravity". Which sentence is correct
 * depends on the dataset, not on a date in a comment - so the dataset here is
 * mocked to contain no partial-gravity record, and every one of those sentences
 * must flip back to the honest "we have nothing" wording.
 *
 * Only `getExperiments` is replaced. Everything else (finding lookup, materials,
 * scenarios) is the real implementation, so this exercises the shipped code path
 * rather than a parallel fake of it.
 */
vi.mock('@/lib/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data')>()
  return {
    ...actual,
    getExperiments: () =>
      actual.getExperiments().filter((experiment) => experiment.regime !== 'partial-g'),
    getExperiment: (id: string) =>
      actual.getExperiments().find((experiment) => experiment.id === id),
  }
})

const { hasPartialGravityData, maxMeasuredPartialGravityG } = await import('@/lib/coverage')
const { getInsights } = await import('@/lib/insights')
const { buildBriefMarkdown } = await import('@/lib/brief')
const { getMaterialRisks } = await import('@/lib/materials')
const { getPlaybook } = await import('@/lib/playbook')
const { getScenario } = await import('@/lib/scenarios')
const { defaultWeights } = await import('@/lib/scoring')

describe('partial-gravity copy when the dataset has no partial-g record', () => {
  it('reports the absence through the coverage helpers', () => {
    expect(hasPartialGravityData()).toBe(false)
    expect(maxMeasuredPartialGravityG()).toBeNull()
  })

  it('swaps the insights rule back to "no partial-gravity flame-spread data exists"', () => {
    const ids = getInsights(getScenario('lunar')).map((insight) => insight.id)
    expect(ids).toContain('no-partial-gravity-data')
    expect(ids).not.toContain('partial-gravity-evidence-thin')

    const rule = getInsights(getScenario('lunar')).find(
      (insight) => insight.id === 'no-partial-gravity-data',
    )
    expect(rule?.summary).toMatch(/no experiment in this dataset/i)
    expect(rule?.summary).not.toMatch(/lunar gravity \(about 0\.16 g\)/i)
  })

  it('prints the extrapolation warning in the brief, not an interpolation', () => {
    const brief = buildBriefMarkdown(getScenario('mars'), defaultWeights, [])
    expect(brief).toContain('No partial-gravity flame-spread data exists in this dataset')
    expect(brief).not.toContain('Partial-gravity data exists for lunar gravity')
  })

  it('calls every material row an extrapolation from microgravity evidence', () => {
    for (const entry of getMaterialRisks(getScenario('lunar'))) {
      expect(entry.rationale).toContain('extrapolation from microgravity evidence')
    }
  })

  it('keeps the playbook caveat honest about extrapolating', () => {
    const caveats = getPlaybook('mars').caveats.join(' ')
    expect(caveats).toContain('No partial-gravity flame-spread data exists in this dataset')
    expect(caveats).not.toContain('interpolates')
  })

  it('leaves the microgravity scenarios untouched', () => {
    const brief = buildBriefMarkdown(getScenario('iss'), defaultWeights, [])
    expect(brief).not.toContain('partial-gravity')
    for (const entry of getMaterialRisks(getScenario('iss'))) {
      expect(entry.rationale).not.toContain('extrapolation')
    }
  })
})
