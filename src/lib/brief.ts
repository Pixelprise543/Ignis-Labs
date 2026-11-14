import type { Experiment, Scenario, ScoreWeights } from '@/contracts/types'
import { getExperiment, getExperiments } from '@/lib/data'
import { getGaps } from '@/lib/coverage'
import { getInsights } from '@/lib/insights'
import { getPlaybook } from '@/lib/playbook'
import { defaultWeights, rankExperiments } from '@/lib/scoring'
import { formatGravity } from '@/lib/scenarios'

/**
 * The one-click Mission Safety Brief.
 *
 * A pure markdown builder so the same text can be copied, downloaded or printed to
 * PDF without a second rendering path. Every cited number comes from the dataset
 * or from the same scoring functions the Rankings page uses, and the limitations
 * section states what the brief is not.
 */

const round1 = (value: number) => Math.round(value * 10) / 10

const orNotPublished = (value: number | null, unit: string) =>
  value === null ? 'not published' : `${Number(value.toPrecision(3))} ${unit}`

function scenarioTable(scenario: Scenario): string {
  return [
    '| Field | Value |',
    '| --- | --- |',
    `| Gravity | ${formatGravity(scenario.gravityG)} |`,
    `| Oxygen | ${scenario.o2Percent}% |`,
    `| Pressure | ${Number(scenario.pressureKPa.toPrecision(3))} kPa |`,
    `| Design status | ${scenario.assumption ? 'Notional design point (assumption)' : 'Operational reference'} |`,
  ].join('\n')
}

function insightSection(scenario: Scenario): string {
  const insights = getInsights(scenario).slice(0, 3)
  return insights
    .map((insight, index) => {
      const evidence = insight.evidenceIds.map((id) => `\`${id}\``).join(', ')
      return [
        `### ${index + 1}. ${insight.title} (${insight.severity})`,
        '',
        insight.summary,
        '',
        `**Recommendation:** ${insight.recommendation}`,
        '',
        `*Evidence: ${evidence}*`,
      ].join('\n')
    })
    .join('\n\n')
}

function rankingSection(scenario: Scenario, weights: ScoreWeights): string {
  const ranked = rankExperiments(getExperiments(), weights, scenario).slice(0, 5)
  return ranked
    .map(
      (entry, index) =>
        `${index + 1}. **${entry.experiment.acronym}** - ${entry.composite}/100, ${entry.experiment.confidence}. ${entry.rationale}`,
    )
    .join('\n')
}

function compareSection(experiments: Experiment[]): string | null {
  if (experiments.length === 0) return null

  const rows = experiments.map((experiment) =>
    [
      experiment.acronym,
      experiment.facility,
      formatGravity(experiment.conditions.gravityG),
      orNotPublished(experiment.conditions.o2Percent, '% O2'),
      orNotPublished(experiment.conditions.pressureKPa, 'kPa'),
      experiment.fuel,
      experiment.confidence,
    ]
      .map((cell) => cell.replace(/\|/g, '/'))
      .join(' | '),
  )

  return [
    '| Experiment | Facility | Gravity | Oxygen | Pressure | Fuel | Confidence |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row} |`),
  ].join('\n')
}

function gapsSection(scenario: Scenario): string {
  const gaps = getGaps(scenario)
  if (gaps.length === 0) {
    return 'No empty cells remain in this scenario gravity band.'
  }

  const lines = gaps.map(
    (cell) => `- **${cell.gravityBand} / ${cell.o2Band}**: ${cell.count} experiments`,
  )

  if (scenario.gravityG >= 0.01 && scenario.gravityG < 0.9) {
    lines.push(
      '',
      'No partial-gravity flame-spread data exists in this dataset, so every design claim for this habitat is an extrapolation.',
    )
  }

  return lines.join('\n')
}

function playbookSection(scenario: Scenario): string {
  const playbook = getPlaybook(scenario.id)
  const steps = playbook.steps.map(
    (step, index) =>
      `${index + 1}. **${step.phase.charAt(0).toUpperCase()}${step.phase.slice(1)}.** ${step.action} *Evidence: ${step.evidenceIds
        .map((id) => `\`${id}\``)
        .join(', ')}*`,
  )
  return [...steps, '', `**Caveats:** ${playbook.caveats.join(' ')}`].join('\n')
}

function sourcesSection(experiments: Experiment[]): string {
  const seen = new Set<string>()
  const lines: string[] = []

  for (const experiment of experiments) {
    for (const source of experiment.sources) {
      const key = source.url ?? source.title
      if (seen.has(key)) continue
      seen.add(key)
      const link = source.url ? ` <${source.url}>` : ''
      lines.push(`- ${source.org} - ${source.title}${source.year ? ` (${source.year})` : ''}${link}`)
    }
  }

  return lines.join('\n')
}

/**
 * Builds the markdown brief for a scenario. Unknown compare ids are ignored, and
 * weights are passed through to the same ranking used by the Rankings page, so
 * the brief cannot disagree with what the user sees.
 */
export function buildBriefMarkdown(
  scenario: Scenario,
  weights: ScoreWeights,
  compareIds: string[],
): string {
  const resolvedWeights = weights ?? defaultWeights
  const experiments = getExperiments()

  const compared: Experiment[] = []
  const seen = new Set<string>()
  for (const id of compareIds) {
    if (seen.has(id)) continue
    const experiment = getExperiment(id)
    if (!experiment) continue
    seen.add(id)
    compared.push(experiment)
    if (compared.length === 4) break
  }

  const verified = experiments.filter((experiment) => experiment.confidence === 'verified').length
  const curated = experiments.filter((experiment) => experiment.confidence === 'curated').length

  const ranked = rankExperiments(experiments, resolvedWeights, scenario)
  const sourceExperiments = [...ranked.slice(0, 5).map((entry) => entry.experiment), ...compared]
  const compareBlock = compareSection(compared)

  const status = scenario.assumption
    ? 'Notional design point. The atmosphere is an assumption to verify; only the ISS cabin and the EVA suit are operational values.'
    : 'Operational reference. The atmosphere is an operational value, not an assumption.'

  const parts = [
    '# Ignis Mission Safety Brief',
    '',
    `**Scenario:** ${scenario.label} - ${formatGravity(scenario.gravityG)}, ${scenario.o2Percent}% O2, ${Number(scenario.pressureKPa.toPrecision(3))} kPa`,
    '',
    `**Status:** ${status}`,
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Scenario',
    '',
    scenario.description,
    '',
    scenarioTable(scenario),
    '',
    '## Executive summary',
    '',
    'The three most urgent findings for this scenario, most severe first.',
    '',
    insightSection(scenario),
    '',
    '## Ranked experiments',
    '',
    `Top five by the current weight vector (hazard ${round1(resolvedWeights.hazardSeverity * 100)}%, exploration ${round1(resolvedWeights.exploration * 100)}%, evidence ${round1(resolvedWeights.evidence * 100)}%, recency ${round1(resolvedWeights.recency * 100)}%).`,
    '',
    rankingSection(scenario, resolvedWeights),
    '',
  ]

  if (compareBlock) {
    parts.push('## Compare', '', compareBlock, '')
  }

  parts.push(
    '## Evidence gaps',
    '',
    gapsSection(scenario),
    '',
    '## Crew response',
    '',
    playbookSection(scenario),
    '',
    '## Sources',
    '',
    sourcesSection(sourceExperiments),
    '',
    '## Limitations',
    '',
    `- Rankings, material risks and gaps are decision-support estimates, not physics simulations.`,
    `- The dataset holds ${experiments.length} experiments: ${verified} verified from a cited NASA page and ${curated} curated with qualitative metrics.`,
    '- Every metric with no published value is shown as "not published" rather than estimated.',
    '- Scores are additive arithmetic over published fields; changing the weights changes the order, not the evidence.',
  )

  if (scenario.gravityG >= 0.01 && scenario.gravityG < 0.9) {
    parts.push(
      '- This habitat is in partial gravity. No partial-gravity flame-spread experiment exists in the dataset, so the brief extrapolates from microgravity and theory.',
    )
  }

  return `${parts.join('\n')}\n`
}
