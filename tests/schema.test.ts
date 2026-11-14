import { describe, expect, it } from 'vitest'
import { checkExperiments, experimentSchema, validateDataset } from '@/lib/schema'
import { getExperiments } from '@/lib/data'
import type { Experiment } from '@/contracts/types'

describe('validateDataset', () => {
  it('passes on the shipped dataset', () => {
    expect(validateDataset()).toEqual([])
  })

  it('covers every experiment exactly once', () => {
    const ids = getExperiments().map((experiment) => experiment.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('experimentSchema', () => {
  const [valid] = getExperiments()

  it('accepts a real record', () => {
    expect(experimentSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an empty source list', () => {
    const broken = { ...valid, sources: [] }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects an unknown confidence tier', () => {
    const broken = { ...valid, confidence: 'probably-fine' }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects a non-kebab-case id', () => {
    const broken = { ...valid, id: 'Saffire I' }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })
})

describe('checkExperiments', () => {
  const [first, second] = getExperiments()

  const withFindingIds = (experiment: Experiment, suffix: string): Experiment => ({
    ...experiment,
    findings: experiment.findings.map((finding, index) => ({
      ...finding,
      id: `copied-${suffix}-${index}-f${index + 1}`,
    })),
  })

  it('reports a duplicate experiment id', () => {
    const issues = checkExperiments([first, withFindingIds(first, 'a')])
    expect(issues.map((issue) => issue.code)).toContain('duplicate-id')
  })

  it('reports a duplicate finding id', () => {
    const broken: Experiment = { ...second, findings: [...second.findings, first.findings[0]] }
    const issues = checkExperiments([first, broken])
    const duplicate = issues.find((issue) => issue.code === 'duplicate-finding')
    expect(duplicate).toBeDefined()
    expect(duplicate?.message).toContain(first.findings[0]?.id)
  })

  it('reports years that end before they start', () => {
    const broken: Experiment = { ...second, years: [2020, 2010] }
    const issues = checkExperiments([broken])
    expect(issues.map((issue) => issue.code)).toContain('year-order')
  })

  it('reports a repeated metric key inside one record', () => {
    const metric = first.metrics[0]
    const broken: Experiment = { ...first, metrics: [metric, { ...metric }] }
    const issues = checkExperiments([broken])
    expect(issues.map((issue) => issue.code)).toContain('duplicate-metric-key')
  })
})
