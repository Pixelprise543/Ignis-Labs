/**
 * GET /api/nasa?q=<query>&limit=<1..8> - NASA technical report lookup.
 *
 * Why this proxy exists: ntrs.nasa.gov (NASA's public Technical Reports Server)
 * returns no `Access-Control-Allow-Origin` header, so a browser cannot call it
 * directly. This route is the only place in Ignis that talks to NTRS.
 *
 * Edge runtime for the same reason as api/si.ts: Vercel bundles the module
 * graph, so a deployment cannot fail on an unresolved import.
 *
 * Honesty: titles and abstracts are returned exactly as NTRS publishes them,
 * truncated for display but never paraphrased and never turned into a metric.
 */

import type { NasaPublication } from '../src/lib/nasaTypes'

export const config = { runtime: 'edge' }

const NTRS_SEARCH = 'https://ntrs.nasa.gov/api/citations/search'
const NTRS_ORIGIN = 'https://ntrs.nasa.gov'
const MAX_QUERY = 120
const MAX_ABSTRACT = 1200
const MAX_LIMIT = 8
const DEFAULT_LIMIT = 6

interface NtrsDownload {
  links?: { pdf?: string }
}

interface NtrsResult {
  id?: number | string
  title?: string
  abstract?: string
  stiTypeDetails?: string
  stiType?: string
  distributionDate?: string
  otherReportNumbers?: string[]
  center?: { code?: string; name?: string }
  authorAffiliations?: Array<{ meta?: { author?: { name?: string } } }>
  downloads?: NtrsDownload[]
}

function json(body: unknown, status: number, cache = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  })
}

/** "2019-07-12T00:00:00.0000000+00:00" -> 2019 */
function yearOf(date: string | undefined): number | null {
  const match = date?.match(/^(\d{4})-/)
  return match ? Number(match[1]) : null
}

/** NTRS duplicates report numbers as "Report Number: GRC-E-DAA-TN31879". */
function reportNumberOf(values: string[] | undefined): string | null {
  for (const raw of values ?? []) {
    const cleaned = raw.replace(/^report number:\s*/i, '').trim()
    if (cleaned !== '') return cleaned
  }
  return null
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const boundary = cut.lastIndexOf(' ')
  return `${(boundary > limit * 0.6 ? cut.slice(0, boundary) : cut).trimEnd()}…`
}

export function mapNtrsResult(raw: NtrsResult): NasaPublication | null {
  const id = raw.id === undefined || raw.id === null ? '' : String(raw.id)
  const title = raw.title?.trim() ?? ''
  if (id === '' || title === '') return null

  const pdf = raw.downloads?.find((download) => download.links?.pdf)?.links?.pdf
  const abstract = raw.abstract?.trim()

  return {
    id,
    title,
    abstract: abstract && abstract !== '' ? truncate(abstract, MAX_ABSTRACT) : null,
    year: yearOf(raw.distributionDate),
    reportNumber: reportNumberOf(raw.otherReportNumbers),
    center: raw.center?.name ?? raw.center?.code ?? null,
    authors: (raw.authorAffiliations ?? [])
      .map((entry) => entry.meta?.author?.name?.trim())
      .filter((name): name is string => Boolean(name))
      .slice(0, 4),
    documentType: raw.stiTypeDetails ?? raw.stiType?.replace(/_/g, ' ').toLowerCase() ?? null,
    pdfUrl: pdf ? `${NTRS_ORIGIN}${pdf.startsWith('/') ? '' : '/'}${pdf}` : null,
    url: `${NTRS_ORIGIN}/citations/${id}`,
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return json({ error: 'Use GET for /api/nasa' }, 405)
  }

  const url = new URL(req.url)
  const query = (url.searchParams.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY)
  if (query === '') {
    return json({ error: 'q is required' }, 400)
  }

  const requested = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
  const limit = Number.isFinite(requested)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(requested)))
    : DEFAULT_LIMIT

  const upstream = new URL(NTRS_SEARCH)
  upstream.searchParams.set('q', query)
  upstream.searchParams.set('page.size', String(limit))
  upstream.searchParams.set('page.from', '0')

  let payload: { stats?: { total?: number }; results?: NtrsResult[] }
  try {
    const response = await fetch(upstream.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) {
      return json({ error: 'NASA NTRS did not answer', detail: `HTTP ${response.status}` }, 502)
    }
    payload = (await response.json()) as typeof payload
  } catch (error) {
    return json(
      {
        error: 'NASA NTRS could not be reached',
        detail: error instanceof Error ? error.message : String(error),
      },
      502,
    )
  }

  const results = (payload.results ?? [])
    .map(mapNtrsResult)
    .filter((publication): publication is NasaPublication => publication !== null)
    .slice(0, limit)

  // Six hours of shared cache keeps us far inside the NTRS rate limit (500 per
  // window) without ever serving a year-old page.
  return json(
    {
      query,
      retrievedAt: new Date().toISOString(),
      total: payload.stats?.total ?? results.length,
      results,
    },
    200,
    'public, s-maxage=21600, stale-while-revalidate=86400',
  )
}
