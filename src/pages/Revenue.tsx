import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function Revenue() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, canEditCurrentPage } = useApp()
  const rows = deals.filter((row) => row.quotation_value > 0)
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const collected = rows.reduce((sum, row) => sum + (row.collected_amount || 0), 0)
  const statuses = ['Collected', 'Partial', 'Pending', 'Overdue'] as const
  const statusStats = statuses.map((status) => {
    const matching = rows.filter((row) => (row.collection_status || 'Pending') === status)
    return {
      status,
      count: matching.length,
      value: matching.reduce((sum, row) => sum + row.quotation_value, 0),
    }
  })
  const biggestGap = [...rows]
    .filter((row) => row.collection_status !== 'Collected')
    .sort((a, b) => (b.quotation_value - (b.collected_amount || 0)) - (a.quotation_value - (a.collected_amount || 0)))
    .slice(0, 8)

  return (
    <PageWorkspace
      title="💵 Revenue"
      subtitle="Financial tracking with quotation value, collected cash, collection status, and export-ready rows."
      rows={rows}
      columns={columns}
      settings={settings}
      view={pageViews.revenue ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('revenue', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Revenue Rows', value: String(rows.length), sub: 'Rows with value assigned', color: 'var(--accent)', icon: '📈' },
        { label: 'Quoted Value', value: fmtSAR(rows.reduce((sum, row) => sum + row.quotation_value, 0)), sub: 'Gross quoted revenue', color: 'var(--violet)', icon: '💵' },
        { label: 'Collected Cash', value: fmtSAR(collected), sub: 'Cash already in', color: 'var(--green)', icon: '✅' },
        { label: 'Overdue', value: String(rows.filter((row) => row.collection_status === 'Overdue').length), sub: 'Collections needing action', color: 'var(--red)', icon: '🚨' },
      ]}
      dashboardContent={
        <div className="analysis-grid">
          <div className="card">
            <div className="section-title">Collection Status Mix</div>
            <div className="analysis-stat-grid">
              {statusStats.map((item) => (
                <div key={item.status} className="analysis-stat">
                  <div className="analysis-stat-label">{item.status}</div>
                  <div className="analysis-stat-value">{item.count}</div>
                  <div className="analysis-stat-sub">{fmtSAR(item.value)} quoted value</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title">Collection Queue</div>
            <div className="insight-list">
              {biggestGap.map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.company_name}</strong>
                  <span>{row.collection_status || 'Pending'}</span>
                  <span>{fmtSAR((row.quotation_value || 0) - (row.collected_amount || 0))}</span>
                  <span>{fmtSAR(row.quotation_value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
