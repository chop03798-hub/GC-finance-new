import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function Clients() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, feedbacks, fmtSAR, canEditCurrentPage } = useApp()
  const rows = deals
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const totalValue = rows.reduce((sum, row) => sum + row.quotation_value, 0)

  return (
    <PageWorkspace
      title="🏢 Clients"
      subtitle="Client master list with editable CRM fields, salesman tracking, and spreadsheet import-export."
      rows={rows}
      columns={columns}
      settings={settings}
      view={pageViews.clients ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('clients', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Client Rows', value: String(rows.length), sub: 'One row per company record', color: 'var(--accent)', icon: '🏢' },
        { label: 'Open Pipeline', value: String(rows.filter((row) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(row.stage)).length), sub: 'Still in progress', color: 'var(--amber)', icon: '📋' },
        { label: 'Closed Accounts', value: String(rows.filter((row) => ['Closed – With Contract', 'Closed – No Contract'].includes(row.stage)).length), sub: 'Closed won or direct invoice', color: 'var(--green)', icon: '✅' },
        { label: 'Portfolio Value', value: fmtSAR(totalValue), sub: 'All visible client rows', color: 'var(--violet)', icon: '💵' },
      ]}
      dashboardContent={
        <>
          <div className="card">
            <div className="section-title">Client Health</div>
            <div className="insight-list">
              {rows.slice(0, 8).map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.company_name}</strong>
                  <span>{row.sales_exec_name}</span>
                  <span>{row.stage}</span>
                  <span>{fmtSAR(row.quotation_value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title">Recent Feedback</div>
            <div className="insight-list">
              {feedbacks.slice(0, 5).map((feedback) => {
                const client = rows.find((d) => d.id === feedback.client_id)
                return (
                  <div key={feedback.id} className="insight-row">
                    <strong>{client?.company_name || 'Unknown'}</strong>
                    <span>{'⭐'.repeat(feedback.rating)}</span>
                    <span>{feedback.feedback_text}</span>
                    <span>{feedback.feedback_date}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      }
    />
  )
}
