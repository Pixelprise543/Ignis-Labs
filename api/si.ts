import type { SIRequest, SIResponse } from '../src/contracts/types'
import { offlineAnswer } from '../src/lib/siFallback'
import { normalizeRequest } from '../src/lib/si'

/**
 * POST /api/si - safety intelligence endpoint.
 *
 * Simplified build: always returns the deterministic offline answer built from
 * the local dataset. No API keys, no model providers, no secrets. The browser
 * never sees a key because none is needed.
 */

/**
 * The route's whole behaviour, exported so a test can call it without a server.
 * Never throws, never returns an ungrounded answer unmarked.
 */
export async function handleSiRequest(input: unknown): Promise<SIResponse> {
  let request: SIRequest
  try {
    request = normalizeRequest(input)
  } catch {
    request = normalizeRequest(null)
  }

  return offlineAnswer(request)
}

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  statusCode: number
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
}

/** Vercel/Node handler. The dev server calls handleSiRequest directly. */
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Use POST for /api/si' }))
    return
  }

  const body =
    typeof req.body === 'string'
      ? (() => {
          try {
            return JSON.parse(req.body) as unknown
          } catch {
            return {}
          }
        })()
      : req.body

  const result = await handleSiRequest(body)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
}
