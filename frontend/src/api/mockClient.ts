import type {
  EnrichedExperiment,
  ExperimentQuery,
  InsightRequest,
  InsightResponse,
  RankedExperiment,
  ScoreBreakdown,
  Weights,
} from './types'
import { MOCK_EXPERIMENTS } from './mock/experiments.mock'

const CURRENT_YEAR = 2026
const RECENCY_SPAN_YEARS = 30

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

const relevanceOf = (record: EnrichedExperiment): number =>
  clamp01(record.safety_relevance_score / 100)

const confidenceOf = (record: EnrichedExperiment): number => {
  const checks = [
    record.year !== null,
    record.atmosphere.o2_percent !== null,
    record.atmosphere.pressure_kpa !== null,
    record.atmosphere.flow_cm_s !== null,
    record.key_findings.length > 0,
    record.abstract.length > 0,
    record.source_url.length > 0,
  ]
  return checks.filter(Boolean).length / checks.length
}

const recencyOf = (record: EnrichedExperiment): number => {
  if (record.year === null) return 0
  return clamp01(1 - (CURRENT_YEAR - record.year) / RECENCY_SPAN_YEARS)
}

const rankRecords = (
  records: EnrichedExperiment[],
  weights: Weights,
): RankedExperiment[] =>
  records
    .map((record) => {
      const breakdown: ScoreBreakdown = {
        relevance: relevanceOf(record),
        confidence: confidenceOf(record),
        recency: recencyOf(record),
        weights,
      }
      const total =
        100 *
        (weights.relevance * breakdown.relevance +
          weights.confidence * breakdown.confidence +
          weights.recency * breakdown.recency)
      return { record, breakdown, total }
    })
    .sort((a, b) => b.total - a.total || a.record.id.localeCompare(b.record.id))
    .map(({ record, breakdown }, index) => ({
      ...record,
      rank: index + 1,
      score_breakdown: breakdown,
    }))

const matchesQuery = (record: EnrichedExperiment, query: ExperimentQuery): boolean => {
  if (query.q) {
    const needle = query.q.trim().toLowerCase()
    const haystack = [
      record.title,
      record.abstract,
      record.fuel_material,
      ...record.key_findings,
    ]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  if (query.platform && record.platform !== query.platform) return false
  if (query.tag && !record.safety_tags.includes(query.tag)) return false
  return true
}

const sortRecords = (
  records: EnrichedExperiment[],
  sort: ExperimentQuery['sort'],
): EnrichedExperiment[] => {
  const copy = [...records]
  switch (sort) {
    case 'year':
      return copy.sort((a, b) => (b.year ?? -1) - (a.year ?? -1) || a.id.localeCompare(b.id))
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'id':
      return copy.sort((a, b) => a.id.localeCompare(b.id))
    case 'relevance':
    default:
      return copy.sort(
        (a, b) => b.safety_relevance_score - a.safety_relevance_score || a.id.localeCompare(b.id),
      )
  }
}

export const mockClient = {
  async health(): Promise<{ status: string }> {
    return { status: 'ok' }
  },

  async listExperiments(query: ExperimentQuery = {}): Promise<EnrichedExperiment[]> {
    const filtered = MOCK_EXPERIMENTS.filter((record) => matchesQuery(record, query))
    return sortRecords(filtered, query.sort)
  },

  async getExperiment(id: string): Promise<EnrichedExperiment> {
    const found = MOCK_EXPERIMENTS.find((record) => record.id === id)
    if (!found) throw new Error(`unknown experiment id: ${id}`)
    return found
  },

  async getRankings(weights: Weights): Promise<RankedExperiment[]> {
    return rankRecords(MOCK_EXPERIMENTS, weights)
  },

  async compare(ids: string[]): Promise<EnrichedExperiment[]> {
    const byId = new Map(MOCK_EXPERIMENTS.map((record) => [record.id, record]))
    const missing = ids.filter((id) => !byId.has(id))
    if (missing.length) throw new Error(`unknown experiment id(s): ${missing.join(', ')}`)
    return ids.map((id) => byId.get(id) as EnrichedExperiment)
  },

  async insights(request: InsightRequest): Promise<InsightResponse> {
    const selected = await mockClient.compare(request.experiment_ids)
    const top = [...selected].sort(
      (a, b) => b.safety_relevance_score - a.safety_relevance_score,
    )
    const tags = new Map<string, number>()
    for (const record of selected) {
      for (const tag of record.safety_tags) tags.set(tag, (tags.get(tag) ?? 0) + 1)
    }
    const themes = [...tags.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([tag, count]) => `${tag} (${count})`)
      .join(', ')

    const insight = [
      request.question ? `Question: ${request.question}` : 'Summary of the selected records.',
      `Highest safety relevance: ${top.map((r) => `${r.title} [${r.id}]`).join(', ')}.`,
      themes ? `Recurring safety themes: ${themes}.` : '',
      'Mock mode: this answer is generated locally from the mock records, not by an LLM.',
    ]
      .filter(Boolean)
      .join('\n\n')

    return { insight, citations: top.slice(0, 3).map((r) => r.id) }
  },
}
