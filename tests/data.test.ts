import { describe, expect, it } from 'vitest'
import {
  getExperiment,
  getExperiments,
  getFinding,
  getFindings,
  getGlossary,
  getGlossaryTerm,
  getMaterials,
  getTimeline,
} from '@/lib/data'

describe('getExperiments', () => {
  it('returns the full twenty-record evidence base', () => {
    expect(getExperiments()).toHaveLength(20)
  })

  it('gives every record a unique kebab-case id', () => {
    const ids = getExperiments().map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('gives every record at least one finding and one resolvable source', () => {
    for (const experiment of getExperiments()) {
      expect(experiment.findings.length).toBeGreaterThan(0)
      expect(experiment.sources.length).toBeGreaterThan(0)
      for (const source of experiment.sources) {
        expect(source.title.length).toBeGreaterThan(0)
        expect(source.org.length).toBeGreaterThan(0)
        expect(source.url).toMatch(/^https:\/\/[a-z0-9.-]*nasa\.gov\//)
      }
    }
  })

  it('never emits a NaN, Infinity or undefined metric value', () => {
    for (const experiment of getExperiments()) {
      for (const metric of experiment.metrics) {
        const valid = metric.value === null || Number.isFinite(metric.value)
        expect(valid, `${experiment.id}:${metric.key}`).toBe(true)
      }
    }
  })

  it('keeps every year range ordered and plausibly dated', () => {
    for (const experiment of getExperiments()) {
      const [start, end] = experiment.years
      expect(start).toBeGreaterThanOrEqual(1970)
      if (end !== null) {
        expect(end).toBeGreaterThanOrEqual(start)
        expect(end).toBeLessThanOrEqual(2026)
      }
    }
  })

  it('covers the three facilities the narrative depends on', () => {
    const facilities = new Set(getExperiments().map((e) => e.facility))
    expect(facilities.has('Free-flyer')).toBe(true)
    expect(facilities.has('ISS-CIR')).toBe(true)
    expect(facilities.has('Drop-tower')).toBe(true)
  })

  it('is read-only from the caller side', () => {
    const first = getExperiments()
    first.pop()
    expect(getExperiments()).toHaveLength(20)
  })
})

describe('getExperiment', () => {
  it('finds a record by id', () => {
    expect(getExperiment('saffire-i')?.acronym).toBe('Saffire-I')
    expect(getExperiment('sofie-gel')?.acronym).toBe('SoFIE-GEL')
  })

  it('returns undefined for an unknown id instead of throwing', () => {
    expect(getExperiment('not-a-thing')).toBeUndefined()
  })
})

describe('getFindings and getFinding', () => {
  it('flattens every finding with unique ids', () => {
    const findings = getFindings()
    expect(findings.length).toBeGreaterThanOrEqual(40)
    const ids = findings.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves a finding id back to its experiment', () => {
    const resolved = getFinding('saffire-i-f1')
    expect(resolved?.experiment.id).toBe('saffire-i')
    expect(resolved?.finding.tags.length).toBeGreaterThan(0)
  })

  it('returns undefined for an unknown finding id', () => {
    expect(getFinding('nope-f1')).toBeUndefined()
  })
})

describe('getMaterials', () => {
  it('returns a non-empty material list with unique ids', () => {
    const materials = getMaterials()
    expect(materials.length).toBeGreaterThanOrEqual(6)
    expect(new Set(materials.map((m) => m.id)).size).toBe(materials.length)
  })

  it('grounds every material in findings that exist', () => {
    const findingIds = new Set(getFindings().map((f) => f.id))
    for (const material of getMaterials()) {
      expect(material.evidenceIds.length).toBeGreaterThan(0)
      for (const id of material.evidenceIds) {
        expect(findingIds.has(id), `${material.id} -> ${id}`).toBe(true)
      }
    }
  })

  it('keeps the qualitative flammability index in range', () => {
    for (const material of getMaterials()) {
      expect(material.baseFlammability).toBeGreaterThanOrEqual(0)
      expect(material.baseFlammability).toBeLessThanOrEqual(100)
    }
  })
})

describe('getTimeline', () => {
  it('returns events in ascending year order', () => {
    const years = getTimeline().map((e) => e.year)
    expect(years).toEqual([...years].sort((a, b) => a - b))
  })

  it('only references experiments that exist', () => {
    const ids = new Set(getExperiments().map((e) => e.id))
    for (const event of getTimeline()) {
      expect(event.experimentIds.length).toBeGreaterThan(0)
      for (const id of event.experimentIds) expect(ids.has(id)).toBe(true)
    }
  })

  it('marks the first year of each investigation family as a milestone', () => {
    const milestones = getTimeline().filter((e) => e.milestone)
    expect(milestones.map((e) => e.year)).toContain(2016)
    expect(milestones.map((e) => e.year)).toContain(2022)
    expect(milestones.length).toBeGreaterThanOrEqual(5)
  })

  it('accounts for every experiment exactly once', () => {
    const seen = getTimeline().flatMap((e) => e.experimentIds)
    expect(seen.length).toBe(getExperiments().length)
    expect(new Set(seen).size).toBe(seen.length)
  })
})

describe('getGlossary', () => {
  it('returns terms with unique ids and plain-language definitions', () => {
    const terms = getGlossary()
    expect(terms.length).toBeGreaterThanOrEqual(10)
    expect(new Set(terms.map((t) => t.id)).size).toBe(terms.length)
    for (const term of terms) {
      expect(term.plain.length).toBeGreaterThan(20)
      expect(term.technical.length).toBeGreaterThan(20)
    }
  })

  it('only relates terms that exist', () => {
    const ids = new Set(getGlossary().map((t) => t.id))
    for (const term of getGlossary()) {
      for (const related of term.related) expect(ids.has(related)).toBe(true)
    }
  })

  it('looks a term up by id', () => {
    expect(getGlossaryTerm('microgravity')?.term).toMatch(/microgravity/i)
    expect(getGlossaryTerm('nope')).toBeUndefined()
  })
})
