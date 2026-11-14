import { describe, expect, it } from 'vitest'
import handler, { handleSiRequest } from '../api/si'
import { getScenario } from '@/lib/scenarios'

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

describe('default handler', () => {
  it('rejects a non-POST method', async () => {
    const chunks: string[] = []
    const res = {
      statusCode: 0,
      setHeader: () => undefined,
      end: (body?: string) => {
        if (body) chunks.push(body)
      },
    }

    await handler({ method: 'GET' }, res)

    expect(res.statusCode).toBe(405)
    expect(chunks[0]).toContain('POST')
  })

  it('returns JSON for a POST', async () => {
    const chunks: string[] = []
    const res = {
      statusCode: 0,
      setHeader: () => undefined,
      end: (body?: string) => {
        if (body) chunks.push(body)
      },
    }

    await handler({ method: 'POST', body: { mode: 'playbook' } }, res)

    expect(res.statusCode).toBe(200)
    const parsed = JSON.parse(chunks[0]) as { answerMarkdown: string }
    expect(parsed.answerMarkdown).toContain('Detect')
  })
})
