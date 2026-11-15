export const formatNumber = (value: number | null, unit = '', digits = 1): string => {
  if (value === null || Number.isNaN(value)) return '—'
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(digits)
  return unit ? `${rounded} ${unit}` : rounded
}

export const formatYear = (value: number | null): string =>
  value === null ? 'year unknown' : String(Math.trunc(value))

export const formatAtmosphere = (atmosphere: {
  o2_percent: number | null
  pressure_kpa: number | null
  flow_cm_s: number | null
}): string =>
  [
    `O₂ ${formatNumber(atmosphere.o2_percent, '%')}`,
    `P ${formatNumber(atmosphere.pressure_kpa, 'kPa')}`,
    `flow ${formatNumber(atmosphere.flow_cm_s, 'cm/s')}`,
  ].join(' · ')

export const scoreTone = (score: number): string => {
  if (score >= 85) return 'text-ember-400 border-ember-500/40 bg-ember-500/10'
  if (score >= 70) return 'text-amber-300 border-amber-400/30 bg-amber-400/10'
  return 'text-slate-300 border-white/10 bg-white/5'
}
