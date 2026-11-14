import { beforeEach, describe, expect, it } from 'vitest'
import { useIgnis } from '@/store/useIgnis'
import { defaultWeights } from '@/lib/scoring'
import { getScenario } from '@/lib/scenarios'

beforeEach(() => {
  useIgnis.setState(useIgnis.getInitialState(), true)
})

describe('scenario state', () => {
  it('starts on the ISS cabin', () => {
    expect(useIgnis.getState().scenario.id).toBe('iss')
  })

  it('swaps in a fresh scenario object', () => {
    useIgnis.getState().setScenario(getScenario('mars'))
    expect(useIgnis.getState().scenario.id).toBe('mars')
    expect(useIgnis.getState().scenario.assumption).toBe(true)
  })

  it('keeps a copy so later edits cannot corrupt the presets', () => {
    const mars = getScenario('lunar')
    useIgnis.getState().setScenario(mars)
    mars.gravityG = 9
    expect(useIgnis.getState().scenario.gravityG).toBeCloseTo(0.16)
  })
})

describe('weights', () => {
  it('starts at the documented default', () => {
    expect(useIgnis.getState().weights).toEqual(defaultWeights)
  })

  it('accepts a partial update and clamps to 0..1', () => {
    useIgnis.getState().setWeights({ exploration: 4, recency: -1 })
    const weights = useIgnis.getState().weights
    expect(weights.exploration).toBe(1)
    expect(weights.recency).toBe(0)
    expect(weights.hazardSeverity).toBe(defaultWeights.hazardSeverity)
  })

  it('resets every weight', () => {
    useIgnis.getState().setWeights({ hazardSeverity: 0 })
    useIgnis.getState().resetWeights()
    expect(useIgnis.getState().weights).toEqual(defaultWeights)
  })
})

describe('filters', () => {
  it('starts with everything included', () => {
    const filters = useIgnis.getState().filters
    expect(filters.query).toBe('')
    expect(filters.fuelTypes).toEqual([])
    expect(filters.facilities).toEqual([])
    expect(filters.regimes).toEqual([])
    expect(filters.o2Range).toEqual([0, 100])
    expect(filters.yearRange[0]).toBeLessThanOrEqual(1976)
    expect(filters.yearRange[1]).toBeGreaterThanOrEqual(2026)
  })

  it('merges a partial update without dropping the other fields', () => {
    useIgnis.getState().setFilters({ query: 'saffire' })
    useIgnis.getState().setFilters({ regimes: ['microgravity'] })
    const filters = useIgnis.getState().filters
    expect(filters.query).toBe('saffire')
    expect(filters.regimes).toEqual(['microgravity'])
    expect(filters.o2Range).toEqual([0, 100])
  })

  it('orders a reversed range instead of trusting the caller', () => {
    useIgnis.getState().setFilters({ o2Range: [80, 20] })
    expect(useIgnis.getState().filters.o2Range).toEqual([20, 80])
  })

  it('resets to the initial filters', () => {
    useIgnis.getState().setFilters({ query: 'x', fuelTypes: ['gas'] })
    useIgnis.getState().resetFilters()
    expect(useIgnis.getState().filters).toEqual(useIgnis.getInitialState().filters)
  })
})

describe('compare', () => {
  it('adds and removes an experiment', () => {
    useIgnis.getState().toggleCompare('saffire-i')
    expect(useIgnis.getState().compareIds).toEqual(['saffire-i'])
    useIgnis.getState().toggleCompare('saffire-i')
    expect(useIgnis.getState().compareIds).toEqual([])
  })

  it('caps the tray at four, dropping the oldest addition', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e']) useIgnis.getState().toggleCompare(id)
    expect(useIgnis.getState().compareIds).toEqual(['b', 'c', 'd', 'e'])
  })

  it('ignores an empty id', () => {
    useIgnis.getState().toggleCompare('')
    expect(useIgnis.getState().compareIds).toEqual([])
  })

  it('clears the tray', () => {
    useIgnis.getState().toggleCompare('a')
    useIgnis.getState().clearCompare()
    expect(useIgnis.getState().compareIds).toEqual([])
  })
})

describe('selection and bookmarks', () => {
  it('selects a known experiment', () => {
    useIgnis.getState().select('saffire-i')
    expect(useIgnis.getState().selectedId).toBe('saffire-i')
  })

  it('rejects an unknown id from a hand-edited URL', () => {
    useIgnis.getState().select('made-up')
    expect(useIgnis.getState().selectedId).toBeNull()
  })

  it('clears the selection', () => {
    useIgnis.getState().select('saffire-i')
    useIgnis.getState().select(null)
    expect(useIgnis.getState().selectedId).toBeNull()
  })

  it('toggles a bookmark on and off without duplicating it', () => {
    useIgnis.getState().toggleBookmark('bass')
    expect(useIgnis.getState().bookmarks).toEqual(['bass'])
    useIgnis.getState().toggleBookmark('bass')
    expect(useIgnis.getState().bookmarks).toEqual([])
  })

  it('ignores an empty bookmark id', () => {
    useIgnis.getState().toggleBookmark('')
    expect(useIgnis.getState().bookmarks).toEqual([])
  })
})

describe('overlays', () => {
  it('opens and closes the drawer and the palette', () => {
    useIgnis.getState().setDrawerOpen(true)
    useIgnis.getState().setPaletteOpen(true)
    expect(useIgnis.getState().drawerOpen).toBe(true)
    expect(useIgnis.getState().paletteOpen).toBe(true)
    useIgnis.getState().setDrawerOpen(false)
    useIgnis.getState().setPaletteOpen(false)
    expect(useIgnis.getState().drawerOpen).toBe(false)
    expect(useIgnis.getState().paletteOpen).toBe(false)
  })
})
