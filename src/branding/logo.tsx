import type { SVGProps } from 'react'

import { TRY_GC_THEME } from './tokens'

export function TryGcLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 42" fill="none" aria-hidden="true" {...props}>
      <circle cx="17" cy="14" r="12" fill={TRY_GC_THEME.brand.orange} />
      <circle cx="17" cy="14" r="6.5" fill={TRY_GC_THEME.dark.bg} />
      <circle cx="29" cy="5" r="4" fill={TRY_GC_THEME.brand.purple} />
      <polygon points="28,8.5 25,12 31,12" fill={TRY_GC_THEME.brand.purple} />
      <path
        d="M5 27 A 14.5 14.5 0 1 0 33 27"
        stroke={TRY_GC_THEME.brand.purple}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
