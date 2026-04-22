import type { Deal, MonthlyTarget, Rep } from './supabase'
import {
  closedValue,
  collectedValue,
  commissionForRep,
  criticalRiskDeals,
  overdueCollections,
  pipelineValue,
  revenueByRep,
  staleDeals,
} from './selectors'

export interface OkrItem {
  id: string
  category: 'revenue' | 'activity' | 'team' | 'retention'
  title: string
  current: number
  target: number
  progress: number
}

const clampProgress = (current: number, target: number) =>
  target <= 0 ? 0 : Math.max(0, Math.min(100, (current / target) * 100))

export function buildOkrs(deals: Deal[], reps: Rep[], monthlyTargets: MonthlyTarget[]): OkrItem[] {
  const revenueRows = revenueByRep(deals, reps)
  const monthlyTarget = monthlyTargets.reduce((sum, item) => sum + item.target, 0)
  const monthlyAchieved = monthlyTargets.reduce((sum, item) => sum + item.achieved, 0)
  const closedWon = deals.filter((deal) => deal.stage === 'Closed – With Contract')
  const retainedContracts = deals.filter((deal) => deal.contract_status === 'Renewed').length
  const collected = collectedValue(deals)
  const overdue = overdueCollections(deals).length
  const stale = staleDeals(deals).length
  const critical = criticalRiskDeals(deals).length
  const totalCommissionEarners = reps.filter((rep) => commissionForRep(rep).tier > 0).length
  const teamMeetings = reps.reduce((sum, rep) => sum + rep.meetings, 0)
  const teamQuotes = reps.reduce((sum, rep) => sum + rep.quotes, 0)
  const closeRate = reps.length > 0 ? reps.reduce((sum, rep) => sum + rep.close_rate, 0) / reps.length : 0
  const topPerformer = revenueRows[0]?.secured ?? 0

  const okrs: OkrItem[] = [
    { id: 'okr-revenue-target', category: 'revenue', title: 'Hit cumulative target', current: monthlyAchieved, target: monthlyTarget, progress: clampProgress(monthlyAchieved, monthlyTarget) },
    { id: 'okr-pipeline', category: 'revenue', title: 'Maintain pipeline coverage', current: pipelineValue(deals), target: monthlyTarget * 1.4, progress: clampProgress(pipelineValue(deals), monthlyTarget * 1.4) },
    { id: 'okr-closed', category: 'revenue', title: 'Closed-won bookings', current: closedValue(deals), target: monthlyTarget, progress: clampProgress(closedValue(deals), monthlyTarget) },
    { id: 'okr-cash', category: 'revenue', title: 'Collections conversion', current: collected, target: closedValue(deals), progress: clampProgress(collected, Math.max(closedValue(deals), 1)) },
    { id: 'okr-meetings', category: 'activity', title: 'Meeting volume', current: teamMeetings, target: 420, progress: clampProgress(teamMeetings, 420) },
    { id: 'okr-quotes', category: 'activity', title: 'Quotation output', current: teamQuotes, target: 180, progress: clampProgress(teamQuotes, 180) },
    { id: 'okr-close-rate', category: 'team', title: 'Average close rate', current: closeRate, target: 45, progress: clampProgress(closeRate, 45) },
    { id: 'okr-top-performer', category: 'team', title: 'Top performer secured', current: topPerformer, target: monthlyTarget * 0.35, progress: clampProgress(topPerformer, monthlyTarget * 0.35) },
    { id: 'okr-commission', category: 'team', title: 'Commission-earning reps', current: totalCommissionEarners, target: Math.max(1, Math.ceil(reps.length * 0.7)), progress: clampProgress(totalCommissionEarners, Math.max(1, Math.ceil(reps.length * 0.7))) },
    { id: 'okr-retention', category: 'retention', title: 'Pipeline hygiene', current: retainedContracts + closedWon.length, target: Math.max(1, deals.length - overdue - stale - critical), progress: clampProgress(retainedContracts + closedWon.length, Math.max(1, deals.length - overdue - stale - critical)) },
  ]

  return okrs.slice(0, 10)
}
