import { describe, expect, it } from 'vitest'
import { getPlaybook } from '@/lib/playbook'
import { getFinding } from '@/lib/data'
import type { PlaybookStep } from '@/contracts/types'

const PHASES: PlaybookStep['phase'][] = [
  'detect',
  'isolate',
  'suppress',
  'ventilate',
  'recover',
]

describe('getPlaybook: structure', () => {
  it('returns the five response phases in order for every scenario', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      expect(getPlaybook(id).steps.map((step) => step.phase), id).toEqual(PHASES)
    }
  })

  it('writes an action and a rationale for every step', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      for (const step of getPlaybook(id).steps) {
        expect(step.action.length, `${id}:${step.phase}`).toBeGreaterThan(20)
        expect(step.rationale.length, `${id}:${step.phase}`).toBeGreaterThan(30)
      }
    }
  })

  it('links every step to findings that exist', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      for (const step of getPlaybook(id).steps) {
        expect(step.evidenceIds.length, `${id}:${step.phase}`).toBeGreaterThan(0)
        for (const findingId of step.evidenceIds) {
          expect(getFinding(findingId), `${id}:${step.phase} -> ${findingId}`).toBeDefined()
        }
      }
    }
  })

  it('carries caveats on every playbook', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      const caveats = getPlaybook(id).caveats
      expect(caveats.length).toBeGreaterThanOrEqual(2)
      expect(caveats.join(' ')).toMatch(/decision-support|not a qualified/i)
    }
  })

  it('stamps the requested scenario id', () => {
    for (const id of ['iss', 'lunar', 'mars', 'eva'] as const) {
      expect(getPlaybook(id).scenarioId).toBe(id)
    }
  })

  it('is deterministic', () => {
    expect(getPlaybook('mars')).toEqual(getPlaybook('mars'))
  })

  it('returns a fresh object the caller can mutate', () => {
    const first = getPlaybook('iss')
    first.steps[0].action = 'tampered'
    expect(getPlaybook('iss').steps[0].action).not.toBe('tampered')
  })
})

describe('getPlaybook: scenario sensitivity', () => {
  it('sends an EVA crew to the airlock instead of fighting the fire in the suit', () => {
    const text = JSON.stringify(getPlaybook('eva'))
    expect(text).toMatch(/airlock/i)
  })

  it('keeps the airlock out of the ISS cabin playbook', () => {
    const text = JSON.stringify(getPlaybook('iss'))
    expect(text).not.toMatch(/airlock/i)
  })

  it('warns that a lunar or Mars playbook is an extrapolation', () => {
    for (const id of ['lunar', 'mars'] as const) {
      expect(getPlaybook(id).caveats.join(' ')).toMatch(/no partial-gravity|extrapolat/i)
    }
  })

  it('does not put the partial-gravity caveat on the ISS playbook', () => {
    expect(getPlaybook('iss').caveats.join(' ')).not.toMatch(/no partial-gravity/i)
  })

  it('says a sea-level cabin is an assumption only when it is one', () => {
    expect(getPlaybook('lunar').caveats.join(' ')).toMatch(/assumption|notional/i)
    expect(getPlaybook('iss').caveats.join(' ')).not.toMatch(/notional/i)
  })

  it('warns the EVA playbook that the dataset has no suit fire test', () => {
    expect(getPlaybook('eva').caveats.join(' ')).toMatch(/no .*suit/i)
  })

  it('tells the crew not to rely on stopping ventilation to extinguish a fire', () => {
    for (const id of ['iss', 'lunar', 'mars'] as const) {
      const text = JSON.stringify(getPlaybook(id))
      expect(text).toMatch(/stopping the fans|cutting ventilation|starve/i)
    }
  })
})
