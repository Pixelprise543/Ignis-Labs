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

  it('rejects a null metric value with no explanation', () => {
    const broken = {
      ...valid,
      metrics: [{ key: 'burn-duration', label: 'Burn duration', unit: 'min', value: null }],
    }
    const parsed = experimentSchema.safeParse(broken)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/needs a note explaining why/i)
    }
  })

  it('accepts a null metric value that says why it is null', () => {
    const broken = {
      ...valid,
      metrics: [
        {
          key: 'burn-duration',
          label: 'Burn duration',
          unit: 'min',
          value: null,
          note: 'Not stated in the retrieved report.',
        },
      ],
    }
    expect(experimentSchema.safeParse(broken).success).toBe(true)
  })

  it('rejects a zero-pressure condition, because 0 would mean vacuum, not "unknown"', () => {
    const broken = { ...valid, conditions: { ...valid.conditions, pressureKPa: 0 } }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects an oxygen fraction outside 0-100', () => {
    const broken = { ...valid, conditions: { ...valid.conditions, o2Percent: 101 } }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects a gravity value outside 0-2 g', () => {
    const broken = { ...valid, conditions: { ...valid.conditions, gravityG: 2.5 } }
    expect(experimentSchema.safeParse(broken).success).toBe(false)
  })

  it('rejects a year outside 1900-2100', () => {
    const broken = { ...valid, years: [1899, null] }
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

  it('reports a finding that does not carry its experiment id', () => {
    const broken: Experiment = {
      ...first,
      findings: [{ ...first.findings[0], id: 'borrowed-f1' }],
    }
    const issues = checkExperiments([broken])
    const issue = issues.find((entry) => entry.code === 'finding-id-prefix')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain(first.id)
  })

  it('reports one finding sentence reused across two records', () => {
    const broken: Experiment = {
      ...second,
      findings: [
        ...second.findings.slice(1),
        { ...second.findings[0], id: `${second.id}-f9`, text: first.findings[0].text },
      ],
    }
    const issues = checkExperiments([first, broken])
    const issue = issues.find((entry) => entry.code === 'duplicate-finding-text')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain(first.id)
    expect(issue?.message).toContain(second.id)
  })

  it('reports a verified record that cites a non-NASA source', () => {
    const broken: Experiment = {
      ...first,
      confidence: 'verified',
      sources: [
        {
          title: 'A blog post about fire',
          url: 'https://example.com/fire',
          org: 'Somewhere',
        },
      ],
    }
    const issues = checkExperiments([broken])
    const issue = issues.find((entry) => entry.code === 'source-host')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain('example.com')
  })

  it('allows an illustrative record to cite a non-NASA page', () => {
    const broken: Experiment = {
      ...first,
      id: 'illustrative-example',
      confidence: 'illustrative',
      findings: first.findings.map((finding, index) => ({
        ...finding,
        id: `illustrative-example-f${index + 1}`,
        text: `${finding.text} (example only)`,
      })),
      sources: [{ title: 'Placeholder source', url: 'https://example.com/a', org: 'Example' }],
    }
    const codes = checkExperiments([broken]).map((issue) => issue.code)
    expect(codes).not.toContain('source-host')
  })

  it('reports a regime that disagrees with the numeric gravity', () => {
    const broken: Experiment = {
      ...first,
      regime: 'microgravity',
      conditions: { ...first.conditions, gravityG: 0.5 },
    }
    const issues = checkExperiments([broken])
    expect(issues.map((issue) => issue.code)).toContain('regime-gravity')
  })

  it('reports filler text in copy a reader is asked to trust', () => {
    const broken: Experiment = { ...first, safetyTakeaway: 'TODO: write the takeaway here' }
    const issues = checkExperiments([broken])
    expect(issues.map((issue) => issue.code)).toContain('placeholder-copy')
  })

  it('flags an illustrative record so the UI cannot present it as fact', () => {
    const broken: Experiment = { ...first, confidence: 'illustrative' }
    const issues = checkExperiments([broken])
    expect(issues.map((issue) => issue.code)).toContain('illustrative-record')
  })
})
