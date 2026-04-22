import { useEffect, useMemo, useState } from 'react'

import PageWorkspace from '../components/PageWorkspace'
import FunnelChart from '../components/FunnelChart'
import RecordPanel from '../components/RecordPanel'
import { useApp } from '../App'
import { buildDealColumns, makeBlankDeal } from '../lib/workspace'
import type { Deal } from '../lib/supabase'

export default function Pipeline() {
  const { deals, dealFieldOptions, settings, pageViews, setPageView, updateDeal, bulkAddDeals, duplicateDeal, deleteDeal, fmtSAR, STAGE_ORDER, STAGE_COLORS, canEditCurrentPage } = useApp()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const rows = deals.filter((row) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(row.stage))
  const columns = useMemo(() => buildDealColumns(dealFieldOptions), [dealFieldOptions])
  const weighted = rows.reduce((sum, row) => sum + row.quotation_value * row.probability / 100, 0)
  const stageStats = useMemo(() => STAGE_ORDER
    .filter((stage) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(stage))
    .map((stage) => {
      const stageRows = rows.filter((row) => row.stage === stage)
      return {
        stage,
        count: stageRows.length,
        value: stageRows.reduce((sum, row) => sum + row.quotation_value, 0),
        avgDays: stageRows.length ? Math.round(stageRows.reduce((sum, row) => sum + row.days_in_stage, 0) / stageRows.length) : 0,
      }
    }), [STAGE_ORDER, rows])
  const maxStageValue = Math.max(...stageStats.map((item) => item.value), 1)

  useEffect(() => {
    const onOpenDeal = (event: Event) => {
      const customEvent = event as CustomEvent<Deal>
      if (customEvent.detail) setSelectedDeal(customEvent.detail)
    }

    window.addEventListener('gc-open-deal-record', onOpenDeal as EventListener)
    return () => window.removeEventListener('gc-open-deal-record', onOpenDeal as EventListener)
  }, [])

  return (
    <>
      <PageWorkspace
        title="Pipeline"
        subtitle="Zoho-style commercial view for live deals, stage health, and quick action from one surface."
        rows={rows}
        columns={columns}
        settings={settings}
        view={pageViews.pipeline ?? settings.defaultPageView}
        onViewChange={(view) => setPageView('pipeline', view)}
        createBlankRow={makeBlankDeal}
        onAddRows={bulkAddDeals}
        onUpdateRow={updateDeal}
        onDuplicateRow={duplicateDeal}
        onDeleteRow={deleteDeal}
        onRowSelect={setSelectedDeal}
        canEdit={canEditCurrentPage}
        metrics={[
          { label: 'Open Deals', value: String(rows.length), sub: 'Excludes closed and lost', color: 'var(--accent)', icon: '●' },
          { label: 'Pipeline Value', value: fmtSAR(rows.reduce((sum, row) => sum + row.quotation_value, 0)), sub: 'Gross open pipeline', color: 'var(--green)', icon: '◌' },
          { label: 'Weighted Forecast', value: fmtSAR(weighted), sub: 'Probability adjusted', color: 'var(--violet)', icon: '◐' },
          { label: 'Stale Deals', value: String(rows.filter((row) => row.days_in_stage > 10).length), sub: 'Older than 10 days in stage', color: 'var(--orange)', icon: '◔' },
        ]}
        dashboardContent={
          <div className="analysis-stack">
            <div className="stage-strip">
              {stageStats.map((item) => {
                return (
                  <button
                    key={item.stage}
                    className="stage-pill"
                    style={{ borderColor: STAGE_COLORS[item.stage] }}
                    type="button"
                  >
                    <div style={{ color: STAGE_COLORS[item.stage], fontWeight: 700 }}>{item.count}</div>
                    <div>{item.stage}</div>
                    <div className="mono">{fmtSAR(item.value)}</div>
                  </button>
                )
              })}
            </div>
            <div className="analysis-grid">
              <div className="card">
                <FunnelChart
                  items={stageStats.map((item) => ({
                    label: item.stage,
                    count: item.count,
                    value: item.value,
                    color: STAGE_COLORS[item.stage],
                  }))}
                  fmtSAR={fmtSAR}
                />
              </div>
              <div className="card">
                <div className="section-title">Stage Velocity</div>
                <div className="bar-list">
                  {stageStats.map((item) => (
                    <div key={item.stage} className="bar-row">
                      <strong>{item.stage}</strong>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(item.value / maxStageValue) * 100}%`, background: STAGE_COLORS[item.stage] }} />
                      </div>
                      <span>{item.avgDays}d avg</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card hot-list-card">
                <div className="section-title">Hot List</div>
                <div className="insight-list">
                  {[...rows]
                    .sort((a, b) => b.quotation_value - a.quotation_value)
                    .slice(0, 8)
                    .map((row) => (
                      <button key={row.id} className="insight-row insight-row-button" type="button" onClick={() => setSelectedDeal(row)}>
                        <strong>{row.company_name}</strong>
                        <span>{row.stage}</span>
                        <span>{row.sales_exec_name}</span>
                        <span>{fmtSAR(row.quotation_value)}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        }
      />
      <RecordPanel
        deal={selectedDeal}
        open={selectedDeal !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDeal(null)
        }}
        fmtSAR={fmtSAR}
      />
    </>
  )
}
