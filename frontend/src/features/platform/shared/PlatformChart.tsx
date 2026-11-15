interface PlatformChartProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function PlatformChart({ title, subtitle, children }: PlatformChartProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}
