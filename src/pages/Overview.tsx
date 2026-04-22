import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function Overview() {
  const { deals, reps, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, canEditCurrentPage } = useApp()
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const active = deals.filter((row) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(row.stage))
  const closed = deals.filter((row) => ['Closed – With Contract', 'Closed – No Contract'].includes(row.stage))
  const collected = deals.reduce((sum, row) => sum + (row.collected_amount || 0), 0)
  const overdue = deals.filter((row) => row.collection_status === 'Overdue')
  const stale = active.filter((row) => row.days_in_stage > 10)
  const criticalRisk = active.filter((row) => row.days_in_stage > 14 && row.probability < 50)
  const pendingClosureValue = deals
    .filter((row) => row.stage === 'Pending for closure')
    .reduce((sum, row) => sum + row.quotation_value, 0)
  const stageBreakdown = [
    { label: 'Leads', count: deals.filter((row) => row.stage === 'Leads & Calls').length, color: 'var(--violet)' },
    { label: 'Meetings', count: deals.filter((row) => row.stage === 'Meeting').length, color: 'var(--accent)' },
    { label: 'Quotes', count: deals.filter((row) => row.stage === 'Quotations').length, color: 'var(--amber)' },
    { label: 'Pending Close', count: deals.filter((row) => row.stage === 'Pending for closure').length, color: 'var(--green)' },
  ]
  const maxStageCount = Math.max(...stageBreakdown.map((item) => item.count), 1)

  return (
    <PageWorkspace
      title="📊 Executive Overview"
      subtitle="Airtable-look workspace with editable records, top-line sales metrics, and fast import-export."
      rows={deals}
      columns={columns}
      settings={settings}
      view={pageViews.overview ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('overview', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Total Pipeline', value: fmtSAR(active.reduce((sum, row) => sum + row.quotation_value, 0)), sub: `${active.length} active deals`, color: 'var(--accent)', icon: '💼' },
        { label: 'Closed Revenue', value: fmtSAR(closed.reduce((sum, row) => sum + row.quotation_value, 0)), sub: `${closed.length} closed rows`, color: 'var(--green)', icon: '✅' },
        { label: 'Cash Collected', value: fmtSAR(collected), sub: 'Tracked collection amount', color: 'var(--cyan)', icon: '💵' },
        { label: 'Sales Team', value: String(reps.length), sub: 'Editable rep roster', color: 'var(--violet)', icon: '👥' },
      ]}
      dashboardContent={
        <div className="analysis-grid">
          <div className="analysis-stack">
            <div className="card">
              <div className="section-title">Top Opportunities</div>
              <div className="insight-list">
                {[...active]
                  .sort((a, b) => b.quotation_value - a.quotation_value)
                  .slice(0, 10)
                  .map((row) => (
                    <div key={row.id} className="insight-row">
                      <strong>{row.company_name}</strong>
                      <span>{row.stage}</span>
                      <span>{row.sales_exec_name}</span>
                      <span>{fmtSAR(row.quotation_value)}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="card">
              <div className="section-title">Pipeline Health</div>
              <div className="bar-list">
                {stageBreakdown.map((item) => (
                  <div key={item.label} className="bar-row">
                    <strong>{item.label}</strong>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(item.count / maxStageCount) * 100}%`, background: item.color }} />
                    </div>
                    <span className="mono">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="analysis-stack">
            <div className="card">
              <div className="section-title">Collections & Attention</div>
              <div className="analysis-stat-grid">
                <div className="analysis-stat">
                  <div className="analysis-stat-label">Overdue collections</div>
                  <div className="analysis-stat-value">{overdue.length}</div>
                  <div className="analysis-stat-sub">{fmtSAR(overdue.reduce((sum, row) => sum + (row.collected_amount || 0), 0))} currently at risk</div>
                </div>
                <div className="analysis-stat">
                  <div className="analysis-stat-label">Stale active deals</div>
                  <div className="analysis-stat-value">{stale.length}</div>
                  <div className="analysis-stat-sub">More than 10 days in the same stage</div>
                </div>
                <div className="analysis-stat">
                  <div className="analysis-stat-label">Critical risk</div>
                  <div className="analysis-stat-value">{criticalRisk.length}</div>
                  <div className="analysis-stat-sub">Old deals with weak probability</div>
                </div>
                <div className="analysis-stat">
                  <div className="analysis-stat-label">Pending closure value</div>
                  <div className="analysis-stat-value">{fmtSAR(pendingClosureValue)}</div>
                  <div className="analysis-stat-sub">Best near-term conversion pool</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}
