import { Building2, CircleDollarSign, LayoutGrid, Search, UserRound } from 'lucide-react'

import type { PageId } from '../App'
import type { Deal, Rep } from '../lib/supabase'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command'

interface SearchPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deals: Deal[]
  reps: Rep[]
  onNavigate: (page: PageId) => void
  onSelectDeal: (deal: Deal) => void
}

const PAGES: Array<{ id: PageId; label: string; icon: typeof LayoutGrid }> = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'pipeline', label: 'Pipeline', icon: CircleDollarSign },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'salesteam', label: 'Sales Team', icon: UserRound },
]

export default function SearchPalette({
  open,
  onOpenChange,
  deals,
  reps,
  onNavigate,
  onSelectDeal,
}: SearchPaletteProps) {
  const topDeals = [...deals]
    .sort((left, right) => right.quotation_value - left.quotation_value)
    .slice(0, 8)

  const topReps = [...reps]
    .sort((left, right) => right.secured - left.secured)
    .slice(0, 6)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="search-palette-shell">
        <div className="search-palette-header">
          <div>
            <div className="search-palette-eyebrow">Quick Jump</div>
            <div className="search-palette-title">Search deals, reps, and modules</div>
          </div>
          <div className="search-palette-hint">
            <Search size={14} />
            <span>Enter to open</span>
          </div>
        </div>
        <CommandInput placeholder="Search pipeline, companies, owners, or workspace pages..." />
        <CommandList className="search-palette-list">
          <CommandEmpty>No matching results.</CommandEmpty>
          <CommandGroup heading="Modules">
            {PAGES.map((page) => {
              const Icon = page.icon
              return (
                <CommandItem
                  key={page.id}
                  onSelect={() => {
                    onNavigate(page.id)
                    onOpenChange(false)
                  }}
                >
                  <Icon size={16} />
                  <span>{page.label}</span>
                  <CommandShortcut>Go</CommandShortcut>
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Top Deals">
            {topDeals.map((deal) => (
              <CommandItem
                key={deal.id}
                value={`${deal.company_name} ${deal.sales_exec_name} ${deal.stage}`}
                onSelect={() => {
                  onNavigate('pipeline')
                  onSelectDeal(deal)
                  onOpenChange(false)
                }}
              >
                <Building2 size={16} />
                <div className="search-palette-result">
                  <span>{deal.company_name}</span>
                  <small>{deal.stage} · {deal.sales_exec_name}</small>
                </div>
                <CommandShortcut>{Math.round(deal.quotation_value / 1000)}k</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Sales Team">
            {topReps.map((rep) => (
              <CommandItem
                key={rep.id}
                value={`${rep.name} ${rep.role} ${rep.region}`}
                onSelect={() => {
                  onNavigate('salesteam')
                  onOpenChange(false)
                }}
              >
                <UserRound size={16} />
                <div className="search-palette-result">
                  <span>{rep.name}</span>
                  <small>{rep.role} · {rep.region}</small>
                </div>
                <CommandShortcut>{Math.round(rep.secured / 1000)}k</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  )
}
