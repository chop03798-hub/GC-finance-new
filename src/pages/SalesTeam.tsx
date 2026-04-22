import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { makeBlankRep, repColumns } from '../lib/workspace'

export default function SalesTeam() {
  const { reps, settings, pageViews, setPageView, updateRep, bulkAddReps, duplicateRep, deleteRep, fmtSAR, canEditCurrentPage } = useApp()
  const target = reps.reduce((sum, row) => sum + row.monthly_target, 0)
  const secured = reps.reduce((sum, row) => sum + row.secured, 0)

  return (
    <PageWorkspace
      title="👥 Sales Team"
      subtitle="Editable roster with targets, attainment, pipeline throughput, and bulk spreadsheet operations."
      rows={reps}
      columns={repColumns}
      settings={settings}
      view={pageViews.salesteam ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('salesteam', view)}
      createBlankRow={makeBlankRep}
      onAddRows={bulkAddReps}
      onUpdateRow={updateRep}
      onDuplicateRow={duplicateRep}
      onDeleteRow={deleteRep}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Team Members', value: String(reps.length), sub: 'Editable rep roster', color: 'var(--accent)', icon: '👥' },
        { label: 'Monthly Target', value: fmtSAR(target), sub: 'Current aggregate target', color: 'var(--amber)', icon: '🎯' },
        { label: 'Secured', value: fmtSAR(secured), sub: 'Tracked secured value', color: 'var(--green)', icon: '✅' },
        { label: 'Avg Close Rate', value: `${(reps.reduce((sum, row) => sum + row.close_rate, 0) / Math.max(reps.length, 1)).toFixed(1)}%`, sub: 'Across all reps', color: 'var(--violet)', icon: '📊' },
      ]}
      dashboardContent={
        <div className="card">
          <div className="section-title">Leaderboard</div>
          <div className="insight-list">
            {[...reps]
              .sort((a, b) => b.secured - a.secured)
              .slice(0, 8)
              .map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.name}</strong>
                  <span>{row.role}</span>
                  <span>{fmtSAR(row.secured)}</span>
                  <span>{row.close_rate}% close rate</span>
                </div>
              ))}
          </div>
        </div>
      }
    />
  )
}
