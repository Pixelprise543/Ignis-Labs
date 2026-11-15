import { describe, expect, it } from 'vitest'
import handler, { handleSiRequest } from '../api/si'
import { getScenario } from '@/lib/scenarios'

/**
 * The route runs on the Edge runtime in production, so these tests drive it the
 * way Vercel does: a fetch-style `Request` in, a `Response` out.
 */

const post = (body: unknown, method = 'POST') =>
  new Request('https://ignis.local/api/si', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })

describe('handleSiRequest', () => {
  it('serves the offline answer', async () => {
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
})

describe('edge handler', () => {
  it('rejects a non-POST method', async () => {
    const response = await handler(post(undefined, 'GET'))
    expect(response.status).toBe(405)
    const body = (await response.json()) as { error: string }
    expect(body.error).toContain('POST')
  })

  it('returns JSON for a POST', async () => {
    const response = await handler(post({ mode: 'ask', question: 'oxygen' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    const body = (await response.json()) as { answerMarkdown: string }
    expect(body.answerMarkdown.length).toBeGreaterThan(0)
  })

  it('treats an unreadable body as an empty request instead of a 500', async () => {
    const response = await handler(
      new Request('https://ignis.local/api/si', { method: 'POST', body: 'not json' }),
    )
    expect(response.status).toBe(200)
    const body = (await response.json()) as { answerMarkdown: string; fallback: boolean }
    expect(body.fallback).toBe(true)
    expect(body.answerMarkdown.length).toBeGreaterThan(0)
  })
})
