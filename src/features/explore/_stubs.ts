import { create } from 'zustand'
import type {
  Experiment,
  Facility,
  FuelType,
  GravityRegime,
  RankedExperiment,
  Scenario,
  ScenarioId,
  ScoreWeights,
  SIRequest,
  SIResponse,
} from '@/contracts/types'

/**
 * Typed stand-ins for the PC1 modules until "@/" libs and the store land.
 * Every page imports from here, so switching to the real module is a one-line
 * path change plus deleting this file. Data is explicitly illustrative.
 */

export interface Filters {
  query: string
  fuelTypes: FuelType[]
  facilities: Facility[]
  regimes: GravityRegime[]
  o2Range: [number, number]
  yearRange: [number, number]
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  fuelTypes: [],
  facilities: [],
  regimes: [],
  o2Range: [0, 100],
  yearRange: [2000, 2030],
}

const stubSource = { title: 'Local placeholder record (not a NASA source)', org: 'Ignis stub data', year: 2024 }

function stubExperiment(
  id: string,
  acronym: string,
  name: string,
  summary: string,
  facility: Facility,
  regime: GravityRegime,
  years: [number, number | null],
  fuelType: FuelType,
  fuel: string,
  gravityG: number,
  o2Percent: number,
  pressureKPa: number,
  flowCmPerS: number,
  spread: number,
  limitingOxygen: number,
): Experiment {
  return {
    id,
    name,
    acronym,
    summary,
    facility,
    regime,
    years,
    fuelType,
    fuel,
    conditions: { gravityG, o2Percent, diluent: 'nitrogen', pressureKPa, flowCmPerS },
    metrics: [
      { key: 'flame-spread-rate', label: 'Flame spread rate', unit: 'cm/s', value: spread },
      { key: 'limiting-oxygen', label: 'Limiting oxygen index', unit: '%', value: limitingOxygen },
    ],
    findings: [
      { id: `${id}-f1`, text: 'Placeholder finding used to exercise the interface until real data lands.', tags: ['stub'] },
      { id: `${id}-f2`, text: 'Replace this record with a verified PC1 dataset entry before the demo.', tags: ['stub', 'honesty'] },
    ],
    safetyTakeaway: 'Illustrative record — do not present these numbers as NASA findings.',
    sources: [stubSource],
    confidence: 'illustrative',
    tags: ['stub', 'development'],
  }
}

const STUB_EXPERIMENTS: Experiment[] = [
  stubExperiment(
    'stub-solid-a',
    'STUB-A',
    'Stub solid burn A',
    'Development placeholder for a solid-fuel spread experiment in microgravity.',
    'ISS-CIR',
    'microgravity',
    [2016, 2018],
    'solid',
    'Placeholder polymer',
    0,
    21,
    101.3,
    5,
    1.2,
    16,
  ),
  stubExperiment(
    'stub-gas-b',
    'STUB-B',
    'Stub gas jet B',
    'Development placeholder for a gaseous jet flame in microgravity.',
    'ISS-MSG',
    'microgravity',
    [2019, 2020],
    'gas',
    'Placeholder methane mix',
    0,
    30,
    101.3,
    8,
    2.4,
    14,
  ),
  stubExperiment(
    'stub-droplet-c',
    'STUB-C',
    'Stub droplet C',
    'Development placeholder for a droplet combustion drop-tower run.',
    'Drop-tower',
    'partial-g',
    [2012, 2013],
    'droplet',
    'Placeholder alkane droplet',
    0.16,
    21,
    101.3,
    2,
    0.9,
    18,
  ),
  stubExperiment(
    'stub-dust-d',
    'STUB-D',
    'Stub dust layer D',
    'Development placeholder for a dust-layer ignition on a parabolic flight.',
    'Parabolic-flight',
    'partial-g',
    [2014, 2015],
    'dust',
    'Placeholder organic dust',
    0.38,
    21,
    80,
    4,
    1.6,
    19,
  ),
  stubExperiment(
    'stub-polymer-e',
    'STUB-E',
    'Stub polymer E',
    'Development placeholder for a ground-reference polymer burn.',
    'Ground',
    'normal-g',
    [2021, 2022],
    'solid',
    'Placeholder fabric',
    1,
    21,
    101.3,
    10,
    3.1,
    20,
  ),
  stubExperiment(
    'stub-liquid-f',
    'STUB-F',
    'Stub liquid pool F',
    'Development placeholder for a sounding-rocket liquid pool fire.',
    'Sounding-rocket',
    'normal-g',
    [2010, 2011],
    'liquid',
    'Placeholder fuel pool',
    1,
    25,
    70,
    6,
    2.2,
    17,
  ),
]

export function getExperiments(): Experiment[] {
  return STUB_EXPERIMENTS
}

export function getExperiment(id: string): Experiment | undefined {
  return STUB_EXPERIMENTS.find((experiment) => experiment.id === id)
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'iss',
    label: 'ISS',
    gravityG: 0,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: 'Microgravity station cabin at sea-level air composition.',
    assumption: false,
  },
  {
    id: 'lunar',
    label: 'Lunar',
    gravityG: 0.16,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: 'Lunar surface habitat at 0.16g.',
    assumption: false,
  },
  {
    id: 'mars',
    label: 'Mars',
    gravityG: 0.38,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: 'Mars surface habitat at 0.38g.',
    assumption: false,
  },
  {
    id: 'eva',
    label: 'EVA suit',
    gravityG: 0,
    o2Percent: 100,
    pressureKPa: 29.6,
    description: 'Suited operations with a high-oxygen, low-pressure atmosphere.',
    assumption: true,
  },
]

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0]
}

export function customScenario(gravityG: number, o2Percent: number, pressureKPa: number): Scenario {
  return {
    id: 'custom',
    label: 'Custom',
    gravityG,
    o2Percent,
    pressureKPa,
    description: 'Custom gravity, oxygen and pressure set by the operator.',
    assumption: true,
  }
}

export const defaultWeights: ScoreWeights = {
  hazardSeverity: 0.35,
  exploration: 0.25,
  evidence: 0.25,
  recency: 0.15,
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function regimeForGravity(gravityG: number): GravityRegime {
  if (gravityG <= 0.05) return 'microgravity'
  if (gravityG < 0.8) return 'partial-g'
  return 'normal-g'
}

function metricValue(experiment: Experiment, key: string): number | null {
  const metric = experiment.metrics.find((entry) => entry.key === key)
  return typeof metric?.value === 'number' ? metric.value : null
}

/**
 * Transparent placeholder scoring: each factor is a fixed, readable formula
 * over the record. PC1's real rankExperiments replaces this.
 */
export function rankExperiments(
  experiments: Experiment[],
  weights: ScoreWeights,
  scenario: Scenario,
): RankedExperiment[] {
  const targetRegime = regimeForGravity(scenario.gravityG)
  const weightTotal =
    weights.hazardSeverity + weights.exploration + weights.evidence + weights.recency || 1

  return experiments
    .map((experiment) => {
      const spread = metricValue(experiment, 'flame-spread-rate') ?? 0
      const limitingOxygen = metricValue(experiment, 'limiting-oxygen') ?? 21
      const hazardSeverity = clamp(40 + spread * 12 + (21 - limitingOxygen) * 2)
      const exploration = clamp(experiment.findings.length * 25 + experiment.tags.length * 5)
      const evidence = clamp(
        experiment.sources.length * 25 +
          experiment.findings.length * 10 +
          (experiment.confidence === 'verified' ? 25 : experiment.confidence === 'curated' ? 12 : 0),
      )
      const referenceYear = experiment.years[1] ?? experiment.years[0]
      const recency = clamp(100 - (2026 - referenceYear) * 3)
      const base =
        (hazardSeverity * weights.hazardSeverity +
          exploration * weights.exploration +
          evidence * weights.evidence +
          recency * weights.recency) /
        weightTotal
      const regimeBoost = experiment.regime === targetRegime ? 8 : 0

      return {
        experiment,
        scores: { hazardSeverity, exploration, evidence, recency },
        composite: clamp(Math.round(base + regimeBoost)),
        rationale:
          experiment.regime === targetRegime
            ? `Matches the ${scenario.label} gravity regime and scores ${Math.round(hazardSeverity)} on hazard.`
            : `Different gravity regime from ${scenario.label}; scored on hazard, exploration, evidence and recency only.`,
      }
    })
    .sort((a, b) => b.composite - a.composite)
}

export function searchExperiments(query: string, experiments: Experiment[]): Experiment[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return experiments
  return experiments.filter((experiment) => {
    const haystack = [
      experiment.name,
      experiment.acronym,
      experiment.summary,
      experiment.fuel,
      experiment.facility,
      ...experiment.tags,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

export type IgnisState = {
  scenario: Scenario
  setScenario: (scenario: Scenario) => void
  weights: ScoreWeights
  setWeights: (weights: ScoreWeights) => void
  resetWeights: () => void
  filters: Filters
  setFilters: (partial: Partial<Filters>) => void
  resetFilters: () => void
  compareIds: string[]
  toggleCompare: (id: string) => void
  clearCompare: () => void
  selectedId: string | null
  select: (id: string | null) => void
  bookmarks: string[]
  toggleBookmark: (id: string) => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
}

export const useIgnis = create<IgnisState>()((set) => ({
  scenario: getScenario('iss'),
  setScenario: (scenario) => set({ scenario }),
  weights: { ...defaultWeights },
  setWeights: (weights) => set({ weights }),
  resetWeights: () => set({ weights: { ...defaultWeights } }),
  filters: { ...DEFAULT_FILTERS },
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  compareIds: [],
  toggleCompare: (id) =>
    set((state) => {
      if (state.compareIds.includes(id)) {
        return { compareIds: state.compareIds.filter((entry) => entry !== id) }
      }
      if (state.compareIds.length >= 4) return state
      return { compareIds: [...state.compareIds, id] }
    }),
  clearCompare: () => set({ compareIds: [] }),
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  bookmarks: [],
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(id)
        ? state.bookmarks.filter((entry) => entry !== id)
        : [...state.bookmarks, id],
    })),
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}))

/** Offline SI stub: deterministic text, always flagged fallback: true. */
export async function askSI(request: SIRequest): Promise<SIResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const citations = request.experimentIds.slice(0, 4)
  const lines = citations.map((id) => {
    const experiment = getExperiment(id)
    return experiment
      ? `- **${experiment.acronym}** (${id}): ${experiment.safetyTakeaway}`
      : `- **${id}**: no matching record.`
  })
  const answerMarkdown = [
    `### Comparison for ${request.scenario.label}`,
    '',
    'This is the offline stub answer used until the grounded SI module lands. It cites only the experiments in this comparison.',
    '',
    ...(lines.length > 0 ? lines : ['- No experiments were selected.']),
  ].join('\n')

  return {
    answerMarkdown,
    citations,
    model: 'stub-offline',
    fallback: true,
    groundingScore: citations.length > 0 ? 0.8 : 0,
    invalidCitationsRemoved: 0,
  }
}
