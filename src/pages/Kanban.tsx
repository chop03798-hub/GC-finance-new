import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function Kanban() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, STAGE_ORDER, STAGE_COLORS, canEditCurrentPage } = useApp()
  const activeRows = deals.filter((row) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(row.stage))
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const lanes = useMemo(
    () =>
      STAGE_ORDER
        .filter((stage) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(stage))
        .map((stage) => ({
          stage,
          rows: activeRows.filter((row) => row.stage === stage),
        })),
    [STAGE_ORDER, activeRows]
  )

  return (
    <PageWorkspace
      title="🗂 Kanban"
      subtitle="Airtable-style deal board paired with an editable spreadsheet view for bulk updates."
      rows={activeRows}
      columns={columns}
      settings={settings}
      view={pageViews.kanban ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('kanban', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Active Deals', value: String(activeRows.length), sub: 'Currently on the board', color: 'var(--accent)', icon: '🗂' },
        { label: 'Open Value', value: fmtSAR(activeRows.reduce((sum, row) => sum + row.quotation_value, 0)), sub: 'Board pipeline total', color: 'var(--green)', icon: '💵' },
        { label: 'Near Close', value: String(activeRows.filter((row) => row.stage === 'Pending for closure').length), sub: 'Ready for next action', color: 'var(--amber)', icon: '⏳' },
        { label: 'Avg Probability', value: `${(activeRows.reduce((sum, row) => sum + row.probability, 0) / Math.max(activeRows.length, 1)).toFixed(0)}%`, sub: 'Across active lanes', color: 'var(--violet)', icon: '📊' },
      ]}
      dashboardContent={
        <div className="kanban-board">
          {lanes.map((lane) => (
            <div key={lane.stage} className="kanban-lane">
              <div className="kanban-lane-header" style={{ borderColor: STAGE_COLORS[lane.stage] }}>
                <strong>{lane.stage}</strong>
                <span>{lane.rows.length}</span>
              </div>
              <div className="kanban-lane-body">
                {lane.rows.map((row) => (
                  <div key={row.id} className="kanban-card">
                    <strong>{row.company_name}</strong>
                    <span>{row.sales_exec_name}</span>
                    <span>{fmtSAR(row.quotation_value)}</span>
                    <span>{row.probability}% probability</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
    />
  )
}
