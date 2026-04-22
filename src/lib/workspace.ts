import * as XLSX from 'xlsx'
import type { Deal, Rep, Stage, Priority, CollectionStatus, ContractStatus } from './supabase'
import type { DealFieldOptions } from './dealHierarchy'

export type WorkspaceRow = Record<string, any> & { id: string }
export type ColumnType = 'text' | 'number' | 'date' | 'email' | 'select' | 'textarea' | 'autocomplete'
export type DataMode = 'mock' | 'auto' | 'live'
export type ImportMode = 'append' | 'replace'
export type PageView = 'dashboard' | 'grid'
export type AutomationProvider = 'cloudflare' | 'local' | 'ollama' | 'openai' | 'anthropic' | 'openai-compatible'
export type AccentPalette = 'trygc-orange' | 'trygc-purple' | 'emerald' | 'red' | 'amber' | 'blue'
export type BorderRadiusMode = 'sharp' | 'normal' | 'rounded'
export type SidebarMode = 'expanded' | 'collapsed' | 'auto'
export type CurrencyCode = 'SAR' | 'AED' | 'KWD' | 'EGP' | 'USD'
export type NumberFormat = 'en-SA' | 'en-US' | 'ar-SA'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
export type TableDensity = 'compact' | 'normal' | 'spacious'
export type LandingPage =
  | 'overview'
  | 'pipeline'
  | 'kanban'
  | 'contracts'
  | 'revenue'
  | 'commissions'
  | 'salesteam'
  | 'lost'
  | 'clients'
  | 'goals'
  | 'settings'

export interface AppSettings {
  version: 3
  theme: 'dark' | 'light' | 'system'
  accentPalette: AccentPalette
  borderRadius: BorderRadiusMode
  glassmorphism: boolean
  animations: boolean
  sidebarMode: SidebarMode
  currency: CurrencyCode
  showCurrencyCode: boolean
  compactNumbers: boolean
  numberFormat: NumberFormat
  dateFormat: DateFormat
  defaultView: PageView
  defaultPageView: PageView
  tableDensity: TableDensity
  density: 'compact' | 'comfortable'
  wrapCells: boolean
  showRowNumbers: boolean
  stickyHeader: boolean
  freezeFirstColumn: boolean
  zebraRows: boolean
  showTotalsRow: boolean
  rowsPerPage: 25 | 50 | 100 | 250 | 500
  autoSave: boolean
  exportFormat: 'csv' | 'xlsx'
  importMode: ImportMode
  defaultLandingPage: LandingPage
  showAlertsPanel: boolean
  showLeaderboard: boolean
  leaderboardSize: 3 | 5 | 10 | 13
  autoRefresh: boolean
  autoRefreshSeconds: 10 | 30 | 60 | 300
  staleDealThresholdDays: number
  lowProbabilityThreshold: number
  highValueThresholdSar: number
  alertThresholdDays: number
  notifyOverdueCollections: boolean
  notifyStaleDeals: boolean
  notifyNewDealAdded: boolean
  notifyTierChange: boolean
  dataMode: DataMode
  liveSync: boolean
  supabaseUrlOverride: string
  supabaseAnonKeyOverride: string
  confirmDeletes: boolean
  activeAgent: string
  automationProvider: AutomationProvider
  automationModel: string
  automationBaseUrl: string
  automationApiKey: string
  automationAutoFallback: boolean
  automationTemperature: number
}

export interface WorkspaceColumn<T extends WorkspaceRow = WorkspaceRow> {
  key: keyof T | string
  label: string
  type?: ColumnType
  editable?: boolean
  options?: string[]
  width?: number
  align?: 'left' | 'right' | 'center'
  formatter?: (value: any, row: T) => string
}

export const DEFAULT_SETTINGS: AppSettings = {
  version: 3,
  theme: 'light',
  accentPalette: 'trygc-orange',
  borderRadius: 'normal',
  glassmorphism: false,
  animations: true,
  sidebarMode: 'expanded',
  currency: 'SAR',
  showCurrencyCode: true,
  compactNumbers: true,
  numberFormat: 'en-SA',
  dateFormat: 'DD/MM/YYYY',
  defaultView: 'dashboard',
  density: 'comfortable',
  defaultPageView: 'dashboard',
  tableDensity: 'normal',
  wrapCells: false,
  showRowNumbers: true,
  stickyHeader: true,
  freezeFirstColumn: true,
  zebraRows: true,
  showTotalsRow: true,
  rowsPerPage: 50,
  autoSave: true,
  exportFormat: 'xlsx',
  importMode: 'append',
  defaultLandingPage: 'overview',
  showAlertsPanel: true,
  showLeaderboard: true,
  leaderboardSize: 5,
  autoRefresh: false,
  autoRefreshSeconds: 60,
  staleDealThresholdDays: 10,
  lowProbabilityThreshold: 50,
  highValueThresholdSar: 500000,
  alertThresholdDays: 10,
  notifyOverdueCollections: true,
  notifyStaleDeals: true,
  notifyNewDealAdded: false,
  notifyTierChange: true,
  dataMode: 'auto',
  liveSync: false,
  supabaseUrlOverride: '',
  supabaseAnonKeyOverride: '',
  confirmDeletes: true,
  activeAgent: 'gc-ksa',
  automationProvider: 'cloudflare',
  automationModel: '@cf/meta/llama-3.1-8b-instruct',
  automationBaseUrl: '',
  automationApiKey: '',
  automationAutoFallback: true,
  automationTemperature: 0.2,
}

export const SETTINGS_KEY = 'gc-ksa-settings-v3'
export const LEGACY_SETTINGS_KEY = 'gc-ksa-settings-v2'
export const DEALS_KEY = 'gc-ksa-deals-v2'
export const REPS_KEY = 'gc-ksa-reps-v2'
export const MONTHLY_TARGETS_KEY = 'gc-ksa-monthly-targets-v1'
export const PAGE_VIEW_KEY = 'gc-ksa-page-views-v2'

const STAGE_OPTIONS: Stage[] = [
  'Leads & Calls',
  'Meeting',
  'Quotations',
  'Opportunities',
  'Plans',
  'Pending for closure',
  'Closed – With Contract',
  'Closed – No Contract',
  'Lost',
]

const PRIORITY_OPTIONS: Priority[] = ['High', 'Medium', 'Low']
const COLLECTION_OPTIONS: CollectionStatus[] = ['Pending', 'Partial', 'Collected', 'Overdue']
const CONTRACT_OPTIONS: ContractStatus[] = ['Signed', 'Pending Signature', 'No Contract', 'Expired', 'Renewed']

export function buildDealColumns(fieldOptions: DealFieldOptions): WorkspaceColumn<Deal>[] {
  return [
    { key: 'date', label: 'Date', type: 'date', editable: true, width: 120 },
    { key: 'company_name', label: 'Company', type: 'autocomplete', editable: true, options: fieldOptions.companyOptions, width: 220 },
    { key: 'parent_company_name', label: 'Group / Parent Company', type: 'autocomplete', editable: true, options: fieldOptions.parentCompanyOptions, width: 220 },
    { key: 'brand_name', label: 'Brand', type: 'autocomplete', editable: true, options: fieldOptions.brandOptions, width: 170 },
    { key: 'business_type', label: 'Business Type', editable: true, width: 150 },
    { key: 'contact_person', label: 'Contact', editable: true, width: 160 },
    { key: 'sales_exec_name', label: 'Salesman', type: 'select', editable: true, options: fieldOptions.salesExecOptions, width: 170 },
    { key: 'stage', label: 'Stage', type: 'select', editable: true, options: STAGE_OPTIONS as string[], width: 180 },
    { key: 'priority', label: 'Priority', type: 'select', editable: true, options: PRIORITY_OPTIONS as string[], width: 110 },
    { key: 'quotation_value', label: 'Value', type: 'number', editable: true, width: 130, align: 'right' },
    { key: 'probability', label: 'Probability %', type: 'number', editable: true, width: 120, align: 'right' },
    { key: 'days_in_stage', label: 'Days', type: 'number', editable: true, width: 90, align: 'right' },
    { key: 'collection_status', label: 'Collection', type: 'select', editable: true, options: COLLECTION_OPTIONS as string[], width: 140 },
    { key: 'collected_amount', label: 'Collected', type: 'number', editable: true, width: 120, align: 'right' },
    { key: 'contract_status', label: 'Contract', type: 'select', editable: true, options: CONTRACT_OPTIONS as string[], width: 150 },
    { key: 'contract_date', label: 'Contract Date', type: 'date', editable: true, width: 130 },
    { key: 'contract_expiry', label: 'Expiry', type: 'date', editable: true, width: 130 },
    { key: 'campaign_months', label: 'Months', type: 'number', editable: true, width: 90, align: 'right' },
    { key: 'monthly_value', label: 'Monthly Value', type: 'number', editable: true, width: 130, align: 'right' },
    { key: 'comments', label: 'Notes', type: 'textarea', editable: true, width: 260 },
  ]
}

export const repColumns: WorkspaceColumn<Rep>[] = [
  { key: 'name', label: 'Name', editable: true, width: 180 },
  { key: 'role', label: 'Role', editable: true, width: 170 },
  { key: 'region', label: 'Region', editable: true, width: 120 },
  { key: 'email', label: 'Email', type: 'email', editable: true, width: 220 },
  { key: 'phone', label: 'Phone', editable: true, width: 140 },
  { key: 'salary', label: 'Salary', type: 'number', editable: true, width: 120, align: 'right' },
  { key: 'monthly_target', label: 'Monthly Target', type: 'number', editable: true, width: 130, align: 'right' },
  { key: 'secured', label: 'Secured', type: 'number', editable: true, width: 130, align: 'right' },
  { key: 'leads', label: 'Leads', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'meetings', label: 'Meetings', type: 'number', editable: true, width: 100, align: 'right' },
  { key: 'quotes', label: 'Quotes', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'opps', label: 'Opps', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'pending', label: 'Pending', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'closed', label: 'Closed', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'lost_deals', label: 'Lost', type: 'number', editable: true, width: 90, align: 'right' },
  { key: 'close_rate', label: 'Close Rate %', type: 'number', editable: true, width: 110, align: 'right' },
  { key: 'avg_deal', label: 'Avg Deal', type: 'number', editable: true, width: 110, align: 'right' },
  { key: 'cycle_time', label: 'Cycle Days', type: 'number', editable: true, width: 100, align: 'right' },
  { key: 'join_date', label: 'Join Date', type: 'date', editable: true, width: 120 },
  { key: 'total_commission_paid', label: 'Total Paid', type: 'number', editable: true, width: 120, align: 'right' },
  { key: 'last_payment_date', label: 'Last Payment', type: 'date', editable: true, width: 130 },
  { key: 'payment_status', label: 'Payment Status', type: 'select', editable: true, options: ['pending', 'paid', 'partial'], width: 140 },
]

export function parseStored<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function toDisplayValue<T extends WorkspaceRow>(row: T, column: WorkspaceColumn<T>) {
  const raw = row[column.key as keyof T]
  if (column.formatter) return column.formatter(raw, row)
  if (raw === null || raw === undefined) return ''
  return String(raw)
}

export function normalizeValue<T extends WorkspaceRow>(column: WorkspaceColumn<T>, raw: string) {
  if (raw === '') return column.type === 'number' ? 0 : ''
  if (column.type === 'number') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return raw
}

function coerceTableDensity(value: unknown): TableDensity {
  if (value === 'compact' || value === 'spacious') return value
  return 'normal'
}

function coerceDensity(value: unknown): 'compact' | 'comfortable' {
  return value === 'compact' ? 'compact' : 'comfortable'
}

export function coerceSettings(value: string | Partial<AppSettings> | null | undefined) {
  const parsed = typeof value === 'string' ? parseStored<Partial<AppSettings> | null>(value, null) : value
  if (!parsed) return null

  const defaultView = parsed.defaultView ?? parsed.defaultPageView ?? DEFAULT_SETTINGS.defaultView
  const tableDensity = parsed.tableDensity ?? (parsed.density === 'compact' ? 'compact' : 'normal')

  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    version: 3 as const,
    theme: parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'light',
    defaultView,
    defaultPageView: defaultView,
    tableDensity: coerceTableDensity(tableDensity),
    density: coerceDensity(parsed.density ?? (tableDensity === 'compact' ? 'compact' : 'comfortable')),
    rowsPerPage: [25, 50, 100, 250, 500].includes(Number(parsed.rowsPerPage))
      ? (parsed.rowsPerPage as AppSettings['rowsPerPage'])
      : DEFAULT_SETTINGS.rowsPerPage,
  } satisfies AppSettings
}

export function makeBlankDeal(): Deal {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    company_name: 'New company',
    parent_company_name: '',
    brand_name: '',
    business_type: 'General',
    contact_person: 'New contact',
    sales_exec_name: 'Unassigned',
    stage: 'Leads & Calls',
    probability: 10,
    days_in_stage: 0,
    priority: 'Medium',
    quotation_value: 0,
    collection_status: 'Pending',
    collected_amount: 0,
    contract_status: 'No Contract',
    comments: '',
  }
}

export function makeBlankRep(): Rep {
  return {
    id: crypto.randomUUID(),
    name: 'New rep',
    role: 'Sales Executive',
    region: 'Riyadh',
    salary: 0,
    monthly_target: 0,
    secured: 0,
    leads: 0,
    meetings: 0,
    quotes: 0,
    opps: 0,
    pending: 0,
    closed: 0,
    lost_deals: 0,
    close_rate: 0,
    avg_deal: 0,
    cycle_time: 0,
    join_date: new Date().toISOString().slice(0, 10),
    tier1_threshold: 0,
    tier2_threshold: 0,
    tier3_threshold: 0,
    tier4_threshold: 0,
    tier5_threshold: 0,
    tier1_comm: 0,
    tier2_comm: 0,
    tier3_comm: 0,
    tier4_comm: 0,
    tier5_comm: 0,
    email: '',
    phone: '',
    total_commission_paid: 0,
    last_payment_date: '',
    payment_status: 'pending',
  }
}

function sheetRowsFromRecords<T extends WorkspaceRow>(rows: T[], columns: WorkspaceColumn<T>[]) {
  return rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.label, row[column.key as keyof T] ?? '']))
  )
}

export function exportRowsToCsv<T extends WorkspaceRow>(filename: string, rows: T[], columns: WorkspaceColumn<T>[]) {
  const headers = columns.map((column) => column.label)
  const body = rows.map((row) =>
    columns
      .map((column) => {
        const value = row[column.key as keyof T]
        const text = value === null || value === undefined ? '' : String(value)
        return `"${text.replaceAll('"', '""')}"`
      })
      .join(',')
  )
  const csv = [headers.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportRowsToXlsx<T extends WorkspaceRow>(filename: string, rows: T[], columns: WorkspaceColumn<T>[]) {
  const worksheet = XLSX.utils.json_to_sheet(sheetRowsFromRecords(rows, columns))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFileXLSX(workbook, `${filename}.xlsx`)
}

function findColumnByHeader<T extends WorkspaceRow>(columns: WorkspaceColumn<T>[], header: string) {
  const normalized = header.trim().toLowerCase()
  return columns.find((column) => {
    const key = String(column.key).toLowerCase()
    return key === normalized || column.label.toLowerCase() === normalized
  })
}

export async function importRowsFromFile<T extends WorkspaceRow>(
  file: File,
  columns: WorkspaceColumn<T>[],
  createBlank: () => T
) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' })

  return rows.map((source) => {
    const next = createBlank()
    Object.entries(source).forEach(([header, value]) => {
      const column = findColumnByHeader(columns, header)
      if (!column) return
      next[column.key as keyof T] = normalizeValue(column, String(value ?? '')) as T[keyof T]
    })
    if (!next.id) next.id = crypto.randomUUID()
    return next
  })
}

export function sumBy<T extends WorkspaceRow>(rows: T[], key: keyof T) {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)
}
