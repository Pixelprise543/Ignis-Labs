import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useIgnis } from '@/store/useIgnis'
import { initUrlSync } from '@/store/urlSync'
import { getScenario } from '@/lib/scenarios'

let dispose: (() => void) | null = null

function readUrl() {
  return new URLSearchParams(window.location.search)
}

function visit(search: string) {
  window.history.replaceState(null, '', `/${search}`)
}

beforeEach(() => {
  useIgnis.setState(useIgnis.getInitialState(), true)
  visit('')
})

afterEach(() => {
  dispose?.()
  dispose = null
})

describe('initUrlSync: reading the URL', () => {
  it('leaves the defaults alone when the URL is empty', () => {
    dispose = initUrlSync()
    expect(useIgnis.getState().scenario.id).toBe('iss')
    expect(useIgnis.getState().compareIds).toEqual([])
    expect(useIgnis.getState().selectedId).toBeNull()
  })

  it('restores the scenario', () => {
    visit('?scenario=mars')
    dispose = initUrlSync()
    expect(useIgnis.getState().scenario.id).toBe('mars')
    expect(useIgnis.getState().scenario.gravityG).toBeCloseTo(0.38)
  })

  it('falls back to the ISS preset for an unknown scenario', () => {
    visit('?scenario=death-star')
    dispose = initUrlSync()
    expect(useIgnis.getState().scenario.id).toBe('iss')
  })

  it('rebuilds a custom scenario from its three numbers', () => {
    visit('?scenario=custom&g=0.5&o2=30&p=70')
    dispose = initUrlSync()
    const scenario = useIgnis.getState().scenario
    expect(scenario.id).toBe('custom')
    expect(scenario.gravityG).toBeCloseTo(0.5)
    expect(scenario.o2Percent).toBe(30)
    expect(scenario.pressureKPa).toBe(70)
    expect(scenario.assumption).toBe(true)
  })

  it('restores the compare tray, dropping unknown ids and duplicates', () => {
    visit('?compare=saffire-i,not-real,bass,saffire-i')
    dispose = initUrlSync()
    expect(useIgnis.getState().compareIds).toEqual(['saffire-i', 'bass'])
  })

  it('caps a hand-edited compare list at four, dropping the oldest', () => {
    visit('?compare=bass,flex,flex-2,flex-2j,cfi')
    dispose = initUrlSync()
    expect(useIgnis.getState().compareIds).toEqual(['flex', 'flex-2', 'flex-2j', 'cfi'])
  })

  it('restores a valid selection and rejects an invalid one', () => {
    visit('?selected=sofie-gel')
    dispose = initUrlSync()
    expect(useIgnis.getState().selectedId).toBe('sofie-gel')

    dispose()
    useIgnis.setState(useIgnis.getInitialState(), true)
    visit('?selected=not-real')
    dispose = initUrlSync()
    expect(useIgnis.getState().selectedId).toBeNull()
  })

  it('restores search, facet and range filters', () => {
    visit('?q=oxygen&fuel=gas,solid&facility=ISS-CIR&regime=microgravity&o2min=80&o2max=20')
    dispose = initUrlSync()
    const filters = useIgnis.getState().filters
    expect(filters.query).toBe('oxygen')
    expect(filters.fuelTypes).toEqual(['gas', 'solid'])
    expect(filters.facilities).toEqual(['ISS-CIR'])
    expect(filters.regimes).toEqual(['microgravity'])
    expect(filters.o2Range).toEqual([20, 80])
  })

  it('ignores facet values outside the contract enums', () => {
    visit('?fuel=plasma&facility=DeathStar&regime=hyper-g')
    dispose = initUrlSync()
    const filters = useIgnis.getState().filters
    expect(filters.fuelTypes).toEqual([])
    expect(filters.facilities).toEqual([])
    expect(filters.regimes).toEqual([])
  })

  it('ignores non-numeric range bounds instead of producing NaN', () => {
    visit('?o2min=abc&o2max=&yearmin=wat&yearmax=-4')
    dispose = initUrlSync()
    const filters = useIgnis.getState().filters
    expect(filters.o2Range.every(Number.isFinite)).toBe(true)
    expect(filters.yearRange.every(Number.isFinite)).toBe(true)
  })
})

describe('initUrlSync: writing the URL', () => {
  it('writes the scenario when it changes', () => {
    dispose = initUrlSync()
    useIgnis.getState().setScenario(getScenario('eva'))
    expect(readUrl().get('scenario')).toBe('eva')
  })

  it('writes custom gravity, oxygen and pressure', () => {
    dispose = initUrlSync()
    useIgnis.getState().setScenario({
      ...getScenario('custom'),
      gravityG: 0.44,
      o2Percent: 34,
      pressureKPa: 68,
    })
    const params = readUrl()
    expect(params.get('scenario')).toBe('custom')
    expect(params.get('g')).toBe('0.44')
    expect(params.get('o2')).toBe('34')
    expect(params.get('p')).toBe('68')
  })

  it('writes compare, selection and filters', () => {
    dispose = initUrlSync()
    useIgnis.getState().toggleCompare('saffire-i')
    useIgnis.getState().toggleCompare('bass')
    useIgnis.getState().select('saffire-vi')
    useIgnis.getState().setFilters({ query: 'nomex', regimes: ['microgravity'] })
    const params = readUrl()
    expect(params.get('compare')).toBe('saffire-i,bass')
    expect(params.get('selected')).toBe('saffire-vi')
    expect(params.get('q')).toBe('nomex')
    expect(params.get('regime')).toBe('microgravity')
  })

  it('omits parameters that are still at their defaults', () => {
    dispose = initUrlSync()
    useIgnis.getState().resetFilters()
    const params = readUrl()
    expect(params.has('q')).toBe(false)
    expect(params.has('compare')).toBe(false)
    expect(params.has('selected')).toBe(false)
    expect(params.has('fuel')).toBe(false)
    expect(params.has('o2min')).toBe(false)
  })

  it('does not touch the URL for state that is not URL-worthy', () => {
    dispose = initUrlSync()
    const before = window.location.search
    useIgnis.getState().setDrawerOpen(true)
    useIgnis.getState().setPaletteOpen(true)
    useIgnis.getState().setWeights({ exploration: 0.1 })
    useIgnis.getState().toggleBookmark('bass')
    expect(window.location.search).toBe(before)
  })
})

describe('initUrlSync: history and cleanup', () => {
  it('reapplies state on popstate', () => {
    dispose = initUrlSync()
    visit('?scenario=lunar&selected=bass')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(useIgnis.getState().scenario.id).toBe('lunar')
    expect(useIgnis.getState().selectedId).toBe('bass')
  })

  it('stops writing after cleanup', () => {
    dispose = initUrlSync()
    dispose()
    dispose = null
    const before = window.location.search
    useIgnis.getState().setScenario(getScenario('mars'))
    expect(window.location.search).toBe(before)
  })

  it('stops listening for popstate after cleanup', () => {
    dispose = initUrlSync()
    dispose()
    dispose = null
    visit('?scenario=eva')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(useIgnis.getState().scenario.id).toBe('iss')
  })
})

describe('initUrlSync: round trip', () => {
  it('reproduces a full session from its own URL', () => {
    dispose = initUrlSync()
    useIgnis.getState().setScenario(getScenario('mars'))
    useIgnis.getState().toggleCompare('saffire-i')
    useIgnis.getState().toggleCompare('sofie-gel')
    useIgnis.getState().select('saffire-i')
    useIgnis.getState().setFilters({
      query: 'oxygen',
      fuelTypes: ['solid'],
      facilities: ['ISS-CIR'],
      regimes: ['microgravity'],
      o2Range: [10, 90],
    })

    const captured = useIgnis.getState()
    const search = window.location.search

    dispose()
    useIgnis.setState(useIgnis.getInitialState(), true)
    visit(search)
    dispose = initUrlSync()
    const restored = useIgnis.getState()

    expect(restored.scenario).toEqual(captured.scenario)
    expect(restored.compareIds).toEqual(captured.compareIds)
    expect(restored.selectedId).toBe(captured.selectedId)
    expect(restored.filters).toEqual(captured.filters)
  })
})
