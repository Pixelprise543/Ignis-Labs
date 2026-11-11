export type Platform =
  | 'ISS'
  | 'drop tower'
  | 'parabolic flight'
  | 'sounding rocket'
  | 'free-flyer'
  | 'other'

export type SafetyTag =
  | 'flammability'
  | 'material-selection'
  | 'detection'
  | 'suppression'
  | 'smoldering'
  | 'flame-spread'
  | 'extinction'
  | 'cabin-atmosphere'

export interface Atmosphere {
  o2_percent: number | null
  pressure_kpa: number | null
  flow_cm_s: number | null
}

export interface Experiment {
  id: string
  title: string
  year: number | null
  platform: Platform
  fuel_material: string
  atmosphere: Atmosphere
  abstract: string
  key_findings: string[]
  safety_tags: SafetyTag[]
  source_url: string
}

export interface EnrichedExperiment extends Experiment {
  ai_summary: string
  safety_relevance_score: number
  rationale: string
  mission_implications: string
}

export interface Weights {
  relevance: number
  confidence: number
  recency: number
}

export interface ScoreBreakdown {
  relevance: number
  confidence: number
  recency: number
  weights: Weights
}

export interface RankedExperiment extends EnrichedExperiment {
  rank: number
  score_breakdown: ScoreBreakdown
}

export interface InsightRequest {
  experiment_ids: string[]
  question?: string
}

export interface InsightResponse {
  insight: string
  citations: string[]
}

export interface ExperimentQuery {
  q?: string
  platform?: Platform
  tag?: SafetyTag
  sort?: 'relevance' | 'year' | 'title' | 'id'
}

export const PLATFORMS: Platform[] = [
  'ISS',
  'drop tower',
  'parabolic flight',
  'sounding rocket',
  'free-flyer',
  'other',
]

export const SAFETY_TAGS: SafetyTag[] = [
  'flammability',
  'material-selection',
  'detection',
  'suppression',
  'smoldering',
  'flame-spread',
  'extinction',
  'cabin-atmosphere',
]
