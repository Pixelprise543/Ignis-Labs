import type { Severity } from '@/contracts/types'

/**
 * One place for the risk-to-severity thresholds.
 *
 * Materials and the simulator both turn a 0-100 estimate into a severity, and if
 * the two modules ever disagreed a cell could read "high" on one page and
 * "caution" on another for the same number.
 */

export function levelForRisk(risk: number): Severity {
  if (risk >= 70) return 'critical'
  if (risk >= 45) return 'high'
  if (risk >= 25) return 'caution'
  return 'info'
}

const RANK: Record<Severity, number> = {
  critical: 3,
  high: 2,
  caution: 1,
  info: 0,
}

export const severityRank = (severity: Severity): number => RANK[severity]
