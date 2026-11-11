import type {
  EnrichedExperiment,
  ExperimentQuery,
  InsightRequest,
  InsightResponse,
  RankedExperiment,
  Weights,
} from './types'
import { mockClient } from './mockClient'
import { realClient } from './realClient'

export interface ApiClient {
  health(): Promise<{ status: string }>
  listExperiments(query?: ExperimentQuery): Promise<EnrichedExperiment[]>
  getExperiment(id: string): Promise<EnrichedExperiment>
  getRankings(weights: Weights): Promise<RankedExperiment[]>
  compare(ids: string[]): Promise<EnrichedExperiment[]>
  insights(payload: InsightRequest): Promise<InsightResponse>
}

/**
 * VITE_USE_MOCKS defaults to true so the dashboard runs with no backend at all.
 * Set it to `false` in frontend/.env to talk to FastAPI on port 8000.
 */
export const isMockMode = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'

export const client: ApiClient = isMockMode ? mockClient : realClient
