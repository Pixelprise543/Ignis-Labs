import { afterEach, describe, expect, it, vi } from 'vitest'
import { askSI, normalizeRequest } from '@/lib/si'
import { offlineAnswer } from '@/lib/siFallback'
import { getScenario } from '@/lib/scenarios'
import { getExperiment, getFinding } from '@/lib/data'
import type { SIRequest } from '@/contracts/types'

const request = (overrides: Partial<SIRequest> = {}): SIRequest => ({
  mode: 'interpret',
  experimentIds: [],
  scenario: getScenario('iss'),
  ...overrides,
})

function mockFetch(response: unknown) {
  const spy = vi.fn(async () => response as Response)
  vi.stubGlobal('fetch', spy)
  return spy
}

const okResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
})

const failResponse = (status: number) => ({
  ok: false,
  status,
  json: async () => ({ error: 'nope' }),
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('normalizeRequest', () => {
  it('returns a usable request for null', () => {
    const normal = normalizeRequest(null)
    expect(normal.mode).toBe('ask')
    expect(normal.scenario.id).toBe('iss')
    expect(normal.experimentIds).toEqual([])
  })

  it('drops unknown experiment ids and duplicates', () => {
    const normal = normalizeRequest({
      mode: 'summarize',
      experimentIds: ['saffire-i', 'not-real', 'saffire-i'],
      scenario: getScenario('mars'),
    })
    expect(normal.experimentIds).toEqual(['saffire-i'])
  })

  it('caps the selection at eight experiments', () => {
    const ids = [
      'saffire-i',
      'saffire-iii',
      'saffire-vi',
      'sofie-rtdfs',
      'sofie-nca',
      'sofie-gel',
      'sofie-mist',
      'sofie-smurf',
      'acme-bre',
      'bass',
    ]
    expect(normalizeRequest({ experimentIds: ids }).experimentIds).toHaveLength(8)
  })

  it('falls back to ask for an unknown mode', () => {
    expect(normalizeRequest({ mode: 'prophesy' }).mode).toBe('ask')
  })

  it('normalises a scenario by id and clamps a custom one', () => {
    expect(normalizeRequest({ scenario: { id: 'lunar' } }).scenario.id).toBe('lunar')
    const custom = normalizeRequest({ scenario: { id: 'custom', gravityG: 9, o2Percent: 500, pressureKPa: 2 } })
    expect(custom.scenario.gravityG).toBe(2)
    expect(custom.scenario.o2Percent).toBe(100)
    expect(custom.scenario.pressureKPa).toBe(5)
  })

  it('trims and caps the question', () => {
    const normal = normalizeRequest({ mode: 'ask', question: `  ${'x'.repeat(900)}  ` })
    expect(normal.question).toHaveLength(500)
  })

  it('ignores a non-string question', () => {
    expect(normalizeRequest({ question: 42 }).question).toBe('')
  })
})

describe('offlineAnswer', () => {
  it('is deterministic, grounded and flagged as a fallback', () => {
    const first = offlineAnswer(request())
    expect(first).toEqual(offlineAnswer(request()))
    expect(first.fallback).toBe(true)
    expect(first.model).toBe('ignis-offline')
    expect(first.invalidCitationsRemoved).toBe(0)
    expect(first.groundingScore).toBeGreaterThan(0)
    expect(first.citations.length).toBeGreaterThan(0)
  })

  it('cites only experiment ids that exist', () => {
    const modes: SIRequest['mode'][] = ['summarize', 'compare', 'interpret', 'ask', 'brief', 'playbook']
    for (const mode of modes) {
      const response = offlineAnswer(
        request({ mode, experimentIds: ['saffire-i', 'sofie-gel'], question: 'oxygen' }),
      )
      for (const citation of response.citations) {
        expect(getExperiment(citation), `${mode}:${citation}`).toBeDefined()
      }
    }
  })

  it('prints only finding ids that exist', () => {
    const modes: SIRequest['mode'][] = ['summarize', 'compare', 'interpret', 'brief', 'playbook']
    for (const mode of modes) {
      const response = offlineAnswer(
        request({ mode, experimentIds: ['saffire-i', 'sofie-gel'], scenario: getScenario('mars') }),
      )
      const tokens = response.answerMarkdown.match(/\b[a-z0-9]+(?:-[a-z0-9]+)*-f\d+\b/g) ?? []
      for (const token of tokens) expect(getFinding(token), `${mode}:${token}`).toBeDefined()
    }
  })

  it('summarises the selected experiments', () => {
    const response = offlineAnswer(
      request({ mode: 'summarize', experimentIds: ['saffire-i', 'bass'] }),
    )
    expect(response.answerMarkdown).toContain('Saffire-I')
    expect(response.answerMarkdown).toContain('BASS')
  })

  it('summarises the top three when nothing is selected', () => {
    const response = offlineAnswer(request({ mode: 'summarize' }))
    expect(response.answerMarkdown).toMatch(/top three/i)
    expect(response.citations).toHaveLength(3)
  })

  it('compares two experiments on their conditions', () => {
    const response = offlineAnswer(
      request({ mode: 'compare', experimentIds: ['saffire-i', 'saffire-vi'] }),
    )
    expect(response.answerMarkdown).toContain('Saffire-I')
    expect(response.answerMarkdown).toContain('Saffire-VI')
    expect(response.answerMarkdown).toMatch(/oxygen/i)
  })

  it('asks for a second experiment when comparison has one', () => {
    const response = offlineAnswer(request({ mode: 'compare', experimentIds: ['saffire-i'] }))
    expect(response.answerMarkdown).toMatch(/add a second|second experiment/i)
  })

  it('interprets the scenario with insights and gaps', () => {
    const response = offlineAnswer(request({ mode: 'interpret', scenario: getScenario('lunar') }))
    expect(response.answerMarkdown).toMatch(/partial-gravity|extrapolat/i)
    expect(response.answerMarkdown).toMatch(/gap/i)
  })

  it('answers an oxygen question with a cited estimate', () => {
    const response = offlineAnswer(
      request({ mode: 'ask', question: 'Is a 34% oxygen cabin riskier on the Moon?' }),
    )
    expect(response.answerMarkdown).toContain('34%')
    expect(response.answerMarkdown).toMatch(/moon|lunar/i)
    expect(response.answerMarkdown).toMatch(/riskier|higher/i)
    expect(response.citations.length).toBeGreaterThan(0)
    expect(response.answerMarkdown).toMatch(/decision-support/i)
  })

  it('answers an oxygen question honestly when the proposal lowers risk', () => {
    const response = offlineAnswer(
      request({ mode: 'ask', question: 'Is a 15% oxygen cabin safer on the ISS?' }),
    )
    expect(response.answerMarkdown).toMatch(/lower|not riskier|safer/i)
  })

  it('falls back to keyword search for a general question', () => {
    const response = offlineAnswer(
      request({ mode: 'ask', question: 'How do you suppress a fabric fire in space?' }),
    )
    expect(response.answerMarkdown.length).toBeGreaterThan(100)
    expect(response.citations.length).toBeGreaterThan(0)
  })

  it('says so when nothing matches instead of inventing an answer', () => {
    const response = offlineAnswer(
      request({ mode: 'ask', question: 'What about titanium plasma vortices?' }),
    )
    expect(response.answerMarkdown).toMatch(/no experiment|no match|nothing/i)
    expect(response.citations).toEqual([])
    expect(response.groundingScore).toBe(0)
  })

  it('prepares a brief with scenario, ranking and limits', () => {
    const response = offlineAnswer(request({ mode: 'brief', scenario: getScenario('mars') }))
    expect(response.answerMarkdown).toContain('Mars transit')
    expect(response.answerMarkdown).toMatch(/decision-support/i)
    expect(response.citations.length).toBeGreaterThan(0)
  })

  it('prepares a playbook with all five phases', () => {
    const response = offlineAnswer(request({ mode: 'playbook' }))
    for (const phase of ['Detect', 'Isolate', 'Suppress', 'Ventilate', 'Recover']) {
      expect(response.answerMarkdown).toContain(phase)
    }
  })
})

describe('askSI: never throws', () => {
  it('falls back when the network rejects', async () => {
    mockFetch(() => Promise.reject(new Error('offline')))
    const response = await askSI(request())
    expect(response.fallback).toBe(true)
    expect(response.model).toBe('ignis-offline')
  })

  it('falls back on a non-200 response', async () => {
    mockFetch(failResponse(503))
    expect((await askSI(request())).fallback).toBe(true)
  })

  it('falls back on invalid JSON', async () => {
    mockFetch({ ok: true, status: 200, json: async () => { throw new Error('bad json') } })
    expect((await askSI(request())).fallback).toBe(true)
  })

  it('falls back on an empty answer', async () => {
    mockFetch(okResponse({ answerMarkdown: '   ', model: 'gpt-4o-mini', fallback: false }))
    expect((await askSI(request())).fallback).toBe(true)
  })

  it('falls back on malformed input rather than throwing', async () => {
    const response = await askSI(null as unknown as SIRequest)
    expect(response.answerMarkdown.length).toBeGreaterThan(0)
    expect(response.fallback).toBe(true)
  })

  it('posts a normalised request to the route', async () => {
    const spy = mockFetch(okResponse({ answerMarkdown: 'Grounded [saffire-i].', model: 'm' }))
    await askSI({ mode: 'summarize', experimentIds: ['nope'], scenario: getScenario('iss') })
    expect(spy).toHaveBeenCalledTimes(1)
    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/si')
    expect(init.method).toBe('POST')
    const body = JSON.parse(String(init.body))
    expect(body.experimentIds).toEqual([])
    expect(body.mode).toBe('summarize')
  })
})

describe('askSI: server answers', () => {
  it('keeps a valid server answer and cites experiment ids', async () => {
    mockFetch(
      okResponse({
        answerMarkdown: 'Saffire-I matters [saffire-i] and so does [sofie-gel].',
        model: 'gpt-4o-mini',
        fallback: false,
      }),
    )
    const response = await askSI(request())
    expect(response.fallback).toBe(false)
    expect(response.model).toBe('gpt-4o-mini')
    expect(response.citations).toEqual(['saffire-i', 'sofie-gel'])
    expect(response.groundingScore).toBe(1)
  })

  it('strips an invented citation and counts it', async () => {
    mockFetch(
      okResponse({
        answerMarkdown: 'Real [saffire-i], invented [made-up].',
        model: 'gpt-4o-mini',
        fallback: false,
      }),
    )
    const response = await askSI(request())
    expect(response.answerMarkdown).not.toContain('[made-up]')
    expect(response.answerMarkdown).toContain('invented made-up')
    expect(response.citations).toEqual(['saffire-i'])
    expect(response.invalidCitationsRemoved).toBe(1)
    expect(response.groundingScore).toBeLessThan(1)
  })

  it('maps a finding citation onto its experiment', async () => {
    mockFetch(
      okResponse({
        answerMarkdown: 'Evidence [saffire-i-f1].',
        model: 'gpt-4o-mini',
        fallback: false,
      }),
    )
    expect((await askSI(request())).citations).toEqual(['saffire-i'])
  })

  it('leaves markdown links alone', async () => {
    mockFetch(
      okResponse({
        answerMarkdown: 'See [NASA](https://www.nasa.gov/) and [saffire-i].',
        model: 'gpt-4o-mini',
        fallback: false,
      }),
    )
    const response = await askSI(request())
    expect(response.answerMarkdown).toContain('[NASA](https://www.nasa.gov/)')
    expect(response.invalidCitationsRemoved).toBe(0)
  })

  it('reports an ungrounded answer as low confidence', async () => {
    mockFetch(
      okResponse({
        answerMarkdown: 'Trust me, it is fine.',
        model: 'gpt-4o-mini',
        fallback: false,
      }),
    )
    const response = await askSI(request())
    expect(response.citations).toEqual([])
    expect(response.groundingScore).toBe(0)
  })
})
