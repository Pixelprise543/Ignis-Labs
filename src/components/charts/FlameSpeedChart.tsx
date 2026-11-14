import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { Experiment } from '@/contracts/types'
import { ChartFrame } from './ChartFrame'
import { FlatTooltip } from './FlatTooltip'
import { regimeStyle, CHART_TOKENS, REGIME_STYLES } from './chartTheme'
import { RegimeLegend } from './markers'
import { flameSpreadPoints, formatNumber, type FlameSpreadPoint } from './chartData'

interface SpreadTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: FlameSpreadPoint }>
}

function SpreadTooltip({ active, payload }: SpreadTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <FlatTooltip
      title={point.acronym}
      subtitle={`${point.name} · ${regimeStyle(point.regime).label}`}
      rows={[
        { label: 'Gravity', value: `${formatNumber(point.g)} g` },
        { label: 'Flame spread', value: `${formatNumber(point.value)} ${point.unit}` },
      ]}
      note={`Confidence: ${point.confidence}`}
    />
  )
}

export interface FlameSpeedChartProps {
  experiments: Experiment[]
  height?: number
}

/**
 * Flame-spread metric against gravity. One scatter series per regime so the
 * marker shape (circle / diamond / square) carries the regime too.
 */
export function FlameSpeedChart({ experiments, height = 280 }: FlameSpeedChartProps) {
  const points = flameSpreadPoints(experiments)
  const regimes = REGIME_STYLES.filter((style) => points.some((p) => p.regime === style.key)).map(
    (style) => style.key,
  )
  const counts = regimes.map((key) => {
    const style = regimeStyle(key)
    const count = points.filter((p) => p.regime === key).length
    return `${count} ${style.label.toLowerCase()}`
  })

  const sharedUnit =
    points.length > 0 && points.every((p) => p.unit === points[0].unit) ? points[0].unit : ''

  const summary =
    points.length === 0
      ? 'No experiment in the current set reports a numeric flame-spread metric.'
      : `${points.length} experiment${points.length === 1 ? '' : 's'} report a flame-spread metric (${counts.join(
          ', ',
        )}). Marker shape marks the gravity regime; hover or open the data table for values.`

  return (
    <ChartFrame
      title="Flame spread vs gravity"
      summary={summary}
      minHeight={height}
      empty={points.length === 0}
      emptyMessage="No flame-spread measurements in this set. Clear a filter or add experiments that record a flame-speed metric."
      table={{
        columns: ['Experiment', 'Regime', 'Gravity (g)', 'Flame spread', 'Unit', 'Confidence'],
        rows: points.map((point) => [
          point.acronym,
          regimeStyle(point.regime).label,
          point.g,
          point.value,
          point.unit,
          point.confidence,
        ]),
      }}
    >
      <RegimeLegend regimes={regimes} />
      <ResponsiveContainer width="100%" height={height - 16}>
        <ScatterChart margin={{ top: 12, right: 20, bottom: 28, left: 4 }}>
          <CartesianGrid stroke={CHART_TOKENS.grid} vertical={false} />
          <XAxis
            type="number"
            dataKey="g"
            name="Gravity"
            domain={[0, 1]}
            ticks={[0, 0.16, 0.38, 1]}
            tickFormatter={(value: number) => `${value}g`}
            tick={{ fill: CHART_TOKENS.axis, fontSize: 11, fontFamily: CHART_TOKENS.sans }}
            tickLine={{ stroke: CHART_TOKENS.line }}
            axisLine={{ stroke: CHART_TOKENS.line }}
            label={{
              value: 'Gravity (g)',
              position: 'insideBottom',
              offset: -18,
              fill: CHART_TOKENS.axis,
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="value"
            name="Flame spread"
            domain={['auto', 'auto']}
            tick={{ fill: CHART_TOKENS.axis, fontSize: 11, fontFamily: CHART_TOKENS.mono }}
            tickLine={{ stroke: CHART_TOKENS.line }}
            axisLine={{ stroke: CHART_TOKENS.line }}
            width={56}
            label={{
              value: sharedUnit || 'Flame spread',
              angle: -90,
              position: 'insideLeft',
              fill: CHART_TOKENS.axis,
              fontSize: 11,
            }}
          />
          <Tooltip
            content={<SpreadTooltip />}
            cursor={{ stroke: CHART_TOKENS.line, strokeWidth: 1 }}
            wrapperStyle={{ outline: 'none', boxShadow: 'none' }}
          />
          {REGIME_STYLES.filter((style) => points.some((p) => p.regime === style.key)).map(
            (style) => (
              <Scatter
                key={style.key}
                name={style.label}
                data={points.filter((p) => p.regime === style.key)}
                fill={style.color}
                shape={style.shape}
                isAnimationActive={false}
              />
            ),
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
