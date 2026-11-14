import type {
  Facility,
  FuelType,
  GravityRegime,
  Scenario,
  ScenarioId,
} from '@/contracts/types'
import { getScenario, customScenario } from '@/lib/scenarios'
import { getExperiments } from '@/lib/data'
import { useIgnis, type Filters, type IgnisState } from '@/store/useIgnis'

/**
 * Two-way binding between the store and the URL query string, so a view can be
 * shared, bookmarked and navigated with the browser's back button.
 *
 * The URL is the source of truth on load and on popstate: anything absent means
 * "default", not "keep whatever was in memory". That is what makes a link to the
 * bare app reset to the ISS cabin instead of inheriting a previous session.
 *
 * Only shareable state is written. Weights, bookmarks, drawer and palette are
 * session preferences, so they stay out of the URL and do not cause history
 * churn. State changes use replaceState rather than pushState: dragging an
 * oxygen slider should not fill the back stack with hundreds of entries.
 */

const FUEL_TYPES: readonly FuelType[] = [
  'solid',
  'gas',
  'liquid',
  'droplet',
  'dust',
  'cool-flame',
]

const FACILITIES: readonly Facility[] = [
  'ISS-CIR',
  'ISS-MSG',
  'ISS-other',
  'Free-flyer',
  'Drop-tower',
  'Parabolic-flight',
  'Sounding-rocket',
  'Ground',
]

const REGIMES: readonly GravityRegime[] = ['microgravity', 'partial-g', 'normal-g']

const SCENARIO_IDS: readonly ScenarioId[] = ['iss', 'lunar', 'mars', 'eva', 'custom']

const EXPERIMENT_IDS = new Set(getExperiments().map((experiment) => experiment.id))

/** Captured once: the empty-URL filter state is also the serialisation default. */
const DEFAULT_FILTERS = useIgnis.getInitialState().filters

const COMPARE_LIMIT = 4

function numberOrNull(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function rangeFrom(
  minRaw: string | null,
  maxRaw: string | null,
  fallback: [number, number],
): [number, number] {
  const min = numberOrNull(minRaw) ?? fallback[0]
  const max = numberOrNull(maxRaw) ?? fallback[1]
  return min <= max ? [min, max] : [max, min]
}

function enumList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return []
  const allowedSet = new Set<string>(allowed)
  const picked = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is T => allowedSet.has(value))
  return [...new Set(picked)]
}

function scenarioFrom(params: URLSearchParams): Scenario {
  const raw = params.get('scenario')
  const id = SCENARIO_IDS.find((candidate) => candidate === raw)
  if (id === undefined) return getScenario('iss')
  if (id !== 'custom') return getScenario(id)

  const defaults = getScenario('custom')
  return customScenario(
    numberOrNull(params.get('g')) ?? defaults.gravityG,
    numberOrNull(params.get('o2')) ?? defaults.o2Percent,
    numberOrNull(params.get('p')) ?? defaults.pressureKPa,
  )
}

function compareFrom(params: URLSearchParams): string[] {
  const raw = params.get('compare')
  if (!raw) return []
  const picked = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => EXPERIMENT_IDS.has(value))
  return [...new Set(picked)].slice(-COMPARE_LIMIT)
}

function filtersFrom(params: URLSearchParams): Filters {
  return {
    query: params.get('q') ?? '',
    fuelTypes: enumList(params.get('fuel'), FUEL_TYPES),
    facilities: enumList(params.get('facility'), FACILITIES),
    regimes: enumList(params.get('regime'), REGIMES),
    o2Range: rangeFrom(params.get('o2min'), params.get('o2max'), DEFAULT_FILTERS.o2Range),
    yearRange: rangeFrom(params.get('yearmin'), params.get('yearmax'), DEFAULT_FILTERS.yearRange),
  }
}

function searchFor(state: IgnisState): string {
  const params = new URLSearchParams()
  params.set('scenario', state.scenario.id)

  if (state.scenario.id === 'custom') {
    params.set('g', String(state.scenario.gravityG))
    params.set('o2', String(state.scenario.o2Percent))
    params.set('p', String(state.scenario.pressureKPa))
  }

  if (state.compareIds.length > 0) params.set('compare', state.compareIds.join(','))
  if (state.selectedId !== null) params.set('selected', state.selectedId)

  const { filters } = state
  const query = filters.query.trim()
  if (query) params.set('q', query)
  if (filters.fuelTypes.length > 0) params.set('fuel', filters.fuelTypes.join(','))
  if (filters.facilities.length > 0) params.set('facility', filters.facilities.join(','))
  if (filters.regimes.length > 0) params.set('regime', filters.regimes.join(','))

  if (
    filters.o2Range[0] !== DEFAULT_FILTERS.o2Range[0] ||
    filters.o2Range[1] !== DEFAULT_FILTERS.o2Range[1]
  ) {
    params.set('o2min', String(filters.o2Range[0]))
    params.set('o2max', String(filters.o2Range[1]))
  }

  if (
    filters.yearRange[0] !== DEFAULT_FILTERS.yearRange[0] ||
    filters.yearRange[1] !== DEFAULT_FILTERS.yearRange[1]
  ) {
    params.set('yearmin', String(filters.yearRange[0]))
    params.set('yearmax', String(filters.yearRange[1]))
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

function writeUrl(): void {
  const next = searchFor(useIgnis.getState())
  if (next === window.location.search) return
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${next}${window.location.hash}`,
  )
}

/**
 * Applies the current URL to the store, then canonicalises the URL. Returns
 * nothing; callers only need to know it ran.
 */
function readUrl(): void {
  const params = new URLSearchParams(window.location.search)
  const state = useIgnis.getState()

  state.setScenario(scenarioFrom(params))
  state.setFilters(filtersFrom(params))
  state.clearCompare()
  for (const id of compareFrom(params)) state.toggleCompare(id)
  state.select(params.get('selected'))
}

/**
 * Starts the binding and returns a disposer. Call once at app start; the
 * disposer exists for tests and for a hot-reload boundary.
 */
export function initUrlSync(): () => void {
  let applying = false

  const apply = () => {
    applying = true
    try {
      readUrl()
      writeUrl()
    } finally {
      applying = false
    }
  }

  const unsubscribe = useIgnis.subscribe(() => {
    if (!applying) writeUrl()
  })

  const onPopState = () => apply()

  window.addEventListener('popstate', onPopState)
  apply()

  return () => {
    window.removeEventListener('popstate', onPopState)
    unsubscribe()
  }
}
