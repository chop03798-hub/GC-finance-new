import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('section-heading', className)}>
      <div className="section-heading-copy">
        <h2 className="section-heading-title">{title}</h2>
        {subtitle ? <p className="section-heading-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="section-heading-action">{action}</div> : null}
    </div>
  )
}
