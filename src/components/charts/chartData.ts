import type { Confidence, Experiment, GravityRegime, Metric } from '@/contracts/types'

export interface FlameSpreadPoint {
  id: string
  acronym: string
  name: string
  regime: GravityRegime
  g: number
  value: number
  unit: string
  confidence: Confidence
}

export interface OxygenLimitRow {
  id: string
  acronym: string
  name: string
  regime: GravityRegime
  o2: number
  unit: string
  confidence: Confidence
}

const FLAME_SPREAD_RE = /(flame\s*speed|flame\s*spread|spread\s*rate|burn\s*rate|regression\s*rate)/i
const OXYGEN_LIMIT_RE = /(limiting\s*oxygen|oxygen\s*limit|minimum\s*oxygen|\bloi\b|o2\s*limit)/i

function firstNumericMetric(experiment: Experiment, pattern: RegExp): Metric | undefined {
  return experiment.metrics.find(
    (metric) =>
      (pattern.test(metric.key) || pattern.test(metric.label)) &&
      typeof metric.value === 'number' &&
      Number.isFinite(metric.value),
  )
}

/**
 * Only experiments that actually report a numeric flame-spread metric are
 * plotted. Inventing a value for a missing metric would break the honesty rule.
 */
export function flameSpreadPoints(experiments: Experiment[]): FlameSpreadPoint[] {
  const points: FlameSpreadPoint[] = []
  for (const experiment of experiments) {
    const metric = firstNumericMetric(experiment, FLAME_SPREAD_RE)
    if (!metric || typeof metric.value !== 'number') continue
    points.push({
      id: experiment.id,
      acronym: experiment.acronym,
      name: experiment.name,
      regime: experiment.regime,
      g: experiment.conditions.gravityG,
      value: metric.value,
      unit: metric.unit,
      confidence: experiment.confidence,
    })
  }
  return points.sort((a, b) => a.g - b.g || a.acronym.localeCompare(b.acronym))
}

export function oxygenLimitRows(experiments: Experiment[]): OxygenLimitRow[] {
  const rows: OxygenLimitRow[] = []
  for (const experiment of experiments) {
    const metric = firstNumericMetric(experiment, OXYGEN_LIMIT_RE)
    if (!metric || typeof metric.value !== 'number') continue
    rows.push({
      id: experiment.id,
      acronym: experiment.acronym,
      name: experiment.name,
      regime: experiment.regime,
      o2: metric.value,
      unit: metric.unit,
      confidence: experiment.confidence,
    })
  }
  return rows.sort((a, b) => a.o2 - b.o2)
}

export interface ConditionRow {
  id: string
  acronym: string
  regime: GravityRegime
  gravityG: number
  o2Percent: number
  pressureKPa: number
  flowCmPerS: number
  confidence: Confidence
}

/**
 * Radar needs all four numbers to be honest. Experiments with a null
 * condition are left out and counted, not silently defaulted to zero.
 */
export function completeConditionRows(experiments: Experiment[]): {
  rows: ConditionRow[]
  omitted: number
} {
  const rows: ConditionRow[] = []
  for (const experiment of experiments) {
    const { gravityG, o2Percent, pressureKPa, flowCmPerS } = experiment.conditions
    if (
      typeof gravityG !== 'number' ||
      typeof o2Percent !== 'number' ||
      typeof pressureKPa !== 'number' ||
      typeof flowCmPerS !== 'number'
    ) {
      continue
    }
    rows.push({
      id: experiment.id,
      acronym: experiment.acronym,
      regime: experiment.regime,
      gravityG,
      o2Percent,
      pressureKPa,
      flowCmPerS,
      confidence: experiment.confidence,
    })
  }
  return { rows, omitted: experiments.length - rows.length }
}

/** Fixed radar references. Values above a reference are clamped and the table shows the raw number. */
export const CONDITION_AXES = [
  { key: 'gravityG', label: 'Gravity', unit: 'g', max: 1 },
  { key: 'o2Percent', label: 'Oxygen', unit: '%', max: 100 },
  { key: 'pressureKPa', label: 'Pressure', unit: 'kPa', max: 101.3 },
  { key: 'flowCmPerS', label: 'Flow', unit: 'cm/s', max: 50 },
] as const

export function formatNumber(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(Math.abs(value) < 1 ? 2 : 1)
}
