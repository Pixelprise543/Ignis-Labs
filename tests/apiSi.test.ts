import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { handleSiRequest } from '../api/si'
import { getScenario } from '@/lib/scenarios'

afterEach(() => {
  delete process.env.SI_PROVIDER
  delete process.env.SI_API_KEY
  delete process.env.SI_MODEL
  vi.unstubAllGlobals()
})

describe('handleSiRequest', () => {
  it('serves the offline answer when no provider is configured', async () => {
    const result = await handleSiRequest({ mode: 'interpret', scenario: getScenario('mars') })
    expect(result.fallback).toBe(true)
    expect(result.model).toBe('ignis-offline')
    expect(result.citations.length).toBeGreaterThan(0)
  })

  it('never throws on malformed input', async () => {
    const result = await handleSiRequest('wat')
    expect(result.answerMarkdown.length).toBeGreaterThan(0)
    expect(result.fallback).toBe(true)
  })

  it('audits a provider answer and strips invented citations', async () => {
    process.env.SI_PROVIDER = 'openai'
    process.env.SI_API_KEY = 'test-key'
    process.env.SI_MODEL = 'test-model'

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: 'Grounded [saffire-i], invented [nope].' } }],
        }),
      })),
    )

    const result = await handleSiRequest({
      mode: 'summarize',
      experimentIds: ['saffire-i'],
      scenario: getScenario('iss'),
    })

    expect(result.fallback).toBe(false)
    expect(result.model).toBe('test-model')
    expect(result.citations).toEqual(['saffire-i'])
    expect(result.invalidCitationsRemoved).toBe(1)
    expect(result.answerMarkdown).toContain('invented nope')
  })

  it('falls back when the provider fails', async () => {
    process.env.SI_PROVIDER = 'openai'
    process.env.SI_API_KEY = 'test-key'

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('provider down')
      }),
    )

    const result = await handleSiRequest({ mode: 'compare', scenario: getScenario('iss') })
    expect(result.fallback).toBe(true)
  })

  it('nvidia provider answers and cites real experiments', async () => {
    process.env.SI_PROVIDER = 'nvidia'
    process.env.SI_API_KEY = 'nvapi-test-key'
    process.env.SI_MODEL = 'meta/llama-3.1-8b-instruct'

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: 'Saffire-I showed it [saffire-i].' } }],
        }),
      })),
    )

    const result = await handleSiRequest({
      mode: 'summarize',
      experimentIds: ['saffire-i'],
      scenario: getScenario('iss'),
    })

    expect(result.fallback).toBe(false)
    expect(result.model).toBe('meta/llama-3.1-8b-instruct')
    expect(result.citations).toEqual(['saffire-i'])
    expect(result.invalidCitationsRemoved).toBe(0)
  })
})

describe('default handler', () => {
  it('rejects a non-POST method', async () => {
    const response = await handler(new Request('http://x/api/si', { method: 'GET' }))

    expect(response.status).toBe(405)
    const text = await response.text()
    expect(text).toContain('POST')
  })

  it('returns JSON for a POST', async () => {
    const response = await handler(
      new Request('http://x/api/si', {
        method: 'POST',
        body: JSON.stringify({ mode: 'playbook' }),
        headers: { 'Content-Type': 'application/json' },
      })
    )

    expect(response.status).toBe(200)
    const parsed = JSON.parse(await response.text()) as { answerMarkdown: string }
    expect(parsed.answerMarkdown).toContain('Detect')
  })
})
