import type { CSSProperties, ReactNode } from 'react'
import EditableDataGrid from './EditableDataGrid'
import type { AppSettings, ImportMode, PageView, WorkspaceColumn, WorkspaceRow } from '../lib/workspace'

interface Metric {
  label: string
  value: string
  sub?: string
  color: string
  icon?: string
}

interface PageWorkspaceProps<T extends WorkspaceRow> {
  title: string
  subtitle: string
  rows: T[]
  columns: WorkspaceColumn<T>[]
  metrics: Metric[]
  settings: AppSettings
  view: PageView
  onViewChange: (view: PageView) => void
  createBlankRow: () => T
  onAddRows: (rows: T[], mode: ImportMode) => void
  onUpdateRow: (id: string, patch: Partial<T>) => void
  onDuplicateRow?: (id: string) => void
  onDeleteRow?: (id: string) => void
  dashboardContent?: ReactNode
  canEdit?: boolean
  onRowSelect?: (row: T) => void
}

export default function PageWorkspace<T extends WorkspaceRow>({
  title,
  subtitle,
  rows,
  columns,
  metrics,
  settings,
  view,
  onViewChange,
  createBlankRow,
  onAddRows,
  onUpdateRow,
  onDuplicateRow,
  onDeleteRow,
  dashboardContent,
  canEdit = true,
  onRowSelect,
}: PageWorkspaceProps<T>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <div className="page-actions">
          <button className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onViewChange('dashboard')}>
            Dashboard View
          </button>
          <button className={`btn ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onViewChange('grid')}>
            Excel View
          </button>
        </div>
      </div>

      <div className="kpi-grid kpi-grid-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="kpi-box" style={{ '--kpi-color': metric.color } as CSSProperties}>
            {metric.icon && <span className="kpi-icon">{metric.icon}</span>}
            <div className="kpi-label">{metric.label}</div>
            <div className="kpi-value">{metric.value}</div>
            {metric.sub && <div className="kpi-sub">{metric.sub}</div>}
          </div>
        ))}
      </div>

      {view === 'dashboard' ? (
        dashboardContent ?? (
          <div className="card">
            <div className="section-title">Data Snapshot</div>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>
              {rows.length} records loaded. Switch to Excel View to edit cells directly, then export the filtered set as CSV or Excel.
            </p>
          </div>
        )
      ) : (
        <EditableDataGrid
          title={title}
          rows={rows}
          columns={columns}
          settings={settings}
          canEdit={canEdit}
          createBlankRow={createBlankRow}
          onAddRows={onAddRows}
          onUpdateRow={onUpdateRow}
          onDuplicateRow={onDuplicateRow}
          onDeleteRow={onDeleteRow}
          onRowSelect={onRowSelect}
        />
      )}
    </div>
  )
}
