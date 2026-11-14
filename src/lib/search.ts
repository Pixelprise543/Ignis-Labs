import type { Experiment } from '@/contracts/types'

/**
 * Keyword search with a small, explicit synonym layer.
 *
 * The dataset uses specialist words ("extinction", "microgravity") but a visitor
 * types "how do you put a fire out in space". Rather than embedding a fuzzy
 * index for 20 records, this module rewrites the query into domain terms and
 * scores literal field matches. All terms must match, so adding a word narrows
 * the result instead of widening it.
 *
 * Field weights make an acronym hit outrank a mention buried in a finding. Ties
 * keep the dataset's narrative order.
 */

const PHRASE_REWRITES: Array<[RegExp, string]> = [
  [/\bzero[\s-]*g(?:ravity)?\b/g, ' microgravity '],
  [/\bfree[\s-]*fall\b/g, ' microgravity '],
  [/\bmoon\b/g, ' lunar '],
  [/\bmartian\b/g, ' mars '],
  [/\bo2\b/g, ' oxygen '],
  [/\bput(?:ting)? out\b/g, ' suppression '],
]

const TOKEN_SYNONYMS: Record<string, string[]> = {
  fire: ['flame', 'combustion', 'burn', 'ignition', 'fire-safety'],
  flame: ['fire', 'combustion'],
  extinguish: ['extinction', 'suppress', 'quench'],
  extinguishing: ['extinction', 'suppress', 'quench'],
  extinction: ['extinguish', 'suppress'],
  suppress: ['suppression', 'extinguish'],
  suppression: ['suppress', 'extinguish'],
  oxygen: ['enriched'],
  enriched: ['oxygen'],
  microgravity: ['weightless', 'free-fall'],
  weightless: ['microgravity'],
  lunar: ['partial', 'moon'],
  mars: ['partial', 'martian'],
  partial: ['lunar', 'mars', 'partial-g'],
  smoke: ['soot', 'smouldering'],
  smouldering: ['smolder', 'smoke'],
  soot: ['smoke'],
  fabric: ['textile', 'cloth', 'cotton'],
  cloth: ['textile', 'fabric'],
  textile: ['fabric', 'cloth'],
  plastic: ['polymer', 'plexiglass', 'acrylic'],
  polymer: ['plastic', 'plexiglass'],
  liquid: ['droplet', 'heptane', 'methanol'],
  droplet: ['liquid', 'drop'],
  gas: ['gaseous', 'methane'],
  gaseous: ['gas'],
  ventilation: ['airflow', 'convection', 'flow'],
  airflow: ['ventilation', 'flow'],
  pressure: ['kpa', 'vacuum'],
  station: ['iss', 'cabin'],
  cabin: ['iss', 'habitat'],
  habitat: ['cabin', 'station'],
  materials: ['material'],
  material: ['materials'],
  astronaut: ['crew'],
  crew: ['astronaut'],
  drop: ['droplet', 'tower'],
  tower: ['drop-tower'],
  cool: ['cool-flame'],
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

interface WeightedField {
  text: string
  weight: number
}

function fieldsOf(experiment: Experiment): WeightedField[] {
  return [
    { text: normalise(experiment.acronym), weight: 10 },
    { text: normalise(experiment.name), weight: 8 },
    { text: normalise(experiment.id), weight: 6 },
    { text: normalise(experiment.fuel), weight: 5 },
    { text: normalise(experiment.tags.join(' ')), weight: 5 },
    { text: normalise(experiment.regime), weight: 4 },
    { text: normalise(experiment.summary), weight: 3 },
    { text: normalise(experiment.findings.map((finding) => finding.text).join(' ')), weight: 3 },
    { text: normalise(experiment.safetyTakeaway), weight: 2 },
    { text: normalise(experiment.facility), weight: 2 },
  ]
}

function termsFor(query: string): string[] {
  let rewritten = normalise(query)
  for (const [pattern, replacement] of PHRASE_REWRITES) {
    rewritten = rewritten.replace(pattern, replacement)
  }
  return [...new Set(rewritten.split(' ').filter((term) => term.length > 1))]
}

/**
 * Returns matching experiments, best first. An empty query returns a copy of the
 * input in its original order so callers can use one code path for "browse" and
 * "search".
 */
export function searchExperiments(query: string, experiments: Experiment[]): Experiment[] {
  const terms = termsFor(query)
  if (terms.length === 0) return [...experiments]

  const scored: Array<{ experiment: Experiment; score: number; order: number }> = []

  experiments.forEach((experiment, order) => {
    const fields = fieldsOf(experiment)
    let score = 0

    for (const term of terms) {
      const variants = [term, ...(TOKEN_SYNONYMS[term] ?? [])]
      let best = 0
      for (const variant of variants) {
        for (const field of fields) {
          if (field.text.includes(variant) && field.weight > best) best = field.weight
        }
      }
      if (best === 0) return
      score += best
    }

    scored.push({ experiment, score, order })
  })

  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.experiment)
}
