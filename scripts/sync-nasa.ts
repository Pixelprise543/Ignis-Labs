/**
 * Regenerates data/nasa/ntrs.ts from NASA's Technical Reports Server.
 *
 *   node scripts/sync-nasa.ts
 *
 * Why bake instead of always calling live: GitHub Pages has no server
 * functions, so without a snapshot the assistant's NASA panel would be empty
 * there. The snapshot is also what a live call falls back to when NTRS is slow.
 *
 * Queries are family-level and deliberately short: NTRS treats terms as AND, so
 * "flex flame spread microgravity" returns zero hits while "flame spread" finds
 * the FLEX-era papers. Nothing here invents a title - every field is copied from
 * the API response.
 */
import { writeFileSync } from 'node:fs'

const NTRS = 'https://ntrs.nasa.gov/api/citations/search'
const PER_QUERY = 6

/** topic key -> NTRS query. Keys are used to pick snapshot rows for a question. */
const TOPICS: Record<string, string> = {
  saffire: 'saffire spacecraft fire',
  sofie: 'solid fuel ignition extinction',
  acme: 'acme combustion microgravity',
  'flame-spread': 'flame spread microgravity',
  bass: 'burning suppression solids',
  'fire-safety': 'spacecraft fire safety flammability',
  oxygen: 'oxygen flammability',
  materials: 'flammability materials spacecraft',
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
  downloads?: Array<{ links?: { pdf?: string } }>
}

const truncate = (text: string, limit: number) =>
  text.length <= limit
    ? text
    : `${text.slice(0, text.slice(0, limit).lastIndexOf(' ')).trimEnd()}…`

const yearOf = (date: string | undefined) => {
  const match = date?.match(/^(\d{4})-/)
  return match ? Number(match[1]) : null
}

const reportNumberOf = (values: string[] | undefined) => {
  for (const raw of values ?? []) {
    const cleaned = raw.replace(/^report number:\s*/i, '').trim()
    if (cleaned !== '') return cleaned
  }
  return null
}

async function search(query: string): Promise<NtrsResult[]> {
  const url = `${NTRS}?q=${encodeURIComponent(query)}&page.size=${PER_QUERY}&page.from=0`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`NTRS ${response.status} for "${query}"`)
  const payload = (await response.json()) as { results?: NtrsResult[] }
  return payload.results ?? []
}

async function main(): Promise<void> {
  const byId = new Map<string, Record<string, unknown>>()

  for (const [topic, query] of Object.entries(TOPICS)) {
    const results = await search(query)
    process.stdout.write(`${topic}: ${results.length} result(s)\n`)

    for (const raw of results) {
      if (raw.id === undefined || raw.id === null || !raw.title) continue
      const id = String(raw.id)
      const existing = byId.get(id)
      if (existing) {
        const topics = existing.topics as string[]
        if (!topics.includes(topic)) topics.push(topic)
        continue
      }

      const pdf = raw.downloads?.find((download) => download.links?.pdf)?.links?.pdf
      const abstract = raw.abstract?.trim()

      byId.set(id, {
        id,
        title: raw.title.trim(),
        abstract: abstract ? truncate(abstract, 1200) : null,
        year: yearOf(raw.distributionDate),
        reportNumber: reportNumberOf(raw.otherReportNumbers),
        center: raw.center?.name ?? raw.center?.code ?? null,
        authors: (raw.authorAffiliations ?? [])
          .map((entry) => entry.meta?.author?.name?.trim())
          .filter(Boolean)
          .slice(0, 4),
        documentType: raw.stiTypeDetails ?? null,
        pdfUrl: pdf ? `https://ntrs.nasa.gov${pdf.startsWith('/') ? '' : '/'}${pdf}` : null,
        url: `https://ntrs.nasa.gov/citations/${id}`,
        topics: [topic],
      })
    }
  }

  const publications = [...byId.values()].sort((a, b) => {
    const yearA = typeof a.year === 'number' ? a.year : 0
    const yearB = typeof b.year === 'number' ? b.year : 0
    return yearB - yearA
  })

  const retrievedAt = new Date().toISOString()
  const body = `/**
 * GENERATED FILE - do not edit by hand.
 * Source: NASA Technical Reports Server (https://ntrs.nasa.gov).
 * Regenerate with: node scripts/sync-nasa.ts
 *
 * Titles and abstracts are copied verbatim from NTRS. They are literature, not
 * part of Ignis's 20-record experiment dataset, and are never scored.
 */
import type { NasaPublication, NasaSnapshot } from '@/lib/nasaTypes'

export const NASA_SNAPSHOT_RETRIEVED_AT = ${JSON.stringify(retrievedAt)}

export const NASA_SNAPSHOT_PUBLICATIONS: NasaPublication[] = ${JSON.stringify(publications, null, 2)}

export const NASA_SNAPSHOT: NasaSnapshot = {
  retrievedAt: NASA_SNAPSHOT_RETRIEVED_AT,
  publications: NASA_SNAPSHOT_PUBLICATIONS,
}
`

  writeFileSync('data/nasa/ntrs.ts', body, 'utf8')
  process.stdout.write(
    `\nWrote ${publications.length} publications to data/nasa/ntrs.ts (${retrievedAt})\n`,
  )
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
