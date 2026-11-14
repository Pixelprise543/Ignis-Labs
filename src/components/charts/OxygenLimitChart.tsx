import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Experiment } from '@/contracts/types'
import { ChartFrame } from './ChartFrame'
import { FlatTooltip } from './FlatTooltip'
import { CHART_TOKENS, REGIME_STYLES, regimeStyle } from './chartTheme'
import { RegimeLegend } from './markers'
import { formatNumber, oxygenLimitRows, type OxygenLimitRow } from './chartData'

interface OxygenTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: OxygenLimitRow }>
}

function OxygenTooltip({ active, payload }: OxygenTooltipProps) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <FlatTooltip
      title={row.acronym}
      subtitle={`${row.name} · ${regimeStyle(row.regime).label}`}
      rows={[{ label: 'Limiting oxygen', value: `${formatNumber(row.o2)} ${row.unit}` }]}
      note={`Confidence: ${row.confidence}`}
    />
  )
}

export interface OxygenLimitChartProps {
  experiments: Experiment[]
  height?: number
}

/**
 * Horizontal bars keep many acronyms readable. Color encodes the gravity
 * regime, while the shape legend, acronym labels and value labels keep color
 * from being the only signal.
 */
export function OxygenLimitChart({ experiments, height }: OxygenLimitChartProps) {
  const rows = oxygenLimitRows(experiments)
  const chartHeight = height ?? Math.min(480, Math.max(220, rows.length * 30 + 56))
  const regimes = REGIME_STYLES.filter((style) => rows.some((row) => row.regime === style.key)).map(
    (style) => style.key,
  )

  const summary =
    rows.length === 0
      ? 'No experiment in the current set reports a numeric limiting-oxygen metric.'
      : `${rows.length} of ${experiments.length} experiments report a limiting-oxygen value. Lower values mean burning is supported in a thinner-oxygen atmosphere.`

  return (
    <ChartFrame
      title="Limiting oxygen by experiment"
      summary={summary}
      minHeight={chartHeight}
      empty={rows.length === 0}
      emptyMessage="No limiting-oxygen measurements in this set. Clear a filter or add experiments that record an oxygen limit."
      table={{
        columns: ['Experiment', 'Regime', 'Limiting oxygen', 'Unit', 'Confidence'],
        rows: rows.map((row) => [
          row.acronym,
          regimeStyle(row.regime).label,
          row.o2,
          row.unit,
          row.confidence,
        ]),
      }}
    >
      <RegimeLegend regimes={regimes} />
      <ResponsiveContainer width="100%" height={chartHeight - 24}>
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={CHART_TOKENS.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tick={{ fill: CHART_TOKENS.axis, fontSize: 11, fontFamily: CHART_TOKENS.mono }}
            tickLine={{ stroke: CHART_TOKENS.line }}
            axisLine={{ stroke: CHART_TOKENS.line }}
            label={{
              value: 'Oxygen (%)',
              position: 'insideBottom',
              offset: -2,
              fill: CHART_TOKENS.axis,
              fontSize: 11,
            }}
          />
          <YAxis
            type="category"
            dataKey="acronym"
            width={92}
            tick={{ fill: CHART_TOKENS.axis, fontSize: 11, fontFamily: CHART_TOKENS.sans }}
            tickLine={{ stroke: CHART_TOKENS.line }}
            axisLine={{ stroke: CHART_TOKENS.line }}
          />
          <Tooltip
            content={<OxygenTooltip />}
            cursor={{ fill: 'var(--ig-raised, #2E2620)' }}
            wrapperStyle={{ outline: 'none', boxShadow: 'none' }}
          />
          <Bar dataKey="o2" name="Limiting oxygen" barSize={14} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell key={row.id} fill={regimeStyle(row.regime).color} />
            ))}
            <LabelList
              dataKey="o2"
              position="right"
              formatter={(value: unknown) => `${formatNumber(value)}%`}
              style={{
                fill: CHART_TOKENS.text,
                fontSize: 11,
                fontFamily: CHART_TOKENS.mono,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
