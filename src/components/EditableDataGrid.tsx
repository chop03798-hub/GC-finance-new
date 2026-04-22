import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { AppSettings, ImportMode, WorkspaceColumn, WorkspaceRow } from '../lib/workspace'
import { exportRowsToCsv, exportRowsToXlsx, importRowsFromFile, normalizeValue, toDisplayValue } from '../lib/workspace'

interface EditableDataGridProps<T extends WorkspaceRow> {
  title: string
  rows: T[]
  columns: WorkspaceColumn<T>[]
  settings: AppSettings
  canEdit?: boolean
  createBlankRow: () => T
  onAddRows: (rows: T[], mode: ImportMode) => void
  onUpdateRow: (id: string, patch: Partial<T>) => void
  onDuplicateRow?: (id: string) => void
  onDeleteRow?: (id: string) => void
  onRowSelect?: (row: T) => void
}

export default function EditableDataGrid<T extends WorkspaceRow>({
  title,
  rows,
  columns,
  settings,
  canEdit = true,
  createBlankRow,
  onAddRows,
  onUpdateRow,
  onDuplicateRow,
  onDeleteRow,
  onRowSelect,
}: EditableDataGridProps<T>) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<1 | -1>(-1)
  const [importMode, setImportMode] = useState<ImportMode>(settings.importMode)
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(0)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => columns.map((column) => String(column.key)))
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const pageSize = 100
  const fileInputRef = useRef<HTMLInputElement>(null)
  const columnMenuRef = useRef<HTMLDivElement>(null)
  const gridShellRef = useRef<HTMLDivElement>(null)
  const bottomScrollbarRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const syncScrollSourceRef = useRef<'grid' | 'bottom' | null>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const inputListIdPrefix = useId().replace(/:/g, '')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(0)
  }, [debouncedQuery, sortKey, sortDir])

  useEffect(() => {
    setVisibleColumns((current) => {
      const columnKeys = columns.map((column) => String(column.key))
      return current.filter((key) => columnKeys.includes(key)).length ? current.filter((key) => columnKeys.includes(key)) : columnKeys
    })
  }, [columns])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!columnMenuRef.current?.contains(event.target as Node)) {
        setColumnMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const gridShell = gridShellRef.current
    const bottomScrollbar = bottomScrollbarRef.current
    if (!gridShell || !bottomScrollbar) return

    const syncScroll = (source: HTMLElement, target: HTMLElement, origin: 'grid' | 'bottom') => {
      if (syncScrollSourceRef.current && syncScrollSourceRef.current !== origin) return
      syncScrollSourceRef.current = origin
      target.scrollLeft = source.scrollLeft
      window.requestAnimationFrame(() => {
        if (syncScrollSourceRef.current === origin) {
          syncScrollSourceRef.current = null
        }
      })
    }

    const handleGridScroll = () => syncScroll(gridShell, bottomScrollbar, 'grid')
    const handleBottomScroll = () => syncScroll(bottomScrollbar, gridShell, 'bottom')

    gridShell.addEventListener('scroll', handleGridScroll)
    bottomScrollbar.addEventListener('scroll', handleBottomScroll)

    return () => {
      gridShell.removeEventListener('scroll', handleGridScroll)
      bottomScrollbar.removeEventListener('scroll', handleBottomScroll)
    }
  }, [])

  useEffect(() => {
    const updateScrollWidth = () => {
      setTableScrollWidth(tableRef.current?.scrollWidth ?? 0)
    }

    updateScrollWidth()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(updateScrollWidth)
    if (gridShellRef.current) observer.observe(gridShellRef.current)
    if (tableRef.current) observer.observe(tableRef.current)

    return () => observer.disconnect()
  }, [columns, rows.length, settings.density, settings.wrapCells, visibleColumns])

  const activeColumns = columns.filter((column) => visibleColumns.includes(String(column.key)))
  const editable = canEdit

  const filtered = useMemo(() => {
    const lowered = debouncedQuery.trim().toLowerCase()
    const result = rows.filter((row) =>
      !lowered ||
      columns.some((column) => String(row[column.key as keyof T] ?? '').toLowerCase().includes(lowered))
    )

    if (sortKey) {
      result.sort((a, b) => {
        const left = a[sortKey as keyof T]
        const right = b[sortKey as keyof T]
        if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir
        return String(left ?? '').localeCompare(String(right ?? '')) * sortDir
      })
    }
    return result
  }, [columns, debouncedQuery, rows, sortDir, sortKey])

  const paginatedRows = useMemo(() => {
    const start = page * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const autocompleteColumns = activeColumns.filter((column) => column.type === 'autocomplete' && (column.options ?? []).length > 0)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((current) => (current === 1 ? -1 : 1))
      return
    }
    setSortKey(key)
    setSortDir(1)
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = await importRowsFromFile(file, columns, createBlankRow)
      onAddRows(imported, importMode)
      setStatus(`Imported ${imported.length} row${imported.length === 1 ? '' : 's'} from ${file.name}.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="workspace-toolbar card">
        <div>
          <div className="section-title" style={{ marginBottom: 6 }}>Spreadsheet View</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>
            Inline editing, filtered exports, and bulk CSV/XLSX upload.
          </div>
        </div>
        <div className="workspace-actions">
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            style={{ minWidth: 220 }}
          />
          <select className="field" value={importMode} onChange={(event) => setImportMode(event.target.value as ImportMode)} style={{ width: 120 }}>
            <option value="append">Append</option>
            <option value="replace">Replace</option>
          </select>
          <button className="btn btn-ghost" onClick={() => onAddRows([createBlankRow()], 'append')} disabled={!editable}>Add Row</button>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={!editable}>Import CSV/XLSX</button>
          <button className="btn btn-ghost" onClick={() => exportRowsToCsv(title.replaceAll(' ', '-').toLowerCase(), filtered, columns)}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => exportRowsToXlsx(title.replaceAll(' ', '-').toLowerCase(), filtered, columns)}>Export Excel</button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} hidden />
        </div>
      </div>

      <div className="card grid-secondary-toolbar">
        <div className="column-menu" ref={columnMenuRef}>
          <button
            className="btn btn-ghost column-menu-trigger"
            onClick={() => setColumnMenuOpen((current) => !current)}
            type="button"
          >
            Columns ({activeColumns.length}/{columns.length}) {columnMenuOpen ? '▴' : '▾'}
          </button>
          {columnMenuOpen && (
            <div className="column-menu-panel">
              {columns.map((column) => (
                <label key={String(column.key)} className="settings-check">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(String(column.key))}
                    onChange={(event) =>
                      setVisibleColumns((current) =>
                        event.target.checked
                          ? [...current, String(column.key)]
                          : current.filter((key) => key !== String(column.key))
                      )
                    }
                  />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          {filtered.length} filtered rows · {activeColumns.length} visible columns
        </div>
      </div>

      {status && <div className="card" style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>{status}</div>}
      {!editable && <div className="card" style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>This role can review and export this page, but editing is disabled here.</div>}
      {autocompleteColumns.map((column) => (
        <datalist key={String(column.key)} id={`${inputListIdPrefix}-${String(column.key)}-options`}>
          {(column.options ?? []).map((option) => <option key={option} value={option} />)}
        </datalist>
      ))}

      <div className="data-grid-shell" ref={gridShellRef}>
        <table ref={tableRef} className={`tbl spreadsheet-table ${settings.density === 'compact' ? 'compact' : ''} ${settings.wrapCells ? 'wrap-cells' : ''}`}>
          <thead className={settings.stickyHeader ? 'sticky-head' : ''}>
            <tr>
              {settings.showRowNumbers && <th style={{ width: 54 }}>#</th>}
              {activeColumns.map((column) => (
                <th
                  key={String(column.key)}
                  style={{ width: column.width, textAlign: column.align ?? 'left' }}
                  onClick={() => handleSort(String(column.key))}
                >
                  {column.label} {sortKey === String(column.key) ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              {(onDuplicateRow || onDeleteRow) && <th style={{ width: 110 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => (
              <tr
                key={row.id}
                className={onRowSelect ? 'clickable-row' : undefined}
                onClick={onRowSelect ? () => onRowSelect(row) : undefined}
              >
                {settings.showRowNumbers && <td className="mono" style={{ color: 'var(--text3)' }}>{page * pageSize + index + 1}</td>}
                {activeColumns.map((column) => {
                  const key = column.key as keyof T
                  const value = row[key]
                  const commonStyle = { textAlign: column.align ?? 'left', minWidth: column.width }
                  if (!column.editable || !editable) {
                    return (
                      <td key={String(column.key)} style={commonStyle}>
                        {toDisplayValue(row, column)}
                      </td>
                    )
                  }

                  if (column.type === 'select') {
                    return (
                      <td key={String(column.key)} style={commonStyle}>
                        <select
                          className="grid-input field"
                          value={String(value ?? '')}
                          disabled={!editable}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => onUpdateRow(row.id, { [key]: event.target.value } as Partial<T>)}
                        >
                          <option value="">—</option>
                          {(column.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </td>
                    )
                  }

                  if (column.type === 'textarea') {
                    return (
                      <td key={String(column.key)} style={commonStyle}>
                        <textarea
                          className="grid-input field"
                          value={String(value ?? '')}
                          rows={2}
                          disabled={!editable}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => onUpdateRow(row.id, { [key]: event.target.value } as Partial<T>)}
                        />
                      </td>
                    )
                  }

                  if (column.type === 'autocomplete') {
                    return (
                      <td key={String(column.key)} style={commonStyle}>
                        <input
                          className="grid-input field"
                          type="text"
                          list={`${inputListIdPrefix}-${String(column.key)}-options`}
                          value={String(value ?? '')}
                          disabled={!editable}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            onUpdateRow(row.id, { [key]: normalizeValue(column, event.target.value) } as Partial<T>)
                          }
                        />
                      </td>
                    )
                  }

                  return (
                    <td key={String(column.key)} style={commonStyle}>
                      <input
                        className="grid-input field"
                        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : column.type === 'email' ? 'email' : 'text'}
                        value={String(value ?? '')}
                        disabled={!editable}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          onUpdateRow(row.id, { [key]: normalizeValue(column, event.target.value) } as Partial<T>)
                        }
                      />
                    </td>
                  )
                })}
                {(onDuplicateRow || onDeleteRow) && (
                  <td style={{ width: 110 }}>
                    <div className="grid-row-actions">
                      {onDuplicateRow && <button className="btn btn-ghost btn-xs" onClick={(event) => { event.stopPropagation(); onDuplicateRow(row.id) }} disabled={!editable}>Duplicate</button>}
                      {onDeleteRow && <button className="btn btn-danger btn-xs" onClick={(event) => { event.stopPropagation(); onDeleteRow(row.id) }} disabled={!editable}>Delete</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-grid-scrollbar">
        <div ref={bottomScrollbarRef} className="data-grid-scrollbar-track" aria-label="Horizontal table scrollbar">
          <div style={{ width: tableScrollWidth, height: 1 }} />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(0)}>First</button>
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>
            Page {page + 1} of {totalPages} ({filtered.length} rows)
          </span>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>Last</button>
        </div>
      )}
    </div>
  )
}
