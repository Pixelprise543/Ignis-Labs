import type {
  EnrichedExperiment,
  ExperimentQuery,
  InsightRequest,
  InsightResponse,
  RankedExperiment,
  Weights,
} from './types'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body?.detail) detail = body.detail
    } catch {
      // non-JSON error body — keep the status text
    }
    throw new Error(detail)
  }
  return (await response.json()) as T
}

const toQueryString = (query: ExperimentQuery): string => {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.platform) params.set('platform', query.platform)
  if (query.tag) params.set('tag', query.tag)
  if (query.sort) params.set('sort', query.sort)
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

export const realClient = {
  async health(): Promise<{ status: string }> {
    return request<{ status: string }>('/api/health')
  },

  async listExperiments(query: ExperimentQuery = {}): Promise<EnrichedExperiment[]> {
    return request<EnrichedExperiment[]>(`/api/experiments${toQueryString(query)}`)
  },

  async getExperiment(id: string): Promise<EnrichedExperiment> {
    return request<EnrichedExperiment>(`/api/experiments/${encodeURIComponent(id)}`)
  },

  async getRankings(weights: Weights): Promise<RankedExperiment[]> {
    const params = new URLSearchParams({
      relevance: String(weights.relevance),
      confidence: String(weights.confidence),
      recency: String(weights.recency),
    })
    return request<RankedExperiment[]>(`/api/rankings?${params.toString()}`)
  },

  async compare(ids: string[]): Promise<EnrichedExperiment[]> {
    const params = new URLSearchParams({ ids: ids.join(',') })
    return request<EnrichedExperiment[]>(`/api/compare?${params.toString()}`)
  },

  async insights(payload: InsightRequest): Promise<InsightResponse> {
    return request<InsightResponse>('/api/insights', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
