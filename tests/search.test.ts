import { describe, expect, it } from 'vitest'
import { searchExperiments } from '@/lib/search'
import { getExperiments } from '@/lib/data'

const experiments = getExperiments()

const ids = (query: string) => searchExperiments(query, experiments).map((e) => e.id)

describe('searchExperiments', () => {
  it('returns every experiment in source order for an empty query', () => {
    expect(searchExperiments('', experiments)).toHaveLength(experiments.length)
    expect(searchExperiments('   ', experiments).map((e) => e.id)).toEqual(
      experiments.map((e) => e.id),
    )
  })

  it('finds a programme by acronym, case-insensitively', () => {
    expect(ids('SAFFIRE')).toEqual(
      expect.arrayContaining(['saffire-i', 'saffire-iii', 'saffire-vi']),
    )
    expect(ids('saffire')[0]).toMatch(/^saffire-/)
  })

  it('expands fire into flame, combustion and ignition', () => {
    const results = ids('fire')
    expect(results).toContain('saffire-i')
    expect(results).toContain('bass')
    expect(results.length).toBeGreaterThan(10)
  })

  it('treats zero g as microgravity', () => {
    expect(ids('zero g').length).toBeGreaterThan(10)
  })

  it('ranks the oxygen-enriched investigations for an oxygen query', () => {
    const results = ids('oxygen')
    expect(results).toEqual(
      expect.arrayContaining(['saffire-vi', 'sofie-gel', 'acme-flame-design']),
    )
    expect(['saffire-vi', 'sofie-gel', 'acme-flame-design']).toContain(results[0])
  })

  it('requires every term to match, not just one', () => {
    const both = ids('cotton nomex')
    expect(both).toContain('saffire-vi')
    expect(both.length).toBeLessThan(3)

    const impossible = ids('cotton titanium')
    expect(impossible).toHaveLength(0)
  })

  it('maps moon and mars onto the partial-gravity story', () => {
    expect(ids('moon').length).toBeGreaterThan(0)
    expect(ids('mars').length).toBeGreaterThan(0)
  })

  it('finds materials by their common name', () => {
    expect(ids('fabric')).toEqual(expect.arrayContaining(['saffire-i', 'saffire-iii']))
    expect(ids('plastic')).toEqual(expect.arrayContaining(['saffire-vi']))
  })

  it('returns an empty list instead of throwing for nonsense', () => {
    expect(ids('qzxv')).toHaveLength(0)
  })

  it('does not mutate the input array', () => {
    const copy = [...experiments]
    searchExperiments('fire', copy)
    expect(copy.map((e) => e.id)).toEqual(experiments.map((e) => e.id))
  })
})
