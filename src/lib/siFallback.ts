import type { Experiment, SIRequest, SIResponse } from '@/contracts/types'
import { getExperiment, getExperiments } from '@/lib/data'
import { getGaps } from '@/lib/coverage'
import { getInsights } from '@/lib/insights'
import { getPlaybook } from '@/lib/playbook'
import { defaultWeights, rankExperiments } from '@/lib/scoring'
import { searchExperiments } from '@/lib/search'
import { formatGravity, getScenario, scenarioContextLabel } from '@/lib/scenarios'
import { simulateRisk } from '@/lib/simulator'

/**
 * The offline SI answer.
 *
 * Every mode is rendered from the dataset with the same functions the UI uses, so
 * the fallback cannot disagree with a page. Nothing here is generated prose: a
 * summary is the record's own summary, an interpretation is the insight rules, and
 * a comparison is the published conditions. That is the point - if the model is
 * unavailable, the app still answers with evidence rather than an apology.
 *
 * The only heuristic is the keyword search for a free-form question, and it says
 * when it found nothing instead of inventing a match.
 */

const OFFLINE_MODEL = 'ignis-offline'

const STOPWORDS = new Set([
  'a', 'about', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been',
  'being', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'for', 'from', 'had',
  'has', 'have', 'he', 'her', 'here', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'just', 'may', 'me', 'might', 'more', 'most', 'must', 'my', 'no',
  'nor', 'not', 'of', 'on', 'only', 'or', 'our', 'over', 'shall', 'she', 'should',
  'so', 'some', 'space', 'spacecraft', 'than', 'that', 'the', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'those', 'to', 'under', 'us', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'without', 'would', 'yes', 'you', 'your',
])

const OXYGEN_EVIDENCE = ['saffire-vi', 'sofie-gel', 'acme-flame-design']

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function resolveExperiments(ids: string[]): Experiment[] {
  const seen = new Set<string>()
  const resolved: Experiment[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    const experiment = getExperiment(id)
    if (!experiment) continue
    seen.add(id)
    resolved.push(experiment)
  }
  return resolved
}

function findingsToExperimentIds(findingIds: string[]): string[] {
  const ids: string[] = []
  for (const findingId of findingIds) {
    const parent = getExperiment(findingId.split(/-f\d+$/)[0] ?? '')
    if (parent) ids.push(parent.id)
  }
  return unique(ids)
}

function conditionsLine(experiment: Experiment): string {
  const { conditions } = experiment
  const oxygen =
    conditions.o2Percent === null ? 'not published' : `${conditions.o2Percent}% O2`
  const pressure =
    conditions.pressureKPa === null
      ? 'not published'
      : `${Number(conditions.pressureKPa.toPrecision(3))} kPa`
  const flow =
    conditions.flowCmPerS === null ? 'not published' : `${conditions.flowCmPerS} cm/s`
  return `**Conditions:** ${formatGravity(conditions.gravityG)} | ${oxygen} | ${pressure} | flow ${flow}`
}

function findingLines(experiment: Experiment, limit = 3): string[] {
  return experiment.findings
    .slice(0, limit)
    .map((finding) => `- ${finding.text} [${finding.id}]`)
}

function sourceLine(experiment: Experiment): string {
  const source = experiment.sources[0]
  if (!source) return ''
  const link = source.url ? ` <${source.url}>` : ''
  return `*Source: ${source.org} - ${source.title}${source.year ? ` (${source.year})` : ''}${link}*`
}

function recordBlock(experiment: Experiment): string {
  return [
    `### ${experiment.acronym} - ${experiment.name}`,
    '',
    experiment.summary,
    '',
    `**Safety takeaway:** ${experiment.safetyTakeaway}`,
    '',
    conditionsLine(experiment),
    '',
    ...findingLines(experiment),
    '',
    sourceLine(experiment),
  ].join('\n')
}

function respond(markdown: string, experiments: Experiment[]): SIResponse {
  const citations = unique(experiments.map((experiment) => experiment.id))
  return {
    answerMarkdown: markdown,
    citations,
    model: OFFLINE_MODEL,
    fallback: true,
    groundingScore: citations.length > 0 ? 1 : 0,
    invalidCitationsRemoved: 0,
  }
}

function summarise(request: SIRequest): SIResponse {
  const selected = resolveExperiments(request.experimentIds)
  const ranked = rankExperiments(getExperiments(), defaultWeights, request.scenario)
  const top = ranked.slice(0, 3).map((entry) => entry.experiment)
  const shown = selected.length > 0 ? selected : top

  const intro =
    selected.length > 0
      ? `Here is a summary of the ${shown.length} selected experiment${shown.length === 1 ? '' : 's'} for ${request.scenario.label}.`
      : `No experiments were selected, so here are the top three for ${request.scenario.label}.`

  const markdown = [intro, '', ...shown.flatMap((experiment) => [recordBlock(experiment), ''])]

  return respond(markdown.join('\n').trimEnd(), shown)
}

function compare(request: SIRequest): SIResponse {
  const selected = resolveExperiments(request.experimentIds)

  if (selected.length < 2) {
    const only = selected[0]
    const lines = [
      only
        ? `Only **${only.acronym}** is selected. Add a second experiment to compare; the Compare view takes two to four.`
        : 'No experiments are selected. Add a second experiment to compare.',
    ]
    if (only) lines.push('', recordBlock(only))
    return respond(lines.join('\n'), only ? [only] : [])
  }

  const header =
    '| Experiment | Facility | Gravity | Oxygen | Pressure | Flow | Fuel | Confidence |'
  const divider = '| --- | --- | --- | --- | --- | --- | --- | --- |'
  const rows = selected.map((experiment) => {
    const { conditions } = experiment
    const cells = [
      experiment.acronym,
      experiment.facility,
      formatGravity(conditions.gravityG),
      conditions.o2Percent === null ? 'not published' : `${conditions.o2Percent}%`,
      conditions.pressureKPa === null
        ? 'not published'
        : Number(conditions.pressureKPa.toPrecision(3)).toString(),
      conditions.flowCmPerS === null ? 'not published' : `${conditions.flowCmPerS} cm/s`,
      experiment.fuel,
      experiment.confidence,
    ]
    return `| ${cells.map((cell) => cell.replace(/\|/g, '/')).join(' | ')} |`
  })

  const notes = selected.map((experiment) => {
    const { conditions } = experiment
    const oxygen =
      conditions.o2Percent === null
        ? 'no published oxygen fraction'
        : `${conditions.o2Percent}% oxygen`
    const pressure =
      conditions.pressureKPa === null
        ? 'no published pressure'
        : `${Number(conditions.pressureKPa.toPrecision(3))} kPa`
    return `- **${experiment.acronym}**: ${formatGravity(conditions.gravityG)}, ${oxygen}, ${pressure}. ${experiment.safetyTakeaway}`
  })

  const markdown = [
    `## Comparing ${selected.map((experiment) => experiment.acronym).join(' vs ')}`,
    '',
    header,
    divider,
    ...rows,
    '',
    '### What the comparison shows',
    '',
    ...notes,
    '',
    'Conditions are the published test conditions, not the conditions of a design. A missing value is left as not published rather than estimated.',
  ].join('\n')

  return respond(markdown, selected)
}

function interpret(request: SIRequest): SIResponse {
  const { scenario } = request
  const insights = getInsights(scenario).slice(0, 3)
  const gaps = getGaps(scenario)
  const ranked = rankExperiments(getExperiments(), defaultWeights, scenario).slice(0, 3)

  const insightBlock = insights.flatMap((insight, index) => [
    `### ${index + 1}. ${insight.title} (${insight.severity})`,
    '',
    insight.summary,
    '',
    `**Recommendation:** ${insight.recommendation}`,
    '',
    `*Evidence: ${insight.evidenceIds.map((id) => `[${id}]`).join(', ')}*`,
    '',
  ])

  const gapBlock =
    gaps.length === 0
      ? ['No empty gravity or oxygen cells remain for this scenario.']
      : gaps.map(
          (cell) =>
            `- **${cell.gravityBand} / ${cell.o2Band}**: no experiments (${cell.experimentIds.length} of 0 measured)`,
        )

  const markdown = [
    `## Interpretation for ${scenarioContextLabel(scenario)}`,
    '',
    scenario.assumption
      ? 'This atmosphere is a notional design point, so every number below is an assumption to verify.'
      : 'This atmosphere is an operational reference, not an assumption.',
    '',
    ...insightBlock,
    '## Evidence gaps',
    '',
    ...gapBlock,
    '',
    '### Closest records',
    '',
    ...ranked.map(
      (entry) =>
        `- **${entry.experiment.acronym}** (${entry.composite}/100): ${entry.experiment.safetyTakeaway}`,
    ),
    '',
    'Rankings and gaps are decision-support estimates assembled from the published records, not physics simulations.',
  ].join('\n')

  const cited = [
    ...ranked.map((entry) => entry.experiment),
    ...unique(insights.flatMap((insight) => insight.evidenceIds))
      .map((id) => getExperiment(id.split(/-f\d+$/)[0] ?? ''))
      .filter((experiment): experiment is Experiment => experiment !== undefined),
  ]

  return respond(markdown, cited)
}

function oxygenAnswer(request: SIRequest, proposedPercent: number): SIResponse {
  const question = request.question ?? ''
  const context = /moon|lunar/i.test(question)
    ? getScenario('lunar')
    : /mars|martian/i.test(question)
      ? getScenario('mars')
      : /eva|suit/i.test(question)
        ? getScenario('eva')
        : /iss|station/i.test(question)
          ? getScenario('iss')
          : request.scenario

  const baselinePercent = context.o2Percent
  const material = 'sibal-fabric'
  const simulate = (o2Percent: number) =>
    simulateRisk({
      materialId: material,
      gravityG: context.gravityG,
      o2Percent,
      pressureKPa: context.pressureKPa,
      flowCmPerS: 5,
    })

  const baseline = simulate(baselinePercent)
  const proposed = simulate(proposedPercent)
  const delta = proposed.risk - baseline.risk

  const verdict =
    delta > 0
      ? `yes - a ${proposedPercent}% oxygen cabin is riskier than the ${baselinePercent}% baseline`
      : delta < 0
        ? `no - a ${proposedPercent}% oxygen cabin is lower risk than the ${baselinePercent}% baseline`
        : `about the same - a ${proposedPercent}% oxygen cabin scores the same as the ${baselinePercent}% baseline`

  const oxygenDriver = proposed.drivers.find((driver) => driver.factor === 'Oxygen')
  const driverNote = oxygenDriver
    ? `The oxygen term moves the score because ${oxygenDriver.explanation.charAt(0).toLowerCase()}${oxygenDriver.explanation.slice(1)}`
    : 'The oxygen term does not move the score at this fraction, so the difference is in the other terms.'

  const markdown = [
    `**Short answer: ${verdict}.**`,
    '',
    `On the ${context.label.toLowerCase()} the estimator puts ${material.replace(/-/g, ' ')} at ${proposed.risk}/100 at ${proposedPercent}% O2 versus ${baseline.risk}/100 at ${baselinePercent}% O2.`,
    '',
    driverNote,
    '',
    'Higher oxygen lowers ignition energy and widens the range of materials that will sustain a flame, and a material qualified in sea-level air has not been qualified at this fraction.',
    '',
    '*Decision-support estimate, not a physics simulation. Test the shortlisted material at the planned atmosphere before it informs a design decision.*',
    '',
    `*Evidence: ${OXYGEN_EVIDENCE.map((id) => `[${id}]`).join(', ')}*`,
  ].join('\n')

  const cited = resolveExperiments(OXYGEN_EVIDENCE)
  return respond(markdown, cited)
}

function keywords(question: string): string[] {
  return unique(
    question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  )
}

function keywordAnswer(terms: string[]): SIResponse {
  const all = getExperiments()
  let matches = searchExperiments(terms.join(' '), all)

  if (matches.length === 0) {
    const union: Experiment[] = []
    for (const term of terms) {
      for (const experiment of searchExperiments(term, all).slice(0, 3)) {
        if (!union.some((existing) => existing.id === experiment.id)) union.push(experiment)
      }
    }
    matches = union
  }

  if (matches.length === 0) {
    return respond(
      [
        `**No experiment in the dataset matches that question.** The dataset holds ${all.length} records about microgravity and drop-tower combustion; nothing in it covers that topic, and inventing an answer would be worse than saying so.`,
        '',
        'Try a material (Nomex, cotton, plexiglass), a behaviour (extinction, flame spread, smouldering) or a facility (Saffire, SoFIE, ACME, drop tower).',
      ].join('\n'),
      [],
    )
  }

  const shown = matches.slice(0, 3)
  const markdown = [
    `## Closest records for that question`,
    '',
    `The dataset has no single experiment written to answer this, so these are the ${shown.length} closest records by keyword match.`,
    '',
    ...shown.flatMap((experiment) => [recordBlock(experiment), '']),
    '*Decision-support summary of the cited records, not a physics simulation.*',
  ].join('\n')

  return respond(markdown, shown)
}

function ask(request: SIRequest): SIResponse {
  const question = request.question ?? ''

  const oxygenMatch =
    question.match(/(\d{1,3}(?:\.\d+)?)\s*%\s*(?:o2|oxygen)/i) ??
    question.match(/(?:o2|oxygen)[^0-9%]{0,16}(\d{1,3}(?:\.\d+)?)\s*%/i)

  if (oxygenMatch) {
    return oxygenAnswer(request, clamp(Number(oxygenMatch[1]), 0, 100))
  }

  const terms = keywords(question)
  if (terms.length === 0) {
    return respond(
      '**No experiment in the dataset matches that question.** Ask about a material, a facility, a gravity regime or a fire behaviour and the summary will cite the records it uses.',
      [],
    )
  }

  return keywordAnswer(terms)
}

function brief(request: SIRequest): SIResponse {
  const { scenario } = request
  const ranked = rankExperiments(getExperiments(), defaultWeights, scenario).slice(0, 4)
  const insights = getInsights(scenario).slice(0, 3)
  const gaps = getGaps(scenario)

  const markdown = [
    `# Mission safety brief - ${scenario.label}`,
    '',
    `**Scenario:** ${scenarioContextLabel(scenario)}. ${scenario.assumption ? 'Notional design point: the atmosphere is an assumption to verify.' : 'Operational reference atmosphere.'}`,
    '',
    '## Top ranked experiments',
    '',
    ...ranked.map(
      (entry, index) =>
        `${index + 1}. **${entry.experiment.acronym}** - ${entry.composite}/100, ${entry.experiment.confidence}. ${entry.experiment.safetyTakeaway}`,
    ),
    '',
    '## Most urgent findings',
    '',
    ...insights.map((insight) => `- **${insight.title}** (${insight.severity}): ${insight.summary}`),
    '',
    '## Evidence gaps',
    '',
    ...(gaps.length === 0
      ? ['No empty gravity or oxygen cells remain for this scenario.']
      : gaps.map((cell) => `- **${cell.gravityBand} / ${cell.o2Band}**: no experiments`)),
    '',
    '## Limitations',
    '',
    '- Rankings and estimates are decision-support estimates, not physics simulations.',
    '- A metric with no published value is shown as not published rather than estimated.',
    '- No partial-gravity flame-spread experiment exists in this dataset, so lunar and Mars conclusions are extrapolations.',
  ].join('\n')

  return respond(markdown, ranked.map((entry) => entry.experiment))
}

function playbook(request: SIRequest): SIResponse {
  const playbookData = getPlaybook(request.scenario.id)
  const phaseName = (phase: string) => `${phase.charAt(0).toUpperCase()}${phase.slice(1)}`

  const markdown = [
    `## Crew response playbook - ${request.scenario.label}`,
    '',
    ...playbookData.steps.flatMap((step, index) => [
      `${index + 1}. **${phaseName(step.phase)}.** ${step.action}`,
      '',
      `   *Why:* ${step.rationale}`,
      '',
      `   *Evidence:* ${step.evidenceIds.map((id) => `[${id}]`).join(', ')}`,
      '',
    ]),
    '## Caveats',
    '',
    ...playbookData.caveats.map((caveat) => `- ${caveat}`),
  ].join('\n')

  const cited = findingsToExperimentIds(playbookData.steps.flatMap((step) => step.evidenceIds))
    .map((id) => getExperiment(id))
    .filter((experiment): experiment is Experiment => experiment !== undefined)

  return respond(markdown, cited)
}

/**
 * Deterministic offline answer for any valid request. Never throws: an
 * unrecognised mode falls back to the free-form answer path.
 */
export function offlineAnswer(request: SIRequest): SIResponse {
  switch (request.mode) {
    case 'summarize':
      return summarise(request)
    case 'compare':
      return compare(request)
    case 'interpret':
      return interpret(request)
    case 'ask':
      return ask(request)
    case 'brief':
      return brief(request)
    case 'playbook':
      return playbook(request)
    default:
      return ask(request)
  }
}
