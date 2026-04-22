import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { makeBlankRep, repColumns } from '../lib/workspace'

export default function Commissions() {
  const { reps, settings, pageViews, setPageView, updateRep, bulkAddReps, duplicateRep, deleteRep, fmtSAR, repTier, canEditCurrentPage } = useApp()
  const totalCommission = reps.reduce((sum, row) => sum + repTier(row).comm, 0)
  const totalPaid = reps.reduce((sum, row) => sum + (row.total_commission_paid || 0), 0)
  const pendingPayments = reps.filter((row) => row.payment_status === 'pending').length
  const partialPayments = reps.filter((row) => row.payment_status === 'partial').length

  return (
    <PageWorkspace
      title="💰 Commissions"
      subtitle="Commission planning with editable rep quotas, secured value, and spreadsheet-driven payout analysis."
      rows={reps}
      columns={repColumns}
      settings={settings}
      view={pageViews.commissions ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('commissions', view)}
      createBlankRow={makeBlankRep}
      onAddRows={bulkAddReps}
      onUpdateRow={updateRep}
      onDuplicateRow={duplicateRep}
      onDeleteRow={deleteRep}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Total Commission', value: fmtSAR(totalCommission), sub: 'Current tier payouts', color: 'var(--green)', icon: '💰' },
        { label: 'Paid Tiers', value: String(reps.filter((row) => repTier(row).tier > 0).length), sub: 'Reps with earned commission', color: 'var(--accent)', icon: '🏆' },
        { label: 'Tier 5', value: String(reps.filter((row) => repTier(row).tier === 5).length), sub: 'Elite performers', color: 'var(--violet)', icon: '🥇' },
        { label: 'Average Payout', value: fmtSAR(totalCommission / Math.max(reps.length, 1)), sub: 'Across roster', color: 'var(--amber)', icon: '📊' },
        { label: 'Total Paid', value: fmtSAR(totalPaid), sub: 'Commissions disbursed', color: 'var(--blue)', icon: '💸' },
        { label: 'Pending Payments', value: String(pendingPayments), sub: 'Awaiting disbursement', color: 'var(--red)', icon: '⏳' },
        { label: 'Partial Payments', value: String(partialPayments), sub: 'Incomplete disbursements', color: 'var(--orange)', icon: '🔄' },
      ]}
      dashboardContent={
        <>
          <div className="card">
            <div className="section-title">Payout Ladder</div>
            <div className="insight-list">
              {[...reps]
                .sort((a, b) => repTier(b).comm - repTier(a).comm)
                .slice(0, 10)
                .map((row) => (
                  <div key={row.id} className="insight-row">
                    <strong>{row.name}</strong>
                    <span>Tier {repTier(row).tier}</span>
                    <span>{fmtSAR(row.secured)}</span>
                    <span>{fmtSAR(repTier(row).comm)}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title">Payment Status</div>
            <div className="insight-list">
              {reps
                .filter((row) => row.payment_status !== 'paid')
                .sort((a, b) => repTier(b).comm - repTier(a).comm)
                .slice(0, 10)
                .map((row) => (
                  <div key={row.id} className="insight-row">
                    <strong>{row.name}</strong>
                    <span>{row.payment_status}</span>
                    <span>{fmtSAR(repTier(row).comm - (row.total_commission_paid || 0))}</span>
                    <span>{row.last_payment_date || 'N/A'}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      }
    />
  )
}
