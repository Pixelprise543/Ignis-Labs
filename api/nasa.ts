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

/**
 * Upstream budget, chosen against the browser's clock rather than the platform's.
 * The client (src/lib/nasa.ts) gives up after 4.5 s and renders the baked
 * snapshot, so two 2.5 s attempts plus a short pause stay inside a budget the
 * user can feel; a 10 s edge retry would finish after nobody is listening.
 */
const UPSTREAM_TIMEOUT_MS = 2500
const UPSTREAM_ATTEMPTS = 2
const RETRY_DELAY_MS = 200

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

interface NtrsPayload {
  stats?: { total?: number }
  results?: NtrsResult[]
}

type UpstreamOutcome =
  | { ok: true; payload: NtrsPayload }
  | { ok: false; status: number; detail: string; retry: boolean; retryAfter?: string }

/** A body is only usable if it looks like the NTRS search envelope. */
function parsePayload(body: unknown): NtrsPayload | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  const candidate = body as NtrsPayload
  if (!Array.isArray(candidate.results)) return null
  const payload: NtrsPayload = { results: candidate.results }
  const total = candidate.stats?.total
  if (typeof total === 'number' && Number.isFinite(total) && total >= 0) {
    payload.stats = { total: Math.trunc(total) }
  }
  return payload
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchOnce(url: string): Promise<UpstreamOutcome> {
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    const timedOut = name === 'AbortError' || name === 'TimeoutError'
    return {
      ok: false,
      status: 502,
      // A timeout is not retried: two slow attempts would outlive the client.
      detail: timedOut
        ? `NASA NTRS did not answer within ${UPSTREAM_TIMEOUT_MS} ms`
        : `NASA NTRS could not be reached: ${error instanceof Error ? error.message : String(error)}`,
      retry: !timedOut,
    }
  }

  if (response.status === 429) {
    return {
      ok: false,
      status: 503,
      detail: 'NASA NTRS is rate-limiting this proxy',
      retry: false,
      retryAfter: response.headers.get('retry-after') ?? '3600',
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      detail: `NASA NTRS answered HTTP ${response.status}`,
      retry: response.status >= 500,
    }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return {
      ok: false,
      status: 502,
      detail: 'NASA NTRS returned a body that is not JSON',
      retry: false,
    }
  }

  const payload = parsePayload(body)
  if (!payload) {
    return {
      ok: false,
      status: 502,
      detail: 'NASA NTRS returned a payload that is not a search response',
      retry: false,
    }
  }

  return { ok: true, payload }
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
  const rawQuery = (url.searchParams.get('q') ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (rawQuery === '') {
    return json(
      {
        error: 'q is required',
        hint: 'Send a short topic, for example /api/nasa?q=saffire',
      },
      400,
    )
  }

  // Rejected rather than silently cut: NTRS matches every term, so a paragraph
  // that lost its tail would return nothing and look like "no NASA literature
  // exists" instead of "the query was wrong".
  if (rawQuery.length > MAX_QUERY) {
    return json(
      {
        error: `q is ${rawQuery.length} characters; the limit is ${MAX_QUERY}`,
        hint: 'Send a short topic rather than a whole question; NTRS matches all terms.',
      },
      400,
    )
  }

  const query = rawQuery
  const requested = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
  const limit = Number.isFinite(requested)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(requested)))
    : DEFAULT_LIMIT

  const upstream = new URL(NTRS_SEARCH)
  upstream.searchParams.set('q', query)
  upstream.searchParams.set('page.size', String(limit))
  upstream.searchParams.set('page.from', '0')

  let payload: NtrsPayload | null = null
  let failure: Extract<UpstreamOutcome, { ok: false }> | null = null

  for (let attempt = 1; attempt <= UPSTREAM_ATTEMPTS; attempt += 1) {
    const outcome = await fetchOnce(upstream.toString())
    if (outcome.ok) {
      payload = outcome.payload
      break
    }
    failure = outcome
    if (!outcome.retry || attempt === UPSTREAM_ATTEMPTS) break
    await sleep(RETRY_DELAY_MS)
  }

  if (!payload) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    }
    if (failure?.retryAfter) headers['Retry-After'] = failure.retryAfter
    return new Response(
      JSON.stringify({
        error: 'NASA NTRS did not answer',
        detail: failure?.detail ?? 'unknown upstream failure',
      }),
      { status: failure?.status ?? 502, headers },
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
