import { z } from 'zod'
import type { Experiment } from '@/contracts/types'
import { getCoverage } from '@/lib/coverage'
import { getExperiments, getFinding, getFindings, getGlossary, getMaterials } from '@/lib/data'
import { getInsights } from '@/lib/insights'
import { getPlaybook } from '@/lib/playbook'
import { getScenario, SCENARIOS } from '@/lib/scenarios'

/**
 * Runtime validation for the dataset.
 *
 * TypeScript only proves the shape at compile time; this module proves it again
 * over the actual arrays, then adds the rules a type cannot express: global id
 * uniqueness, ordered years, resolvable evidence ids and the coverage grid
 * partitioning every record exactly once.
 *
 * A citation that does not resolve is the failure mode this project cares about
 * most, so dangling evidence is an error in every consumer (materials, insights,
 * playbook), not a warning. `npm run validate:data` exits non-zero on any issue.
 */

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FINDING_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*-f\d+$/

const sourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().url().optional(),
    org: z.string().min(1),
    year: z.number().int().min(1900).max(2100).optional(),
  })
  .strict()

const findingSchema = z
  .object({
    id: z.string().regex(FINDING_ID, 'finding id must end in -f<number>'),
    text: z.string().min(20),
    tags: z.array(z.string().min(1)).min(1),
  })
  .strict()

const metricSchema = z
  .object({
    key: z.string().regex(KEBAB, 'metric key must be kebab-case'),
    label: z.string().min(1),
    unit: z.string().min(1),
    value: z.number().finite().nullable(),
    note: z.string().optional(),
  })
  .strict()

const conditionsSchema = z
  .object({
    gravityG: z.number().finite().min(0).max(2),
    o2Percent: z.number().finite().min(0).max(100).nullable(),
    diluent: z.string().min(1),
    pressureKPa: z.number().finite().min(0).max(200).nullable(),
    flowCmPerS: z.number().finite().min(0).nullable(),
  })
  .strict()

export const experimentSchema = z
  .object({
    id: z.string().regex(KEBAB, 'experiment id must be kebab-case'),
    name: z.string().min(3),
    acronym: z.string().min(1),
    summary: z.string().min(40),
    facility: z.enum([
      'ISS-CIR',
      'ISS-MSG',
      'ISS-other',
      'Free-flyer',
      'Drop-tower',
      'Parabolic-flight',
      'Sounding-rocket',
      'Ground',
    ]),
    regime: z.enum(['microgravity', 'partial-g', 'normal-g']),
    years: z.tuple([z.number().int().min(1900), z.number().int().min(1900).nullable()]),
    fuelType: z.enum(['solid', 'gas', 'liquid', 'droplet', 'dust', 'cool-flame']),
    fuel: z.string().min(1),
    conditions: conditionsSchema,
    metrics: z.array(metricSchema).min(1),
    findings: z.array(findingSchema).min(1),
    safetyTakeaway: z.string().min(30),
    sources: z.array(sourceSchema).min(1),
    confidence: z.enum(['verified', 'curated', 'illustrative']),
    tags: z.array(z.string().min(1)).min(1),
  })
  .strict()

const materialSchema = z
  .object({
    id: z.string().regex(KEBAB),
    name: z.string().min(2),
    category: z.enum([
      'textile',
      'polymer',
      'foam',
      'paper',
      'composite',
      'liquid-fuel',
      'gas',
    ]),
    usedFor: z.string().min(3),
    evidenceIds: z.array(z.string()).min(1),
    baseFlammability: z.number().min(0).max(100),
    notes: z.string().min(10),
  })
  .strict()

const glossarySchema = z
  .object({
    id: z.string().regex(KEBAB),
    term: z.string().min(2),
    plain: z.string().min(30),
    technical: z.string().min(30),
    related: z.array(z.string()),
  })
  .strict()

export interface ValidationIssue {
  code: string
  message: string
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    else seen.add(value)
  }
  return [...repeated].sort()
}

/**
 * Rules that need more than one record. Exported so a test can feed it a
 * deliberately broken pair without editing the real dataset.
 */
export function checkExperiments(experiments: Experiment[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const duplicateExperiments = duplicates(experiments.map((experiment) => experiment.id))
  for (const id of duplicateExperiments) {
    issues.push({ code: 'duplicate-id', message: `experiment id "${id}" is used more than once` })
  }

  const duplicateFindings = duplicates(
    experiments.flatMap((experiment) => experiment.findings.map((finding) => finding.id)),
  )
  for (const id of duplicateFindings) {
    issues.push({ code: 'duplicate-finding', message: `finding id "${id}" is used more than once` })
  }

  for (const experiment of experiments) {
    const repeatedMetrics = duplicates(experiment.metrics.map((metric) => metric.key))
    for (const key of repeatedMetrics) {
      issues.push({
        code: 'duplicate-metric-key',
        message: `${experiment.id} repeats metric key "${key}"`,
      })
    }

    const [start, end] = experiment.years
    if (end !== null && end < start) {
      issues.push({
        code: 'year-order',
        message: `${experiment.id} ends (${end}) before it starts (${start})`,
      })
    }

    for (const source of experiment.sources) {
      if (!source.url) {
        issues.push({
          code: 'source-url',
          message: `${experiment.id} cites "${source.title}" without a URL`,
        })
      }
    }

    if (experiment.confidence === 'illustrative') {
      issues.push({
        code: 'illustrative-record',
        message: `${experiment.id} is illustrative; the UI must badge it as placeholder content`,
      })
    }
  }

  return issues
}

export function checkCatalog(): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const experiments = getExperiments()
  const findingIds = new Set(getFindings().map((finding) => finding.id))

  for (const material of getMaterials()) {
    const parsed = materialSchema.safeParse(material)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          code: 'material-schema',
          message: `${material.id ?? 'material'}.${issue.path.join('.')}: ${issue.message}`,
        })
      }
    }
    for (const findingId of material.evidenceIds) {
      if (!getFinding(findingId)) {
        issues.push({
          code: 'dangling-finding',
          message: `material "${material.id}" cites missing finding "${findingId}"`,
        })
      }
    }
  }

  for (const code of duplicates(getMaterials().map((material) => material.id))) {
    issues.push({ code: 'duplicate-id', message: `material id "${code}" is used more than once` })
  }

  const glossaryIds = new Set(getGlossary().map((term) => term.id))
  for (const term of getGlossary()) {
    const parsed = glossarySchema.safeParse(term)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          code: 'glossary-schema',
          message: `${term.id ?? 'term'}.${issue.path.join('.')}: ${issue.message}`,
        })
      }
    }
    for (const related of term.related) {
      if (!glossaryIds.has(related)) {
        issues.push({
          code: 'glossary-related',
          message: `glossary "${term.id}" relates to missing term "${related}"`,
        })
      }
    }
  }

  for (const id of duplicates(getGlossary().map((term) => term.id))) {
    issues.push({ code: 'duplicate-id', message: `glossary id "${id}" is used more than once` })
  }

  for (const scenario of SCENARIOS) {
    for (const insight of getInsights(getScenario(scenario.id))) {
      for (const findingId of insight.evidenceIds) {
        if (!findingIds.has(findingId)) {
          issues.push({
            code: 'dangling-finding',
            message: `insight "${insight.id}" cites missing finding "${findingId}"`,
          })
        }
      }
      if (insight.confidence < 0 || insight.confidence > 100) {
        issues.push({
          code: 'insight-confidence',
          message: `insight "${insight.id}" has confidence ${insight.confidence}`,
        })
      }
      if (insight.scenarios.length === 0) {
        issues.push({
          code: 'insight-scenarios',
          message: `insight "${insight.id}" applies to no scenario`,
        })
      }
    }

    const playbook = getPlaybook(scenario.id)
    const phases = playbook.steps.map((step) => step.phase)
    const expected = ['detect', 'isolate', 'suppress', 'ventilate', 'recover']
    if (phases.join(',') !== expected.join(',')) {
      issues.push({
        code: 'playbook-phases',
        message: `${scenario.id} playbook phases are ${phases.join(', ') || 'empty'}`,
      })
    }
    for (const step of playbook.steps) {
      for (const findingId of step.evidenceIds) {
        if (!findingIds.has(findingId)) {
          issues.push({
            code: 'dangling-finding',
            message: `${scenario.id} playbook ${step.phase} cites missing finding "${findingId}"`,
          })
        }
      }
    }
    if (playbook.caveats.length === 0) {
      issues.push({
        code: 'playbook-caveats',
        message: `${scenario.id} playbook has no caveats`,
      })
    }
  }

  const cells = getCoverage()
  if (cells.length !== 12) {
    issues.push({ code: 'coverage-size', message: `coverage has ${cells.length} cells, expected 12` })
  }
  const covered = cells.flatMap((cell) => cell.experimentIds)
  if (covered.length !== experiments.length) {
    issues.push({
      code: 'coverage-partition',
      message: `coverage holds ${covered.length} records, dataset holds ${experiments.length}`,
    })
  }
  for (const id of duplicates(covered)) {
    issues.push({ code: 'coverage-partition', message: `coverage lists "${id}" twice` })
  }

  return issues
}

export function validateDataset(): ValidationIssue[] {
  const experiments = getExperiments()
  const issues: ValidationIssue[] = []

  experiments.forEach((experiment, index) => {
    const parsed = experimentSchema.safeParse(experiment)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          code: 'experiment-schema',
          message: `${experiment.id || `#${index}`}.${issue.path.join('.')}: ${issue.message}`,
        })
      }
    }
  })

  return [...issues, ...checkExperiments(experiments), ...checkCatalog()]
}
