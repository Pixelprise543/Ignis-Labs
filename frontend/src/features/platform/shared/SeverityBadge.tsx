interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'caution' | 'info'
}

const SEVERITY_CONFIG: Record<
  SeverityBadgeProps['severity'],
  { label: string; color: string; bg: string; border: string }
> = {
  critical: {
    label: 'Critical',
    color: 'text-ember-400',
    bg: 'bg-ember-500/10',
    border: 'border-ember-500/20',
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  caution: {
    label: 'Caution',
    color: 'text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  info: {
    label: 'Info',
    color: 'text-slate-300',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${config.color} ${config.bg} ${config.border}`}
    >
      {config.label}
    </span>
  )
}
