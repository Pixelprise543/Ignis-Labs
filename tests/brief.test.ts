import { describe, expect, it } from 'vitest'
import { buildBriefMarkdown } from '@/lib/brief'
import { defaultWeights, rankExperiments } from '@/lib/scoring'
import { getExperiments, getFinding } from '@/lib/data'
import { getScenario } from '@/lib/scenarios'

const brief = (id: 'iss' | 'lunar' | 'mars' | 'eva', compareIds: string[] = []) =>
  buildBriefMarkdown(getScenario(id), defaultWeights, compareIds)

describe('buildBriefMarkdown: structure', () => {
  it('starts with the brief title and names the scenario', () => {
    const markdown = brief('mars')
    expect(markdown.startsWith('# Ignis Mission Safety Brief')).toBe(true)
    expect(markdown).toContain('Mars transit')
    expect(markdown).toContain('0.38 g')
  })

  it('has the sections a reader expects', () => {
    const markdown = brief('iss')
    for (const heading of [
      '## Scenario',
      '## Executive summary',
      '## Ranked experiments',
      '## Evidence gaps',
      '## Crew response',
      '## Sources',
      '## Limitations',
    ]) {
      expect(markdown, heading).toContain(heading)
    }
  })

  it('puts the top-ranked experiment in the brief', () => {
    const top = rankExperiments(getExperiments(), defaultWeights, getScenario('iss'))[0]
    expect(brief('iss')).toContain(top.experiment.acronym)
  })

  it('summarises the three most urgent insights', () => {
    const markdown = brief('eva')
    expect(markdown).toContain('Oxygen enrichment lowers the fire-safety margin')
    expect(markdown).toContain('critical')
  })

  it('marks a notional habitat as an assumption', () => {
    expect(brief('lunar')).toMatch(/notional design point/i)
  })

  it('does not mark the ISS cabin as an assumption', () => {
    expect(brief('iss')).not.toMatch(/notional design point/i)
    expect(brief('iss')).toMatch(/operational reference/i)
  })

  it('lists partial-gravity gaps for a lunar brief', () => {
    const markdown = brief('lunar')
    expect(markdown).toMatch(/partial-gravity/)
    expect(markdown).toMatch(/no partial-gravity flame-spread data/i)
  })

  it('writes the crew response steps', () => {
    const markdown = brief('iss')
    expect(markdown).toMatch(/\*\*Detect\.\*\*/)
    expect(markdown).toMatch(/\*\*Recover\.\*\*/)
  })

  it('links to a real NASA source', () => {
    expect(brief('iss')).toMatch(/https:\/\/[a-z0-9.-]*nasa\.gov\//)
  })

  it('carries the honesty line', () => {
    expect(brief('iss')).toMatch(/decision-support estimates, not physics simulations/i)
  })

  it('states the confidence split of the dataset', () => {
    expect(brief('iss')).toMatch(/\d+ verified/i)
    expect(brief('iss')).toMatch(/\d+ curated/i)
  })

  it('is deterministic', () => {
    expect(brief('mars')).toBe(brief('mars'))
  })
})

describe('buildBriefMarkdown: citations', () => {
  it('only prints finding ids that exist', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      const markdown = brief(id, ['saffire-i', 'sofie-gel'])
      const tokens = markdown.match(/\b[a-z0-9]+(?:-[a-z0-9]+)*-f\d+\b/g) ?? []
      expect(tokens.length, id).toBeGreaterThan(0)
      for (const token of tokens) {
        expect(getFinding(token), `${id}: ${token}`).toBeDefined()
      }
    }
  })
})

describe('buildBriefMarkdown: compare section', () => {
  it('omits the compare section when nothing is selected', () => {
    expect(brief('iss')).not.toContain('## Compare')
  })

  it('includes a row for every selected experiment', () => {
    const markdown = brief('iss', ['saffire-i', 'sofie-gel'])
    expect(markdown).toContain('## Compare')
    expect(markdown).toContain('Saffire-I')
    expect(markdown).toContain('SoFIE-GEL')
  })

  it('drops unknown or duplicate compare ids', () => {
    const markdown = brief('iss', ['saffire-i', 'not-real', 'saffire-i'])
    expect(markdown).toContain('## Compare')
    expect(markdown.match(/Saffire-I/g)?.length).toBeGreaterThanOrEqual(1)
    expect(markdown).not.toContain('not-real')
  })

  it('omits the section when every compare id is unknown', () => {
    expect(brief('iss', ['not-real'])).not.toContain('## Compare')
  })
})
