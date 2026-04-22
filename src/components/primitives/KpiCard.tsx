import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: ReactNode
  sublabel?: string
  icon?: ReactNode
  accentColor?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  sublabel,
  icon,
  accentColor,
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn('kpi-card', className)}
      style={accentColor ? ({ '--kpi-accent': accentColor } as CSSProperties) : undefined}
    >
      <div className="kpi-card-header">
        <span className="kpi-card-label">{label}</span>
        {icon ? <span className="kpi-card-icon">{icon}</span> : null}
      </div>
      <div className="kpi-card-value">{value}</div>
      {sublabel ? <p className="kpi-card-sublabel">{sublabel}</p> : null}
    </article>
  )
}
