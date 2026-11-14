import type { Experiment, SIRequest, SIResponse } from '../src/contracts/types'
import { auditCitations } from '../src/lib/citations'
import { getExperiment, getExperiments } from '../src/lib/data'
import { scenarioContextLabel } from '../src/lib/scenarios'
import { normalizeRequest } from '../src/lib/si'
import { offlineAnswer } from '../src/lib/siFallback'

/**
 * POST /api/si - the only place a model provider key is read.
 *
 * The browser never sees a key. Without SI_PROVIDER and SI_API_KEY the route
 * serves the deterministic offline answer, so the deployed app works with no
 * secret configured and the same request always returns grounded markdown.
 *
 * A provider answer is audited exactly like a client answer: citations that do
 * not resolve are stripped and the grounding score is attached, so a fluent but
 * ungrounded model cannot masquerade as evidence.
 */

type Provider = 'openai' | 'anthropic' | 'openrouter' | 'none'

const PROVIDERS: Provider[] = ['openai', 'anthropic', 'openrouter', 'none']

const DEFAULT_MODELS: Record<Exclude<Provider, 'none'>, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-latest',
  openrouter: 'openai/gpt-4o-mini',
}

interface ProviderConfig {
  provider: Provider
  apiKey: string
  model: string
}

function readConfig(): ProviderConfig {
  const raw = (process.env.SI_PROVIDER ?? 'none').trim().toLowerCase()
  const provider = PROVIDERS.find((candidate) => candidate === raw) ?? 'none'
  return {
    provider,
    apiKey: (process.env.SI_API_KEY ?? '').trim(),
    model: (process.env.SI_MODEL ?? '').trim(),
  }
}

const MODE_INSTRUCTION: Record<SIRequest['mode'], string> = {
  summarize:
    'Summarise the selected records. For each, state what was tested, what happened and the safety takeaway. Do not add facts that are not in the records.',
  compare:
    'Compare the selected records. Call out differences in gravity, oxygen fraction, pressure, flow and material, and say which difference matters most for the scenario.',
  interpret:
    'Interpret the scenario. Rank the fire-safety concerns by urgency, explain each with record evidence, and name the evidence gaps that remain.',
  ask:
    'Answer the question using only the records. If the records do not answer it, say so and name what evidence would be needed.',
  brief:
    'Write a short mission safety brief: scenario, top ranked records, the three most urgent concerns, evidence gaps and limitations.',
  playbook:
    'Write a crew response playbook with the phases detect, isolate, suppress, ventilate and recover. Cite evidence for every step and keep suppression advice qualitative.',
}

function buildContext(request: SIRequest): string {
  const selected = request.experimentIds
    .map((id) => getExperiment(id))
    .filter((experiment): experiment is Experiment => experiment !== undefined)

  const records = selected.length > 0 ? selected : getExperiments()

  const blocks = records.slice(0, 12).map((experiment) => {
    const findings = experiment.findings.map((finding) => `${finding.id}: ${finding.text}`)
    return [
      `- id: ${experiment.id}`,
      `  acronym: ${experiment.acronym}`,
      `  facility: ${experiment.facility} | regime: ${experiment.regime} | fuel: ${experiment.fuel}`,
      `  years: ${experiment.years[0]}-${experiment.years[1] ?? 'present'} | confidence: ${experiment.confidence}`,
      `  summary: ${experiment.summary}`,
      `  safety takeaway: ${experiment.safetyTakeaway}`,
      `  findings: ${findings.join(' || ')}`,
    ].join('\n')
  })

  return [
    `Scenario: ${scenarioContextLabel(request.scenario)}`,
    `Scenario note: ${request.scenario.assumption ? 'notional design point (assumption)' : 'operational reference'}`,
    '',
    `RECORDS (${records.length} available, showing ${Math.min(12, records.length)}):`,
    ...blocks,
  ].join('\n')
}

const SYSTEM_PROMPT = [
  'You are Ignis, a fire-safety analyst for human spaceflight.',
  'Use only the RECORDS block provided by the user. Do not use outside knowledge to add numbers, materials, experiments or NASA programmes.',
  'Cite every factual claim with a bracketed experiment id from the records, for example [saffire-i].',
  'Never invent an experiment id, a measurement or a source.',
  'If the records do not answer the question, say what is missing instead of guessing.',
  'This is decision support, not a qualified flight procedure. End every answer with one line saying so.',
].join('\n')

function userPrompt(request: SIRequest): string {
  return [
    MODE_INSTRUCTION[request.mode],
    request.question ? `Question: ${request.question}` : '',
    request.context ? `Extra context: ${request.context}` : '',
    '',
    buildContext(request),
  ]
    .filter((line) => line !== '')
    .join('\n')
}

async function callOpenAiCompatible(
  config: ProviderConfig,
  system: string,
  user: string,
): Promise<string> {
  const base =
    config.provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.openai.com/v1'
  const model = config.model || DEFAULT_MODELS[config.provider as Exclude<Provider, 'none'>]

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...(config.provider === 'openrouter'
        ? { 'HTTP-Referer': 'https://ignis.local', 'X-Title': 'Ignis' }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Provider responded ${response.status}`)
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return body.choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(
  config: ProviderConfig,
  system: string,
  user: string,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_MODELS.anthropic,
      max_tokens: 1200,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Provider responded ${response.status}`)
  }

  const body = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>
  }
  return (body.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('')
}

async function callProvider(
  config: ProviderConfig,
  system: string,
  user: string,
): Promise<string> {
  return config.provider === 'anthropic'
    ? callAnthropic(config, system, user)
    : callOpenAiCompatible(config, system, user)
}

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

  const config = readConfig()
  if (config.provider === 'none' || config.apiKey === '') {
    return offlineAnswer(request)
  }

  try {
    const answer = await callProvider(config, SYSTEM_PROMPT, userPrompt(request))
    if (answer.trim() === '') return offlineAnswer(request)

    const audit = auditCitations(answer)
    return {
      answerMarkdown: audit.markdown,
      citations: audit.citations,
      model: config.model || DEFAULT_MODELS[config.provider as Exclude<Provider, 'none'>],
      fallback: false,
      groundingScore: audit.groundingScore,
      invalidCitationsRemoved: audit.invalidCitationsRemoved,
    }
  } catch {
    return offlineAnswer(request)
  }
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
