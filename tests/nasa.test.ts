import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { mapNtrsResult } from '../api/nasa'
import { buildSearchQuery, findNasaPublications, formatRetrievedAt } from '@/lib/nasa'

/**
 * The literature lookup has one job that matters: return NASA's own words and
 * links, or nothing. These tests pin the parts that could quietly invent data -
 * the query mapping, the field mapping and the fallback order.
 */

const liveBody = {
  query: 'oxygen flammability',
  retrievedAt: '2026-11-15T07:08:01.794Z',
  total: 264,
  results: [
    {
      id: '20240008623',
      title: 'Flammability of Materials on the Moon',
      abstract: 'A test abstract about oxygen and lunar habitats.',
      year: 2024,
      reportNumber: 'ICES-2024-365',
      center: 'Glenn Research Center',
      authors: ['Ruff, Gary A.'],
      documentType: 'Conference Paper',
      pdfUrl: 'https://ntrs.nasa.gov/api/citations/20240008623/downloads/20240008623.pdf',
      url: 'https://ntrs.nasa.gov/citations/20240008623',
    },
  ],
}

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('buildSearchQuery', () => {
  it('maps an oxygen question onto the oxygen literature query', () => {
    expect(buildSearchQuery('Is a 34% oxygen cabin riskier on the Moon?')).toBe(
      'oxygen flammability',
    )
  })

  it('maps facility names onto their programme query', () => {
    expect(buildSearchQuery('What did Saffire show about large fires?')).toBe(
      'saffire spacecraft fire',
    )
    expect(buildSearchQuery('SoFIE smouldering results')).toBe(
      'solid fuel ignition extinction',
    )
  })

  it('keeps a short keyword fallback for an unmapped question', () => {
    expect(buildSearchQuery('What about titanium plasma vortices?')).toBe(
      'titanium plasma vortices',
    )
  })

  it('returns an empty query for an empty question', () => {
    expect(buildSearchQuery('   ')).toBe('')
  })
})

describe('findNasaPublications', () => {
  it('returns live results and marks the source as live', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(liveBody)))
    const literature = await findNasaPublications('Is a 34% oxygen cabin riskier on the Moon?')
    expect(literature.source).toBe('live')
    expect(literature.query).toBe('oxygen flammability')
    expect(literature.results[0]?.title).toBe('Flammability of Materials on the Moon')
  })

  it('falls back to the baked snapshot when the route is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))))
    const literature = await findNasaPublications('Is a 34% oxygen cabin riskier on the Moon?')
    expect(literature.source).toBe('snapshot')
    expect(literature.results.length).toBeGreaterThan(0)
    expect(literature.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(literature.results.some((result) => /oxygen/i.test(result.title))).toBe(true)
  })

  it('ignores a response that does not match the expected shape', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ surprises: true })))
    const literature = await findNasaPublications('fabric fire suppression')
    expect(literature.source).toBe('snapshot')
    expect(literature.results.length).toBeGreaterThan(0)
  })

  it('returns nothing for an empty question instead of asking NASA', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const literature = await findNasaPublications('')
    expect(literature.results).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('formatRetrievedAt', () => {
  it('renders a UTC date a person can read', () => {
    expect(formatRetrievedAt('2026-11-15T07:08:01.794Z')).toBe('15 Nov 2026')
  })

  it('passes an unparseable value through instead of inventing a date', () => {
    expect(formatRetrievedAt('yesterday')).toBe('yesterday')
  })
})

describe('mapNtrsResult', () => {
  it('copies NTRS fields without inventing any', () => {
    const publication = mapNtrsResult({
      id: 20240008623,
      title: 'Flammability of Materials on the Moon',
      abstract: 'Abstract.',
      stiTypeDetails: 'Conference Paper',
      distributionDate: '2024-07-01T00:00:00.0000000+00:00',
      otherReportNumbers: ['Report Number: ICES-2024-365'],
      center: { code: 'GRC', name: 'Glenn Research Center' },
      authorAffiliations: [{ meta: { author: { name: 'Ruff, Gary A.' } } }],
      downloads: [{ links: { pdf: '/api/citations/20240008623/downloads/20240008623.pdf' } }],
    })
    expect(publication).toMatchObject({
      id: '20240008623',
      year: 2024,
      reportNumber: 'ICES-2024-365',
      center: 'Glenn Research Center',
      documentType: 'Conference Paper',
      pdfUrl: 'https://ntrs.nasa.gov/api/citations/20240008623/downloads/20240008623.pdf',
      url: 'https://ntrs.nasa.gov/citations/20240008623',
      authors: ['Ruff, Gary A.'],
    })
  })

  it('drops a record with no id or title rather than showing a blank row', () => {
    expect(mapNtrsResult({ title: 'No id' })).toBeNull()
    expect(mapNtrsResult({ id: 42 })).toBeNull()
  })
})

describe('GET /api/nasa', () => {
  it('rejects a non-GET method', async () => {
    const response = await handler(
      new Request('https://ignis.local/api/nasa?q=saffire', { method: 'POST' }),
    )
    expect(response.status).toBe(405)
  })

  it('requires a query', async () => {
    const response = await handler(new Request('https://ignis.local/api/nasa?q=%20'))
    expect(response.status).toBe(400)
  })

  it('proxies a public NTRS search and caches it', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ stats: { total: 32 }, results: [] }))
    vi.stubGlobal('fetch', fetchSpy)
    const response = await handler(new Request('https://ignis.local/api/nasa?q=saffire&limit=2'))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('s-maxage=21600')
    const url = new URL(String((fetchSpy.mock.calls[0] as unknown[])[0]))
    expect(url.searchParams.get('q')).toBe('saffire')
    expect(url.searchParams.get('page.size')).toBe('2')
  })

  it('reports an upstream failure as 502 instead of an empty 200', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: 'down' }, false, 503)))
    const response = await handler(new Request('https://ignis.local/api/nasa?q=saffire'))
    expect(response.status).toBe(502)
  })
})
