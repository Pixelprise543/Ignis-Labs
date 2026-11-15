/**
 * Shapes shared by the NTRS proxy (api/nasa.ts), the snapshot generator
 * (scripts/sync-nasa.ts) and the browser client (src/lib/nasa.ts).
 *
 * This module holds types only, so it is erased at build time and cannot create
 * a runtime cycle between the API route and the data folder.
 */

/** One technical report as NASA's Technical Reports Server publishes it. */
export interface NasaPublication {
  /** NTRS submission id, e.g. "20260001600". */
  id: string
  title: string
  /** Verbatim NTRS abstract, truncated. Never paraphrased, never scored. */
  abstract: string | null
  year: number | null
  reportNumber: string | null
  center: string | null
  authors: string[]
  /** e.g. "Conference Paper". */
  documentType: string | null
  pdfUrl: string | null
  /** Canonical NTRS landing page. */
  url: string
  /** Snapshot only: which topic queries found this report. */
  topics?: string[]
}

/** The baked fallback written by scripts/sync-nasa.ts. */
export interface NasaSnapshot {
  retrievedAt: string
  publications: NasaPublication[]
}

export type NasaLiteratureSource = 'live' | 'snapshot'

export interface NasaLiterature {
  /** The query actually sent to NTRS (already reduced from the question). */
  query: string
  results: NasaPublication[]
  source: NasaLiteratureSource
  /** When the data was retrieved: now for live, the snapshot run for baked. */
  retrievedAt: string
}
