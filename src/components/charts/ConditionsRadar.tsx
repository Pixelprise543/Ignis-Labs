import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Experiment } from '@/contracts/types'
import { ChartFrame } from './ChartFrame'
import { FlatTooltip } from './FlatTooltip'
import { CHART_TOKENS, SERIES_STYLES } from './chartTheme'
import { CONDITION_AXES, completeConditionRows, type ConditionRow } from './chartData'

const MAX_SERIES = 3

interface RadarTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ name?: string; value?: number; payload?: Record<string, number | string> }>
}

function RadarTooltip({ active, payload }: RadarTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <FlatTooltip
      title="Normalized condition profile"
      rows={payload.map((item) => ({
        label: item.name ?? 'Series',
        value: `${Math.round(Number(item.value) || 0)} / 100`,
      }))}
      note="Scaled to the axis maxima. Open the data table for raw values."
    />
  )
}

export interface ConditionsRadarProps {
  experiments: Experiment[]
  height?: number
}

/**
 * Compares reported conditions on four axes. Experiments with a null
 * condition are omitted rather than plotted as zero, because a missing
 * measurement is not the same as a measured zero.
 */
export function ConditionsRadar({ experiments, height = 320 }: ConditionsRadarProps) {
  const { rows, omitted } = completeConditionRows(experiments)
  const shown = rows.slice(0, MAX_SERIES)
  const truncated = rows.length - shown.length

  const radarData = CONDITION_AXES.map((axis) => {
    const datum: Record<string, string | number> = {
      axis: `${axis.label} (max ${axis.max} ${axis.unit})`,
    }
    shown.forEach((experiment, index) => {
      const raw = experiment[axis.key]
      const normalized = Math.min(100, Math.max(0, (raw / axis.max) * 100))
      datum[`s${index}`] = Math.round(normalized)
    })
    return datum
  })

  const parts: string[] = []
  if (shown.length === 0) {
    parts.push('No experiment in this set reports gravity, oxygen, pressure and flow together.')
  } else {
    parts.push(
      `${shown.length} experiment${shown.length === 1 ? '' : 's'} compared across four condition axes.`,
    )
    parts.push(
      'Axes are scaled to fixed references (1g, 100% O2, 101.3 kPa, 50 cm/s); the data table holds the raw values.',
    )
    if (omitted > 0) parts.push(`${omitted} experiment${omitted === 1 ? '' : 's'} omitted because a condition is not reported.`)
    if (truncated > 0) parts.push(`${truncated} more experiment${truncated === 1 ? '' : 's'} not shown.`)
  }

  return (
    <ChartFrame
      title="Condition profile"
      summary={parts.join(' ')}
      minHeight={height}
      empty={shown.length === 0}
      emptyMessage="This set has no experiment with all four conditions recorded. Pick experiments that report gravity, oxygen, pressure and flow."
      table={{
        columns: ['Experiment', 'Regime', 'Gravity (g)', 'Oxygen (%)', 'Pressure (kPa)', 'Flow (cm/s)'],
        rows: shown.map((experiment: ConditionRow) => [
          experiment.acronym,
          experiment.regime,
          experiment.gravityG,
          experiment.o2Percent,
          experiment.pressureKPa,
          experiment.flowCmPerS,
        ]),
      }}
    >
      <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ig-muted)]" aria-label="Series legend">
        {shown.map((experiment, index) => {
          const style = SERIES_STYLES[index % SERIES_STYLES.length]
          return (
            <li key={experiment.id} className="flex items-center gap-1.5">
              <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden="true" focusable="false">
                <line
                  x1="0"
                  y1="4"
                  x2="18"
                  y2="4"
                  stroke={style.color}
                  strokeWidth="2"
                  strokeDasharray={style.dash === '0' ? undefined : style.dash}
                />
              </svg>
              <span>{experiment.acronym}</span>
            </li>
          )
        })}
      </ul>
      <ResponsiveContainer width="100%" height={height - 24}>
        <RadarChart data={radarData} outerRadius="72%">
          <PolarGrid stroke={CHART_TOKENS.line} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: CHART_TOKENS.axis, fontSize: 10, fontFamily: CHART_TOKENS.sans }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<RadarTooltip />} wrapperStyle={{ outline: 'none', boxShadow: 'none' }} />
          {shown.map((experiment, index) => {
            const style = SERIES_STYLES[index % SERIES_STYLES.length]
            return (
              <Radar
                key={experiment.id}
                name={experiment.acronym}
                dataKey={`s${index}`}
                stroke={style.color}
                fill={style.color}
                fillOpacity={0.12}
                strokeWidth={2}
                strokeDasharray={style.dash === '0' ? undefined : style.dash}
                isAnimationActive={false}
              />
            )
          })}
        </RadarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
