import type {
  Experiment,
  Finding,
  GlossaryTerm,
  Material,
  TimelineEvent,
} from '@/contracts/types'
import { EXPERIMENTS } from '../../data/experiments'
import { GLOSSARY } from '../../data/glossary'
import { MATERIALS } from '../../data/materials'

/**
 * Read-only accessors over the static dataset.
 *
 * Every view goes through this module rather than importing the data files, so
 * that lookups stay O(1), timeline rules live in one place, and callers cannot
 * mutate the shared arrays. The dataset is small enough that the indexes are
 * built eagerly at module load.
 */

const EXPERIMENTS_BY_ID = new Map<string, Experiment>(
  EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
)

const FINDINGS_BY_ID = new Map<string, { experiment: Experiment; finding: Finding }>()
for (const experiment of EXPERIMENTS) {
  for (const finding of experiment.findings) {
    FINDINGS_BY_ID.set(finding.id, { experiment, finding })
  }
}

const MATERIALS_BY_ID = new Map<string, Material>(
  MATERIALS.map((material) => [material.id, material]),
)

const GLOSSARY_BY_ID = new Map<string, GlossaryTerm>(
  GLOSSARY.map((term) => [term.id, term]),
)

/** All experiments in narrative order. A copy: callers cannot reorder the source. */
export function getExperiments(): Experiment[] {
  return [...EXPERIMENTS]
}

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS_BY_ID.get(id)
}

/** Every finding, flattened out of its experiment. */
export function getFindings(): Finding[] {
  return EXPERIMENTS.flatMap((experiment) => experiment.findings)
}

/** A finding plus the experiment that owns it, for evidence popovers. */
export function getFinding(id: string): { experiment: Experiment; finding: Finding } | undefined {
  return FINDINGS_BY_ID.get(id)
}

export function getMaterials(): Material[] {
  return [...MATERIALS]
}

export function getMaterial(id: string): Material | undefined {
  return MATERIALS_BY_ID.get(id)
}

export function getGlossary(): GlossaryTerm[] {
  return [...GLOSSARY]
}

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_BY_ID.get(id)
}

/**
 * Investigation families collapse the numbered flights: Saffire-I and
 * Saffire-VI are one family, FLEX, FLEX-2 and FLEX-2J are one family, and the
 * five ACME studies are one family. A family's first year is a timeline
 * milestone, which is why the data file does not need a hand-maintained
 * milestone flag that can drift out of sync with the experiments.
 */
function familyOf(experiment: Experiment): string {
  const token = experiment.acronym.split(/[\s-]/)[0] ?? experiment.acronym
  return token.replace(/[^A-Za-z0-9.]/g, '') || experiment.acronym
}

const FAMILY_FIRST_YEAR = new Map<string, number>()
for (const experiment of EXPERIMENTS) {
  const family = familyOf(experiment)
  const start = experiment.years[0]
  const known = FAMILY_FIRST_YEAR.get(family)
  if (known === undefined || start < known) FAMILY_FIRST_YEAR.set(family, start)
}

let timelineCache: TimelineEvent[] | null = null

/** One event per start year, ascending. Derived, so it cannot disagree with the records. */
export function getTimeline(): TimelineEvent[] {
  if (timelineCache) return [...timelineCache]

  const byYear = new Map<number, Experiment[]>()
  for (const experiment of EXPERIMENTS) {
    const year = experiment.years[0]
    const bucket = byYear.get(year)
    if (bucket) bucket.push(experiment)
    else byYear.set(year, [experiment])
  }

  const events: TimelineEvent[] = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, experiments]) => {
      const ordered = [...experiments].sort((a, b) => a.acronym.localeCompare(b.acronym))
      const names = ordered.map((experiment) => experiment.acronym)
      const firstFamilies = [
        ...new Set(
          ordered
            .map(familyOf)
            .filter((family) => FAMILY_FIRST_YEAR.get(family) === year),
        ),
      ]
      const milestone = firstFamilies.length > 0
      const list = names.join(', ')
      const summary = milestone
        ? `${list} ${names.length === 1 ? 'begins' : 'begin'} this year, opening ${firstFamilies.join(' and ')} in the evidence base.`
        : `${list} ${names.length === 1 ? 'enters' : 'enter'} the evidence base.`

      return {
        year,
        title: names.length === 1 ? names[0] : `${names[0]} +${names.length - 1} more`,
        summary,
        experimentIds: ordered.map((experiment) => experiment.id),
        milestone,
      }
    })

  timelineCache = events
  return [...events]
}
