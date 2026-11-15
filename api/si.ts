import type { Experiment, SIRequest, SIResponse } from '../src/contracts/types'
import { offlineAnswer } from '../src/lib/siFallback'
import { normalizeRequest } from '../src/lib/si'
import { auditCitations } from '../src/lib/citations'
import { getExperiments, getExperiment } from '../src/lib/data'
import { scenarioContextLabel, formatGravity } from '../src/lib/scenarios'
import { defaultWeights, rankExperiments } from '../src/lib/scoring'

/**
 * POST /api/si - safety intelligence endpoint.
 *
 * The provider is chosen server-side through SI_PROVIDER so the browser never
 * sees a model key:
 *  - unset / "none": deterministic offline answer built from the local dataset
 *  - anything else with SI_API_KEY set: that provider's OpenAI-compatible chat
 *    completions endpoint, grounded in the dataset, with the deterministic
 *    offline answer as the failure fallback
 *
 * NVIDIA NIM is the recommended provider: set SI_PROVIDER=nvidia,
 * SI_API_KEY=<nvapi-key>, SI_MODEL=<nim-model>. The key is read server-side
 * only and never reaches the browser bundle.
 *
 * Runs on the Edge runtime for the same reason as api/nasa.ts: Vercel bundles
 * the module graph, so a deployment cannot fail on an unresolved import. The
 * dev server calls handleSiRequest directly via vite.config.ts.
 *
 * Honesty: the model is instructed to cite only real experiment ids in
 * brackets. Every answer passes through auditCitations, which strips invented
 * citations and reports a grounding score. The offline fallback is used
 * whenever the model is unavailable, slow, rate-limited, or returns an
 * empty/ungrounded answer.
 */

export const config = { runtime: 'edge' }

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1/chat/completions'
const OPENAI_BASE = 'https://api.openai.com/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 8000
const MAX_EXPERIMENTS_IN_PROMPT = 12
const MAX_PROMPT_CHARS = 6000

/** Default NIM model when SI_MODEL is not set. */
const DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct'

function env(name: string): string | undefined {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : undefined
}

function provider(): string | undefined {
  return env('SI_PROVIDER')
}

function apiKey(): string | undefined {
  return env('SI_API_KEY')
}

function modelId(): string {
  return env('SI_MODEL') ?? DEFAULT_MODEL
}

function isProviderConfigured(): boolean {
  const p = provider()
  return Boolean(p) && p !== 'none' && Boolean(apiKey())
}

function providerBaseUrl(): string {
  return provider() === 'openai' ? OPENAI_BASE : NVIDIA_BASE
}

/**
 * Pick the experiments the model may cite: the selected experiments first, then
 * the top-ranked experiments for the scenario. Deduped, capped, and ordered so
 * the most relevant context arrives first.
 */
function contextExperiments(request: SIRequest): Experiment[] {
  const selected = request.experimentIds
    .map((id) => getExperiment(id))
    .filter((experiment): experiment is Experiment => Boolean(experiment))

  const ranked = rankExperiments(getExperiments(), defaultWeights, request.scenario)
    .map((entry) => entry.experiment)
    .filter((experiment) => !selected.some((s) => s.id === experiment.id))

  const combined = [...selected, ...ranked]
  const seen = new Set<string>()
  const result: Experiment[] = []
  for (const experiment of combined) {
    if (seen.has(experiment.id)) continue
    seen.add(experiment.id)
    result.push(experiment)
    if (result.length === MAX_EXPERIMENTS_IN_PROMPT) break
  }
  return result
}

function experimentLine(experiment: Experiment): string {
  const { conditions } = experiment
  const oxygen = conditions.o2Percent === null ? 'not published' : `${conditions.o2Percent}% O2`
  const pressure =
    conditions.pressureKPa === null ? 'not published' : `${Number(conditions.pressureKPa.toPrecision(3))} kPa`
  const flow = conditions.flowCmPerS === null ? 'not published' : `${conditions.flowCmPerS} cm/s`
  const source = experiment.sources[0]
  const sourceLine = source
    ? `Source: ${source.org} - ${source.title}${source.year ? ` (${source.year})` : ''}`
    : 'no published source'
  return [
    `- [${experiment.id}] ${experiment.acronym} - ${experiment.name}`,
    `  Summary: ${experiment.summary}`,
    `  Conditions: ${formatGravity(conditions.gravityG)} | ${oxygen} | ${pressure} | flow ${flow}`,
    `  Safety takeaway: ${experiment.safetyTakeaway}`,
    `  Confidence: ${experiment.confidence}. ${sourceLine}`,
  ].join('\n')
}

function buildPrompt(request: SIRequest): string {
  const experiments = contextExperiments(request)
  const lines = experiments.map(experimentLine)
  let context = lines.join('\n\n')
  if (context.length > MAX_PROMPT_CHARS) {
    context = context.slice(0, MAX_PROMPT_CHARS).replace(/\n\s*$/, '') + '\n…'
  }

  const scenarioLabel = scenarioContextLabel(request.scenario)
  const assumptionNote = request.scenario.assumption
    ? 'This is a notional design point: treat every number as an assumption to verify.'
    : 'This is an operational reference atmosphere, not an assumption.'

  return [
    'You are Ignis, a fire-safety assistant for NASA microgravity combustion data.',
    'Answer ONLY using the dataset below. Never invent experiment ids, numbers, or sources.',
    'Cite experiments exactly as [experiment-id] (for example [saffire-i]).',
    'If the dataset does not cover the topic, say so instead of making an answer up.',
    `Scenario: ${scenarioLabel}. ${assumptionNote}`,
    '',
    '## Dataset (citable experiments)',
    '',
    context,
    '',
    '## User request',
    `Mode: ${request.mode}`,
    request.question ? `Question: ${request.question}` : '',
    request.context ? `Context: ${request.context}` : '',
    '',
    'Answer in plain language, then list the experiment ids you relied on as [id] citations.',
  ]
    .filter((line) => line !== '')
    .join('\n')
}

async function providerAnswer(request: SIRequest): Promise<SIResponse | null> {
  if (!isProviderConfigured()) return null

  const prompt = buildPrompt(request)

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(providerBaseUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey()}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: modelId(),
        messages: [
          {
            role: 'system',
            content:
              'You are a grounded fire-safety assistant. Cite only real experiment ids from the dataset in brackets. Never invent ids, numbers, or sources.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 700,
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) return null

    const body: unknown = await response.json()
    let content = ''
    if (
      typeof body === 'object' &&
      body !== null &&
      Array.isArray((body as Record<string, unknown>).choices)
    ) {
      const choices = (body as Record<string, unknown>).choices as unknown[]
      if (choices.length > 0) {
        const first = choices[0]
        if (typeof first === 'object' && first !== null) {
          const message = (first as Record<string, unknown>).message
          if (typeof message === 'object' && message !== null) {
            const c = (message as Record<string, unknown>).content
            if (typeof c === 'string') {
              content = c
            }
          }
        }
      }
    }

    if (!content.trim()) return null

    const audit = auditCitations(content)
    return {
      answerMarkdown: audit.markdown,
      citations: audit.citations,
      model: modelId(),
      fallback: false,
      groundingScore: audit.groundingScore,
      invalidCitationsRemoved: audit.invalidCitationsRemoved,
    }
  } catch {
    return null
  }
}

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

  const live = await providerAnswer(request)
  if (live) return live
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
