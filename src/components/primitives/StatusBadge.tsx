import type { CSSProperties } from 'react'

import { Badge } from '@/components/ui/badge'
import { STAGE_COLOR_MAP, type StageName } from '@/branding/tokens'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: StageName | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const accent = STAGE_COLOR_MAP[status as StageName] ?? 'var(--o)'

  return (
    <Badge
      className={cn('status-badge', className)}
      style={
        {
          '--status-accent': accent,
          '--status-accent-soft': `${accent}22`,
        } as CSSProperties
      }
    >
      {status}
    </Badge>
  )
}
