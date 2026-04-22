import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { makeBlankRep, repColumns } from '../lib/workspace'

export default function Goals() {
  const { reps, settings, pageViews, setPageView, updateRep, bulkAddReps, duplicateRep, deleteRep, fmtSAR, canEditCurrentPage } = useApp()
  const gap = reps.reduce((sum, row) => sum + Math.max(row.monthly_target - row.secured, 0), 0)

  return (
    <PageWorkspace
      title="🎯 Goals"
      subtitle="Target planning view for quotas, secured value, close rates, and spreadsheet-driven goal updates."
      rows={reps}
      columns={repColumns}
      settings={settings}
      view={pageViews.goals ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('goals', view)}
      createBlankRow={makeBlankRep}
      onAddRows={bulkAddReps}
      onUpdateRow={updateRep}
      onDuplicateRow={duplicateRep}
      onDeleteRow={deleteRep}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Total Target', value: fmtSAR(reps.reduce((sum, row) => sum + row.monthly_target, 0)), sub: 'Monthly quota baseline', color: 'var(--accent)', icon: '🎯' },
        { label: 'Goal Gap', value: fmtSAR(gap), sub: 'Remaining to target', color: 'var(--amber)', icon: '📏' },
        { label: 'At Target', value: String(reps.filter((row) => row.secured >= row.monthly_target).length), sub: 'Reps at or above quota', color: 'var(--green)', icon: '🏆' },
        { label: 'Needs Attention', value: String(reps.filter((row) => row.secured < row.monthly_target * 0.7).length), sub: 'Below 70% of quota', color: 'var(--red)', icon: '⚠️' },
      ]}
      dashboardContent={
        <div className="card">
          <div className="section-title">Quota Gap by Rep</div>
          <div className="insight-list">
            {[...reps]
              .sort((a, b) => (b.monthly_target - b.secured) - (a.monthly_target - a.secured))
              .slice(0, 8)
              .map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.name}</strong>
                  <span>{fmtSAR(row.monthly_target)}</span>
                  <span>{fmtSAR(row.secured)}</span>
                  <span>{fmtSAR(Math.max(row.monthly_target - row.secured, 0))} gap</span>
                </div>
              ))}
          </div>
        </div>
      }
    />
  )
}
