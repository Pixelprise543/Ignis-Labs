import { z } from 'zod'
import type { Experiment } from '@/contracts/types'
import { COVERAGE_GRAVITY_BANDS, getCoverage } from './coverage'
import { getExperiments, getFinding, getFindings, getGlossary, getMaterials } from './data'
import { getInsights } from './insights'
import { getPlaybook } from './playbook'
import { getScenario, SCENARIOS } from './scenarios'

/**
 * Runtime validation for the dataset.
 *
 * TypeScript only proves the shape at compile time; this module proves it again
 * over the actual arrays, then adds the rules a type cannot express: global id
 * uniqueness, ordered years, resolvable evidence ids and the coverage grid
 * partitioning every record exactly once.
 *
 * Added for the 30-record dataset: a null metric must explain itself, a
 * verified/curated record must cite nasa.gov, a finding id must carry its
 * experiment id, two records may not share one finding sentence, and the
 * gravity regime must agree with the numeric gravity. Each rule exists because
 * it is a shape the dataset drifted toward while records were being written by
 * hand across sessions.
 *
 * A citation that does not resolve is the failure mode this project cares about
 * most, so dangling evidence is an error in every consumer (materials, insights,
 * playbook), not a warning. `npm run validate:data` exits non-zero on any issue.
 */

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FINDING_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*-f\d+$/

/**
 * Why `nasa.gov` specifically: the project's honesty rule says a `verified` or
 * `curated` record must come from a NASA source that was actually retrieved.
 * A record may still cite a non-NASA page, but only when it is badged
 * `illustrative` - so the rule is enforced per record, not globally.
 */
const NASA_HOST = /(^|\.)nasa\.gov$/i

/** Fields that must never contain filler: they are what a reader trusts. */
const PLACEHOLDERS = /\b(lorem ipsum|tbd|todo|placeholder|xxx)\b/i

/** Gravity regime names line up with the coverage bands, which spell them out. */
const BAND_FOR_REGIME: Record<Experiment['regime'], string> = {
  microgravity: 'microgravity',
  'partial-g': 'partial-gravity',
  'normal-g': 'normal-gravity',
}


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
  // A blank metric is allowed only if it explains itself. Without this, "value:
  // null" silently becomes an empty cell and a reader cannot tell "not measured"
  // from "we forgot". data/SCHEMA.md promises a note; this enforces the promise.
  .refine((metric) => metric.value !== null || (metric.note?.trim().length ?? 0) >= 12, {
    message: 'a null metric value needs a note explaining why (at least 12 characters)',
    path: ['note'],
  })

const conditionsSchema = z
  .object({
    gravityG: z.number().finite().min(0).max(2),
    o2Percent: z.number().finite().min(0).max(100).nullable(),
    diluent: z.string().min(1),
    // Strictly positive: 0 kPa would mean vacuum, and every record here was
    // burned in a gas at some pressure. "No published value" is null, not 0.
    pressureKPa: z.number().finite().gt(0).max(200).nullable(),
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
    years: z.tuple([z.number().int().min(1900).max(2100), z.number().int().min(1900).max(2100).nullable()]),
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

  // The same sentence in two records means one of them was copied rather than
  // read from its own source. Citation ids stay honest only if the claims do.
  const textOwners = new Map<string, string[]>()
  for (const experiment of experiments) {
    for (const finding of experiment.findings) {
      const owners = textOwners.get(finding.text) ?? []
      owners.push(experiment.id)
      textOwners.set(finding.text, owners)
    }
  }
  for (const [text, owners] of textOwners) {
    if (owners.length > 1) {
      issues.push({
        code: 'duplicate-finding-text',
        message: `${owners.join(' and ')} share one finding sentence: "${text.slice(0, 60)}..."`,
      })
    }
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

    // Finding ids carry their experiment id, so a copied finding is visible in
    // the id itself and an insight citing `luci-f2` cannot silently point at a
    // number that came from somewhere else.
    for (const finding of experiment.findings) {
      if (!finding.id.startsWith(`${experiment.id}-f`)) {
        issues.push({
          code: 'finding-id-prefix',
          message: `${experiment.id} owns finding "${finding.id}", which does not start with "${experiment.id}-f"`,
        })
      }
    }

    for (const source of experiment.sources) {
      if (!source.url) {
        issues.push({
          code: 'source-url',
          message: `${experiment.id} cites "${source.title}" without a URL`,
        })
        continue
      }
      if (experiment.confidence !== 'illustrative') {
        let host = ''
        try {
          host = new URL(source.url).host
        } catch {
          host = ''
        }
        if (!NASA_HOST.test(host)) {
          issues.push({
            code: 'source-host',
            message: `${experiment.id} is ${experiment.confidence} but cites "${source.url}" (${host || 'unparseable host'}), which is not on nasa.gov`,
          })
        }
      }
    }

    // The regime is a claim about the conditions, so the two must agree. A
    // record labelled partial-g at 0 g (or microgravity at 0.5 g) would quietly
    // move a whole row of the coverage grid.
    const band = COVERAGE_GRAVITY_BANDS.find((candidate) =>
      candidate.matches(experiment.conditions.gravityG),
    )
    if (band && band.label !== BAND_FOR_REGIME[experiment.regime]) {
      issues.push({
        code: 'regime-gravity',
        message: `${experiment.id} is labelled ${experiment.regime} but ${experiment.conditions.gravityG} g falls in the ${band.label} band`,
      })
    }

    for (const [field, value] of [
      ['summary', experiment.summary],
      ['safetyTakeaway', experiment.safetyTakeaway],
    ] as const) {
      if (PLACEHOLDERS.test(value)) {
        issues.push({
          code: 'placeholder-copy',
          message: `${experiment.id}.${field} contains filler text`,
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
