import type { Deal, MonthlyTarget, Rep } from './supabase'

export function commissionForRep(rep: Rep) {
  if (rep.secured >= rep.tier5_threshold) return { tier: 5, commission: rep.tier5_comm }
  if (rep.secured >= rep.tier4_threshold) return { tier: 4, commission: rep.tier4_comm }
  if (rep.secured >= rep.tier3_threshold) return { tier: 3, commission: rep.tier3_comm }
  if (rep.secured >= rep.tier2_threshold) return { tier: 2, commission: rep.tier2_comm }
  if (rep.secured >= rep.tier1_threshold) return { tier: 1, commission: rep.tier1_comm }
  return { tier: 0, commission: 0 }
}

export function activeDeals(deals: Deal[]) {
  return deals.filter((deal) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage))
}

export function pipelineValue(deals: Deal[]) {
  return activeDeals(deals).reduce((sum, deal) => sum + deal.quotation_value, 0)
}

export function closedValue(deals: Deal[]) {
  return deals
    .filter((deal) => ['Closed – With Contract', 'Closed – No Contract'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
}

export function collectedValue(deals: Deal[]) {
  return deals.reduce((sum, deal) => sum + (deal.collected_amount ?? 0), 0)
}

export function staleDeals(deals: Deal[], threshold = 10) {
  return activeDeals(deals).filter((deal) => deal.days_in_stage > threshold)
}

export function criticalRiskDeals(deals: Deal[], staleThreshold = 14, probabilityThreshold = 50) {
  return activeDeals(deals).filter(
    (deal) => deal.days_in_stage > staleThreshold && deal.probability < probabilityThreshold,
  )
}

export function pendingClosureValue(deals: Deal[]) {
  return deals
    .filter((deal) => deal.stage === 'Pending for closure')
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
}

export function overdueCollections(deals: Deal[]) {
  return deals.filter((deal) => deal.collection_status === 'Overdue')
}

export function revenueByRep(deals: Deal[], reps: Rep[]) {
  return reps.map((rep) => ({
    name: rep.name,
    secured: rep.secured,
    closedValue: deals
      .filter((deal) => deal.sales_exec_name === rep.name && deal.stage === 'Closed – With Contract')
      .reduce((sum, deal) => sum + deal.quotation_value, 0),
    pipelineValue: deals
      .filter((deal) => deal.sales_exec_name === rep.name && !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + deal.quotation_value, 0),
    commission: commissionForRep(rep).commission,
    tier: commissionForRep(rep).tier,
  })).sort((left, right) => right.secured - left.secured)
}

export function monthlyPerformance(monthlyTargets: MonthlyTarget[]) {
  return monthlyTargets.map((month) => ({
    ...month,
    variance: month.achieved - month.target,
    attainment: month.target > 0 ? (month.achieved / month.target) * 100 : 0,
  }))
}

export function overviewMetrics(deals: Deal[], reps: Rep[], monthlyTargets: MonthlyTarget[]) {
  const active = activeDeals(deals)
  const closed = closedValue(deals)
  const collected = collectedValue(deals)
  const overdue = overdueCollections(deals)
  const stale = staleDeals(deals)
  const critical = criticalRiskDeals(deals)
  const pendingValue = pendingClosureValue(deals)
  const targetTotal = monthlyTargets.reduce((sum, month) => sum + month.target, 0)
  const achievedTotal = monthlyTargets.reduce((sum, month) => sum + month.achieved, 0)
  const totalCommission = reps.reduce((sum, rep) => sum + commissionForRep(rep).commission, 0)

  return {
    primary: {
      pipelineValue: pipelineValue(deals),
      closedValue: closed,
      collectedValue: collected,
      activeDeals: active.length,
      teamSize: reps.length,
      targetTotal,
      achievedTotal,
      commissionPool: totalCommission,
    },
    secondary: {
      overdueCollections: overdue.length,
      staleDeals: stale.length,
      criticalRisk: critical.length,
      pendingClosureValue: pendingValue,
      alertCount: overdue.length + stale.length + critical.length,
    },
  }
}
