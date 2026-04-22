import type { Deal } from './supabase'

export interface ClientAggregate {
  companyName: string
  owner: string
  businessType: string
  totalPortfolioValue: number
  collectedAmount: number
  activeDeals: number
  wonDeals: number
  latestStage: Deal['stage']
}

export function buildClientAggregates(deals: Deal[]): ClientAggregate[] {
  const grouped = new Map<string, Deal[]>()

  for (const deal of deals) {
    const bucket = grouped.get(deal.company_name) ?? []
    bucket.push(deal)
    grouped.set(deal.company_name, bucket)
  }

  return [...grouped.entries()]
    .map(([companyName, companyDeals]) => {
      const sorted = [...companyDeals].sort((left, right) => right.date.localeCompare(left.date))
      const latest = sorted[0]

      return {
        companyName,
        owner: latest.sales_exec_name,
        businessType: latest.business_type,
        totalPortfolioValue: companyDeals.reduce((sum, deal) => sum + deal.quotation_value, 0),
        collectedAmount: companyDeals.reduce((sum, deal) => sum + (deal.collected_amount ?? 0), 0),
        activeDeals: companyDeals.filter((deal) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage)).length,
        wonDeals: companyDeals.filter((deal) => deal.stage === 'Closed – With Contract').length,
        latestStage: latest.stage,
      }
    })
    .sort((left, right) => right.totalPortfolioValue - left.totalPortfolioValue)
}
