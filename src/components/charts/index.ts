/**
 * PC2 chart kit. Charts are presentational: they take Experiment[] from
 * "@/contracts/types" and read no store or data module, so they stay stable
 * while PC1 finishes the scaffold.
 */
export { FlameSpeedChart } from './FlameSpeedChart'
export type { FlameSpeedChartProps } from './FlameSpeedChart'
export { OxygenLimitChart } from './OxygenLimitChart'
export type { OxygenLimitChartProps } from './OxygenLimitChart'
export { ConditionsRadar } from './ConditionsRadar'
export type { ConditionsRadarProps } from './ConditionsRadar'
export { ChartFrame } from './ChartFrame'
export type { ChartFrameProps, ChartTable } from './ChartFrame'
export { REGIME_STYLES, regimeStyle, CHART_TOKENS } from './chartTheme'
export type { MarkerShape, RegimeStyle } from './chartTheme'
