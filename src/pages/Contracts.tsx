import { useMemo } from 'react'
import PageWorkspace from '../components/PageWorkspace'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'

export default function Contracts() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, canEditCurrentPage } = useApp()
  const rows = deals.filter((row) => row.contract_status || row.stage.includes('Closed'))
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const signedValue = rows.filter((row) => row.contract_status === 'Signed').reduce((sum, row) => sum + row.quotation_value, 0)

  return (
    <PageWorkspace
      title="📝 Contracts"
      subtitle="Contract lifecycle dashboard with editable contract status, dates, values, and renewal planning."
      rows={rows}
      columns={columns}
      settings={settings}
      view={pageViews.contracts ?? settings.defaultPageView}
      onViewChange={(view) => setPageView('contracts', view)}
      createBlankRow={makeBlankDeal}
      onAddRows={bulkAddDeals}
      onUpdateRow={updateDeal}
      onDuplicateRow={duplicateDeal}
      onDeleteRow={deleteDeal}
      canEdit={canEditCurrentPage}
      metrics={[
        { label: 'Contract Rows', value: String(rows.length), sub: 'Rows carrying contract data', color: 'var(--accent)', icon: '📝' },
        { label: 'Signed', value: String(rows.filter((row) => row.contract_status === 'Signed').length), sub: 'Active signed contracts', color: 'var(--green)', icon: '✅' },
        { label: 'Pending Signature', value: String(rows.filter((row) => row.contract_status === 'Pending Signature').length), sub: 'Need follow-up', color: 'var(--amber)', icon: '⏳' },
        { label: 'Signed Value', value: fmtSAR(signedValue), sub: 'Booked contract value', color: 'var(--violet)', icon: '💵' },
      ]}
      dashboardContent={
        <div className="card">
          <div className="section-title">Renewal Watchlist</div>
          <div className="insight-list">
            {rows
              .filter((row) => row.contract_expiry)
              .sort((a, b) => String(a.contract_expiry).localeCompare(String(b.contract_expiry)))
              .slice(0, 8)
              .map((row) => (
                <div key={row.id} className="insight-row">
                  <strong>{row.company_name}</strong>
                  <span>{row.contract_status || 'No status'}</span>
                  <span>{row.contract_expiry || '—'}</span>
                  <span>{fmtSAR(row.quotation_value)}</span>
                </div>
              ))}
          </div>
        </div>
      }
    />
  )
}
