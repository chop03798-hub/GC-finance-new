import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

export type ViewToggleOption = {
  value: string
  label: string
}

type ViewToggleProps = {
  value: string
  onValueChange: (value: string) => void
  options: ViewToggleOption[]
  className?: string
}

export function ViewToggle({
  value,
  onValueChange,
  options,
  className,
}: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      className={cn('view-toggle', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className="view-toggle-item"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
