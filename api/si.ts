import type { SIRequest, SIResponse } from '../src/contracts/types'
import { offlineAnswer } from '../src/lib/siFallback'
import { normalizeRequest } from '../src/lib/si'

/**
 * POST /api/si - safety intelligence endpoint.
 *
 * Simplified build: always returns the deterministic offline answer built from
 * the local dataset. No API keys, no model providers, no secrets. The browser
 * never sees a key because none is needed.
 *
 * Runs on the Edge runtime on purpose. Vercel's Node runtime transpiles each
 * file separately, which cannot resolve a `@/` alias or an extensionless ESM
 * import, so the deployed function crashed with ERR_MODULE_NOT_FOUND while the
 * dev server (Vite) worked. The Edge runtime bundles the module graph, so the
 * same imports resolve in production.
 */

/** Tells Vercel to bundle this module graph into an edge function. */
export const config = { runtime: 'edge' }

/**
 * The route's whole behaviour, exported so a test - and the Vite dev
 * middleware in vite.config.ts - can call it without a server.
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

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/** Vercel edge handler. The dev server calls handleSiRequest directly. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Use POST for /api/si' }, 405)
  }

  let body: unknown = {}
  try {
    body = await req.json()
  } catch {
    // An unreadable body is treated as an empty request, not an error: the
    // deterministic answer still works and the client never sees a 500.
    body = {}
  }

  try {
    const result = await handleSiRequest(body)
    return json(result, 200)
  } catch (error) {
    return json(
      {
        error: 'The answer engine failed on that request.',
        detail: error instanceof Error ? error.message : String(error),
      },
      503,
    )
  }
}
