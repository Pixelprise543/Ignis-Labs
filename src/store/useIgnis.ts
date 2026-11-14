import { create } from 'zustand'
import type {
  Facility,
  FuelType,
  GravityRegime,
  Scenario,
  ScoreWeights,
} from '@/contracts/types'
import { getScenario } from '@/lib/scenarios'
import { defaultWeights } from '@/lib/scoring'
import { getExperiments } from '@/lib/data'

/**
 * The single client-side state container. Views read and write here; nothing
 * else keeps cross-page state.
 *
 * Rules that matter:
 * - Presets from @/lib/scenarios are frozen inputs. setScenario stores a copy,
 *   so a caller that later mutates its object cannot corrupt the app.
 * - Weights are clamped to 0..1. The ranking normalises them anyway, but the
 *   sliders should never show a value they cannot express.
 * - Ranges are stored in ascending order even if a caller passes them reversed.
 * - The compare tray holds at most four records; adding a fifth drops the
 *   oldest selection rather than refusing the action silently.
 * - A selection is validated against the dataset, because selectedId can arrive
 *   from a hand-edited URL.
 */

export interface Filters {
  query: string
  fuelTypes: FuelType[]
  facilities: Facility[]
  regimes: GravityRegime[]
  o2Range: [number, number]
  yearRange: [number, number]
}

export interface IgnisState {
  scenario: Scenario
  setScenario: (scenario: Scenario) => void

  weights: ScoreWeights
  setWeights: (weights: Partial<ScoreWeights>) => void
  resetWeights: () => void

  filters: Filters
  setFilters: (filters: Partial<Filters>) => void
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

const EXPERIMENT_IDS = new Set(getExperiments().map((experiment) => experiment.id))

const CURRENT_YEAR = new Date().getFullYear()

const DATA_START = Math.min(...getExperiments().map((experiment) => experiment.years[0]))
const DATA_END = Math.max(
  ...getExperiments().map((experiment) => experiment.years[1] ?? CURRENT_YEAR),
)

/** Compare tray size. Four columns is the widest that still reads on a laptop. */
export const COMPARE_LIMIT = 4

const clamp01 = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

const ascend = (range: [number, number]): [number, number] =>
  range[0] <= range[1] ? [range[0], range[1]] : [range[1], range[0]]

function initialFilters(): Filters {
  return {
    query: '',
    fuelTypes: [],
    facilities: [],
    regimes: [],
    o2Range: [0, 100],
    yearRange: [DATA_START, DATA_END],
  }
}

export const useIgnis = create<IgnisState>()((set) => ({
  scenario: { ...getScenario('iss') },
  setScenario: (scenario) => set({ scenario: { ...scenario } }),

  weights: { ...defaultWeights },
  setWeights: (weights) =>
    set((state) => {
      const next: ScoreWeights = { ...state.weights }
      for (const key of Object.keys(next) as Array<keyof ScoreWeights>) {
        const value = weights[key]
        if (value !== undefined) next[key] = clamp01(value)
      }
      return { weights: next }
    }),
  resetWeights: () => set({ weights: { ...defaultWeights } }),

  filters: initialFilters(),
  setFilters: (filters) =>
    set((state) => {
      const next: Filters = {
        ...state.filters,
        ...filters,
        fuelTypes: filters.fuelTypes ? [...filters.fuelTypes] : state.filters.fuelTypes,
        facilities: filters.facilities ? [...filters.facilities] : state.filters.facilities,
        regimes: filters.regimes ? [...filters.regimes] : state.filters.regimes,
        o2Range: filters.o2Range ? ascend(filters.o2Range) : state.filters.o2Range,
        yearRange: filters.yearRange ? ascend(filters.yearRange) : state.filters.yearRange,
      }
      return { filters: next }
    }),
  resetFilters: () => set({ filters: initialFilters() }),

  compareIds: [],
  toggleCompare: (id) =>
    set((state) => {
      if (!id) return state
      if (state.compareIds.includes(id)) {
        return { compareIds: state.compareIds.filter((existing) => existing !== id) }
      }
      const appended = [...state.compareIds, id]
      return { compareIds: appended.slice(-COMPARE_LIMIT) }
    }),
  clearCompare: () => set({ compareIds: [] }),

  selectedId: null,
  select: (id) => set({ selectedId: id !== null && EXPERIMENT_IDS.has(id) ? id : null }),

  bookmarks: [],
  toggleBookmark: (id) =>
    set((state) => {
      if (!id) return state
      return state.bookmarks.includes(id)
        ? { bookmarks: state.bookmarks.filter((existing) => existing !== id) }
        : { bookmarks: [...state.bookmarks, id] }
    }),

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}))
