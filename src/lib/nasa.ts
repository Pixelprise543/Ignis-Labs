import { z } from 'zod'
import type { NasaLiterature, NasaPublication } from '@/lib/nasaTypes'

/**
 * Browser side of the NASA literature lookup.
 *
 * Two rules shape this module:
 * 1. It never throws. A slow, broken or missing endpoint degrades to the baked
 *    snapshot, and the caller always gets something it can render or ignore.
 * 2. It never writes science. Every string that reaches the UI is a title, an
 *    abstract excerpt or a report number copied from NTRS, plus a link. The
 *    question only decides *which* reports are shown, never what they say.
 *
 * NTRS sends no CORS header, so the live call goes through our own edge route
 * at /api/nasa. GitHub Pages has no functions; there the snapshot is the only
 * source, which is why the result carries `source` and `retrievedAt`.
 */

const MAX_QUERY = 120
const DEFAULT_LIMIT = 5
const LIVE_TIMEOUT_MS = 4500

const publicationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string().nullable(),
  year: z.number().nullable(),
  reportNumber: z.string().nullable(),
  center: z.string().nullable(),
  authors: z.array(z.string()),
  documentType: z.string().nullable(),
  pdfUrl: z.string().nullable(),
  url: z.string().min(1),
})

const responseSchema = z.object({
  query: z.string(),
  retrievedAt: z.string().min(1),
  total: z.number(),
  results: z.array(publicationSchema),
})

/**
 * NTRS treats multiple terms as AND, so a long natural-language question
 * returns nothing. Each rule maps a safety concept onto a query that is known
 * to return that literature, which is why the table exists instead of a generic
 * keyword join.
 */
const QUERY_RULES: Array<{ pattern: RegExp; query: string }> = [
  { pattern: /saffire|large[- ]scale fire/i, query: 'saffire spacecraft fire' },
  { pattern: /sofie|solid fuel ignition|smoulder|smolder/i, query: 'solid fuel ignition extinction' },
  { pattern: /acme|gaseous flame|premixed|soot|smoke|particulate/i, query: 'soot microgravity' },
  { pattern: /\bo2\b|oxygen|enrich/i, query: 'oxygen flammability' },
  { pattern: /extinct|extinguish|suppress|suppression|inert/i, query: 'flame extinction suppression' },
  { pattern: /flame spread|spread rate|concurrent|opposed/i, query: 'flame spread microgravity' },
  { pattern: /nomex|cotton|fabric|textile|polymer|pmma|plexiglass|material|insulation/i, query: 'materials flammability spacecraft' },
  { pattern: /drop tower|parabolic|sounding rocket|partial gravity|lunar|mars|moon/i, query: 'flammability partial gravity' },
  { pattern: /fire|flame|burn|ignit|combust/i, query: 'spacecraft fire safety' },
]

const STOPWORDS = new Set([
  'about', 'after', 'again', 'against', 'also', 'and', 'any', 'are', 'because', 'been',
  'before', 'being', 'between', 'both', 'but', 'can', 'could', 'does', 'doing', 'each',
  'for', 'from', 'have', 'having', 'here', 'how', 'into', 'its', 'just', 'more', 'most',
  'much', 'must', 'not', 'now', 'off', 'once', 'only', 'other', 'our', 'out', 'over',
  'same', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'them', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'under', 'very', 'was', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'why', 'will', 'with', 'would',
  'your', 'risk', 'risky', 'riskier', 'safe', 'safer', 'cabin', 'crew',
])

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, ' ')
    .split(' ')
    .map((word) => word.replace(/%/g, ''))
    .filter((word) => word.length > 2 && !/^\d+$/.test(word) && !STOPWORDS.has(word))
}

/**
 * The query sent to NTRS. Exported so a test can prove a question maps onto a
 * query that returns literature rather than an empty string.
 */
export function buildSearchQuery(question: string): string {
  const text = question.trim()
  if (text === '') return ''

  for (const rule of QUERY_RULES) {
    if (rule.pattern.test(text)) return rule.query.slice(0, MAX_QUERY)
  }

  const words = contentWords(text).slice(0, 3)
  return (words.length > 0 ? words.join(' ') : 'spacecraft fire safety').slice(0, MAX_QUERY)
}

/** Relevance for the baked snapshot, which has no server-side ranking. */
function snapshotScore(publication: NasaPublication, terms: string[]): number {
  if (terms.length === 0) return 0
  const title = publication.title.toLowerCase()
  const abstract = (publication.abstract ?? '').toLowerCase()
  let score = 0
  for (const term of terms) {
    if (title.includes(term)) score += 3
    else if (abstract.includes(term)) score += 1
  }
  return score
}

async function loadSnapshot(): Promise<{ retrievedAt: string; publications: NasaPublication[] }> {
  // Dynamic import keeps ~50 KB of abstracts out of the initial bundle: the
  // snapshot is only needed when the live route is unavailable.
  const module = await import('../../data/nasa/ntrs')
  return {
    retrievedAt: module.NASA_SNAPSHOT.retrievedAt,
    publications: module.NASA_SNAPSHOT.publications,
  }
}

async function fromSnapshot(
  question: string,
  query: string,
  limit: number,
): Promise<NasaLiterature> {
  const snapshot = await loadSnapshot()
  const terms = contentWords(question)
  const ranked = snapshot.publications
    .map((publication) => ({ publication, score: snapshotScore(publication, terms) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.publication.year ?? 0) - (a.publication.year ?? 0),
    )
    .slice(0, limit)
    .map((entry) => entry.publication)

  return {
    query,
    results: ranked,
    source: 'snapshot',
    retrievedAt: snapshot.retrievedAt,
  }
}

async function fromLive(
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<NasaPublication[] | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(
      `/api/nasa?q=${encodeURIComponent(query)}&limit=${limit}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return null
    const parsed = responseSchema.safeParse(await response.json())
    if (!parsed.success) return null
    return parsed.data.results
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * NASA technical reports relevant to a question. Never throws; an empty
 * question returns an empty result set so the caller can render nothing.
 */
export async function findNasaPublications(
  question: string,
  options: { limit?: number; signal?: AbortSignal } = {},
): Promise<NasaLiterature> {
  const query = buildSearchQuery(question)
  const limit = Math.min(8, Math.max(1, options.limit ?? DEFAULT_LIMIT))

  if (query === '') {
    return { query, results: [], source: 'snapshot', retrievedAt: new Date().toISOString() }
  }

  const live = await fromLive(query, limit, options.signal)
  if (live && live.length > 0) {
    return {
      query,
      results: live,
      source: 'live',
      retrievedAt: new Date().toISOString(),
    }
  }

  try {
    return await fromSnapshot(question, query, limit)
  } catch {
    // The snapshot file is generated and committed, so this should be
    // unreachable; returning an empty set is still better than a crash.
    return { query, results: [], source: 'snapshot', retrievedAt: new Date().toISOString() }
  }
}

/** "2026-11-15T07:08:01.794Z" -> "15 Nov 2026", without a locale surprise. */
export function formatRetrievedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
