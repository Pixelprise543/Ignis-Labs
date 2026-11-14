import type { Scenario, ScenarioId, SIRequest, SIResponse } from '@/contracts/types'
import { getExperiment } from '@/lib/data'
import { auditCitations } from '@/lib/citations'
import { customScenario, getScenario } from '@/lib/scenarios'
import { offlineAnswer } from '@/lib/siFallback'

/**
 * The browser side of "Ask Ignis".
 *
 * `askSI` normalises whatever the drawer hands it, posts one request to /api/si,
 * and audits the answer's citations before returning it. Any failure - offline,
 * non-200, bad JSON, an empty answer - falls back to the deterministic offline
 * answer, so the drawer never shows an error state and never shows ungrounded
 * prose as if it were evidence.
 */

const MODES: SIRequest['mode'][] = [
  'summarize',
  'compare',
  'interpret',
  'ask',
  'brief',
  'playbook',
]

const SCENARIO_IDS: ScenarioId[] = ['iss', 'lunar', 'mars', 'eva', 'custom']

const MAX_EXPERIMENTS = 8
const MAX_QUESTION = 500
const MAX_CONTEXT = 2000

const numberIn = (value: unknown, fallback: number, min: number, max: number) => {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function scenarioFrom(value: unknown): Scenario {
  if (typeof value !== 'object' || value === null) return getScenario('iss')
  const raw = value as Record<string, unknown>
  const id = typeof raw.id === 'string' ? raw.id : 'iss'

  if (id === 'custom') {
    const defaults = getScenario('custom')
    return customScenario(
      numberIn(raw.gravityG, defaults.gravityG, 0, 2),
      numberIn(raw.o2Percent, defaults.o2Percent, 5, 100),
      numberIn(raw.pressureKPa, defaults.pressureKPa, 5, 150),
    )
  }

  const preset = SCENARIO_IDS.find((candidate) => candidate === id && candidate !== 'custom')
  return getScenario(preset ?? 'iss')
}

/**
 * Accepts anything and returns a valid request. Unknown experiment ids are
 * dropped rather than forwarded, because the server should never receive a
 * citation target that cannot resolve.
 */
export function normalizeRequest(input: unknown): SIRequest {
  const raw =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}

  const mode = MODES.find((candidate) => candidate === raw.mode) ?? 'ask'

  const rawIds = Array.isArray(raw.experimentIds) ? raw.experimentIds : []
  const seen = new Set<string>()
  const experimentIds: string[] = []
  for (const value of rawIds) {
    if (typeof value !== 'string') continue
    const id = value.trim()
    if (id === '' || seen.has(id) || !getExperiment(id)) continue
    seen.add(id)
    experimentIds.push(id)
    if (experimentIds.length === MAX_EXPERIMENTS) break
  }

  const question =
    typeof raw.question === 'string' ? raw.question.trim().slice(0, MAX_QUESTION) : ''

  const context =
    typeof raw.context === 'string' ? raw.context.trim().slice(0, MAX_CONTEXT) : undefined

  return {
    mode,
    experimentIds,
    scenario: scenarioFrom(raw.scenario),
    question,
    ...(context ? { context } : {}),
  }
}

function validateServerAnswer(body: unknown): SIResponse | null {
  if (typeof body !== 'object' || body === null) return null
  const raw = body as Record<string, unknown>
  const answerMarkdown = typeof raw.answerMarkdown === 'string' ? raw.answerMarkdown : ''
  if (answerMarkdown.trim() === '') return null

  const audit = auditCitations(answerMarkdown)
  const model =
    typeof raw.model === 'string' && raw.model.trim() !== '' ? raw.model.trim() : 'ignis-offline'

  return {
    answerMarkdown: audit.markdown,
    citations: audit.citations,
    model,
    fallback: false,
    groundingScore: audit.groundingScore,
    invalidCitationsRemoved: audit.invalidCitationsRemoved,
  }
}

/** Never throws. Every failure path returns the offline answer. */
export async function askSI(request: SIRequest): Promise<SIResponse> {
  let normalised: SIRequest
  try {
    normalised = normalizeRequest(request)
  } catch {
    normalised = normalizeRequest(null)
  }

  try {
    const response = await fetch('/api/si', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalised),
    })

    if (!response.ok) return offlineAnswer(normalised)

    const body: unknown = await response.json()
    return validateServerAnswer(body) ?? offlineAnswer(normalised)
  } catch {
    return offlineAnswer(normalised)
  }
}
