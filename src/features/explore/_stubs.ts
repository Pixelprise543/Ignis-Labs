import { create } from 'zustand'
import type {
  CoverageCell,
  Experiment,
  Facility,
  FuelType,
  GravityRegime,
  Material,
  MaterialRisk,
  RankedExperiment,
  Scenario,
  ScenarioId,
  ScoreWeights,
  Severity,
  SIRequest,
  SIResponse,
  TimelineEvent,
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
  const headings: Record<SIRequest['mode'], string> = {
    summarize: `Summary for ${request.scenario.label}`,
    compare: `Comparison for ${request.scenario.label}`,
    interpret: "What's missing",
    ask: `Answer for ${request.scenario.label}`,
    brief: `Brief for ${request.scenario.label}`,
    playbook: `Playbook for ${request.scenario.label}`,
  }
  const answerMarkdown = [
    `### ${headings[request.mode]}`,
    '',
    'This is the offline stub answer used until the grounded SI module lands. It cites only experiments in the current selection.',
    '',
    ...(request.context ? [request.context, ''] : []),
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

/**
 * Material stubs. Names are generic engineering materials, not NASA study
 * titles; every risk number is a transparent placeholder formula so the UI can
 * be built without dressing up invented science.
 */
const STUB_MATERIALS: Material[] = [
  {
    id: 'cotton-fabric',
    name: 'Cotton fabric',
    category: 'textile',
    usedFor: 'Crew clothing, towels and stowage liners',
    evidenceIds: ['stub-solid-a', 'stub-liquid-f'],
    baseFlammability: 70,
    notes: 'Placeholder base index; replace with sourced flammability data.',
  },
  {
    id: 'polyurethane-foam',
    name: 'Polyurethane foam',
    category: 'foam',
    usedFor: 'Seat cushions and acoustic padding',
    evidenceIds: ['stub-solid-a', 'stub-polymer-e'],
    baseFlammability: 85,
    notes: 'Placeholder base index; foams are included to exercise the high-risk band.',
  },
  {
    id: 'pmma',
    name: 'Acrylic (PMMA)',
    category: 'polymer',
    usedFor: 'Viewport glazing and light covers',
    evidenceIds: ['stub-polymer-e'],
    baseFlammability: 55,
    notes: 'Placeholder base index.',
  },
  {
    id: 'aluminium-composite',
    name: 'Aluminium composite',
    category: 'composite',
    usedFor: 'Structural panels and rack faces',
    evidenceIds: ['stub-solid-a'],
    baseFlammability: 25,
    notes: 'Placeholder base index for a nominally low-risk structural material.',
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'paper',
    usedFor: 'Checklists, labels and packing',
    evidenceIds: ['stub-dust-d'],
    baseFlammability: 80,
    notes: 'Placeholder base index.',
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    category: 'liquid-fuel',
    usedFor: 'Experiment fuel and cleaning solvent',
    evidenceIds: ['stub-liquid-f', 'stub-droplet-c'],
    baseFlammability: 60,
    notes: 'Placeholder base index for a liquid fuel.',
  },
  {
    id: 'methane',
    name: 'Methane',
    category: 'gas',
    usedFor: 'Experiment fuel supply',
    evidenceIds: ['stub-gas-b'],
    baseFlammability: 65,
    notes: 'Placeholder base index for a gaseous fuel.',
  },
  {
    id: 'nomex-blend',
    name: 'Aramid blend',
    category: 'textile',
    usedFor: 'Fire-resistant crew clothing',
    evidenceIds: ['stub-solid-a'],
    baseFlammability: 30,
    notes: 'Placeholder base index for a flame-resistant textile.',
  },
]

export function getMaterials(): Material[] {
  return STUB_MATERIALS
}

function riskLevelFor(risk: number): Severity {
  if (risk < 35) return 'info'
  if (risk < 55) return 'caution'
  if (risk < 75) return 'high'
  return 'critical'
}

/**
 * Transparent placeholder model: a base flammability index scaled by the
 * scenario oxygen fraction, with small gravity and pressure terms. The real
 * PC1 module replaces this; the page labels the result as decision support.
 */
function stubRisk(material: Material, scenario: Scenario): MaterialRisk {
  const o2 = scenario.o2Percent
  const pressurePenalty = ((101.3 - scenario.pressureKPa) / 101.3) * 6
  const raw = material.baseFlammability * (0.6 + (o2 / 100) * 0.9) + scenario.gravityG * 8 - pressurePenalty
  const risk = Math.round(clamp(raw))
  const level = riskLevelFor(risk)
  const levelWord = level === 'info' ? 'low' : level === 'caution' ? 'moderate' : level === 'high' ? 'high' : 'critical'
  return {
    materialId: material.id,
    scenarioId: scenario.id,
    risk,
    level,
    rationale: `${material.name} at ${o2}% oxygen and ${scenario.gravityG}g rates ${levelWord}. Base index ${material.baseFlammability} adjusted for the scenario atmosphere.`,
    evidenceIds: material.evidenceIds,
  }
}

export function getMaterialRisks(scenario: Scenario): MaterialRisk[] {
  return STUB_MATERIALS.map((material) => stubRisk(material, scenario))
}

/** Flat list of every material × fixed scenario pair, for the matrix. */
export function getMaterialMatrix(): MaterialRisk[] {
  return SCENARIOS.filter((scenario) => scenario.id !== 'custom').flatMap((scenario) =>
    STUB_MATERIALS.map((material) => stubRisk(material, scenario)),
  )
}

/** Coverage bands are ordered; the page keeps first-seen order for its axes. */
export const COVERAGE_GRAVITY_BANDS = [
  { id: 'micro', label: '0g', matches: (g: number) => g <= 0.05 },
  { id: 'low-partial', label: '0–0.5g', matches: (g: number) => g > 0.05 && g < 0.5 },
  { id: 'high-partial', label: '0.5–1g', matches: (g: number) => g >= 0.5 && g < 1 },
  { id: 'normal', label: '1g and above', matches: (g: number) => g >= 1 },
] as const

export const COVERAGE_O2_BANDS = [
  { id: 'below-18', label: 'Below 18%', matches: (o: number) => o < 18 },
  { id: '18-23', label: '18–23%', matches: (o: number) => o >= 18 && o < 23 },
  { id: '23-30', label: '23–30%', matches: (o: number) => o >= 23 && o < 30 },
  { id: '30-50', label: '30–50%', matches: (o: number) => o >= 30 && o < 50 },
  { id: '50-plus', label: '50% and above', matches: (o: number) => o >= 50 },
] as const

const NOT_REPORTED_BAND = 'Not reported'

/**
 * Derived from the experiment records, so the grid cannot disagree with the
 * library. A cell with no experiments is a coverage gap, which is the point of
 * the page.
 */
export function getCoverage(): CoverageCell[] {
  const cells: CoverageCell[] = []
  COVERAGE_GRAVITY_BANDS.forEach((gravityBand) => {
    const o2Bands = [
      ...COVERAGE_O2_BANDS.map((band) => ({ id: band.id, label: band.label, matches: band.matches })),
      { id: 'not-reported', label: NOT_REPORTED_BAND, matches: (o: number) => Number.isNaN(o) },
    ]
    o2Bands.forEach((o2Band) => {
      const matching = STUB_EXPERIMENTS.filter((experiment) => {
        const o2 = experiment.conditions.o2Percent
        const inGravity = gravityBand.matches(experiment.conditions.gravityG)
        const inOxygen = o2 === null ? o2Band.label === NOT_REPORTED_BAND : o2Band.matches(o2)
        return inGravity && inOxygen
      })
      const relevantScenarios = SCENARIOS.filter((entry) => {
        const o2 = entry.o2Percent
        const inGravity = gravityBand.matches(entry.gravityG)
        const inOxygen = o2 === null ? o2Band.label === NOT_REPORTED_BAND : o2Band.matches(o2)
        return inGravity && inOxygen
      }).map((entry) => entry.id)
      cells.push({
        gravityBand: gravityBand.label,
        o2Band: o2Band.label,
        count: matching.length,
        experimentIds: matching.map((experiment) => experiment.id),
        gap: matching.length === 0,
        relevantScenarios,
      })
    })
  })
  return cells
}

/** Empty cells that sit in the same gravity band or oxygen band as the scenario. */
export function getGaps(scenario: Scenario): CoverageCell[] {
  const gravityBand = COVERAGE_GRAVITY_BANDS.find((band) => band.matches(scenario.gravityG))
  const o2Band = COVERAGE_O2_BANDS.find((band) => band.matches(scenario.o2Percent))
  return getCoverage().filter(
    (cell) =>
      cell.gap &&
      cell.o2Band !== NOT_REPORTED_BAND &&
      (cell.gravityBand === gravityBand?.label || cell.o2Band === o2Band?.label),
  )
}

/** Timeline derived from experiment years; no invented history entries. */
export function getTimeline(): TimelineEvent[] {
  const sorted = [...STUB_EXPERIMENTS].sort(
    (a, b) => (a.years[1] ?? a.years[0]) - (b.years[1] ?? b.years[0]),
  )
  const seenDecades = new Set<number>()
  return sorted.map((experiment) => {
    const year = experiment.years[1] ?? experiment.years[0]
    const decade = Math.floor(year / 10) * 10
    const milestone = !seenDecades.has(decade)
    seenDecades.add(decade)
    return {
      year,
      title: `${experiment.acronym}: ${experiment.name}`,
      summary: experiment.summary,
      experimentIds: [experiment.id],
      milestone,
    }
  })
}
