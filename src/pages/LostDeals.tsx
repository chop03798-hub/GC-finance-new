import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function LostDeals() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, canEditCurrentPage } = useApp()
  const rows = deals.filter((row) => row.stage === 'Lost')
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const reasons = rows.reduce<Record<string, { count: number; value: number }>>((acc, row) => {
    const key = row.lost_reason || 'No reason captured'
    acc[key] ??= { count: 0, value: 0 }
    acc[key].count += 1
    acc[key].value += row.quotation_value
    return acc
  }, {})
  const reasonList = Object.entries(reasons)
    .map(([reason, stats]) => ({ reason, ...stats }))
    .sort((a, b) => b.value - a.value)
  const maxReasonValue = Math.max(...reasonList.map((item) => item.value), 1)

  return (
    <PageWorkspace
      title="📉 Lost Deals"
      subtitle="Loss analysis with editable reasons, owner history, and export-ready recovery backlog."
      rows={rows}
      columns={columns}
      settings={settings}
      view={pageViews.lost ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('lost', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Lost Count', value: String(rows.length), sub: 'Lost opportunities', color: 'var(--red)', icon: '📉' },
        { label: 'Lost Value', value: fmtSAR(rows.reduce((sum, row) => sum + row.quotation_value, 0)), sub: 'Value moved out of pipeline', color: 'var(--amber)', icon: '💸' },
        { label: 'High Priority Lost', value: String(rows.filter((row) => row.priority === 'High').length), sub: 'Worth reviewing first', color: 'var(--violet)', icon: '🔥' },
        { label: 'Recoverable', value: String(rows.filter((row) => (row.comments || '').toLowerCase().includes('follow')).length), sub: 'Rows tagged for revisit', color: 'var(--green)', icon: '🔁' },
      ]}
      dashboardContent={
        <div className="analysis-grid">
          <div className="card">
            <div className="section-title">Loss Reasons</div>
            <div className="bar-list">
              {reasonList.map((item) => (
                <div key={item.reason} className="bar-row">
                  <strong>{item.reason}</strong>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(item.value / maxReasonValue) * 100}%`, background: 'var(--red)' }} />
                  </div>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title">Recovery Backlog</div>
            <div className="insight-list">
              {rows.slice(0, 8).map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.company_name}</strong>
                  <span>{row.lost_reason || 'No reason captured'}</span>
                  <span>{row.sales_exec_name}</span>
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
