# GC KSA Sales Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing GC KSA app into a branded, editable TryGC sales operations workspace with a shared advanced Excel grid, centralized finance/sales selectors, and complete page coverage for daily finance and sales workflows.

**Architecture:** Keep the current Vite + React app and refactor it into clearer domains: brand system, settings/data contexts, reusable grid, shared dashboard blocks, and selector-driven page modules. The operational contract is consistent across pages: each page provides a `Dashboard` summary surface and an `Excel` editing surface backed by the same domain data and settings model.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Recharts, Supabase client, localStorage persistence, Vitest, Testing Library

---

## File Structure

### Existing files to modify

- `package.json` — add the test runner and supporting test utilities
- `src/main.tsx` — load fonts/theme bootstrap and mount providers
- `src/App.tsx` — replace monolithic shell/context logic with provider-backed composition and TryGC chrome
- `src/App.css` — remove the current Barlow/JetBrains theme and replace with TryGC shell/layout CSS
- `src/index.css` — define theme tokens, global typography, scrollbars, and shared utility classes
- `src/lib/data.ts` — normalize seed data to the approved domain model, including monthly targets and richer deal fields
- `src/lib/workspace.ts` — replace the current thin settings/grid helpers with versioned settings schema, column config types, and export/import helpers
- `src/lib/supabase.ts` — expand domain types and add the `monthly_targets` shape plus realtime-safe adapter helpers
- `src/components/PageWorkspace.tsx` — convert to a page frame that composes metric strips, dashboard body, and the shared grid
- `src/components/EditableDataGrid.tsx` — replace current form-table behavior with the advanced operational grid
- `src/pages/Overview.tsx`
- `src/pages/Pipeline.tsx`
- `src/pages/Kanban.tsx`
- `src/pages/Contracts.tsx`
- `src/pages/Revenue.tsx`
- `src/pages/Commissions.tsx`
- `src/pages/SalesTeam.tsx`
- `src/pages/LostDeals.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Goals.tsx`
- `src/pages/Settings.tsx`

### New files to create

- `src/branding/tokens.ts`
- `src/branding/logo.tsx`
- `src/context/SettingsContext.tsx`
- `src/context/WorkspaceDataContext.tsx`
- `src/lib/formatters.ts`
- `src/lib/selectors.ts`
- `src/lib/clientAggregates.ts`
- `src/lib/okr.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/primitives/SectionHeading.tsx`
- `src/components/primitives/KpiCard.tsx`
- `src/components/primitives/StatusBadge.tsx`
- `src/components/primitives/ViewToggle.tsx`
- `src/components/grid/GridToolbar.tsx`
- `src/components/grid/ColumnManager.tsx`
- `src/components/grid/PinnedTotalsRow.tsx`
- `src/components/grid/PaginationBar.tsx`
- `src/components/grid/cellStyles.ts`
- `src/components/charts/PipelineFunnel.tsx`
- `src/components/charts/TargetVsAchievedChart.tsx`
- `src/components/charts/RevenueDonut.tsx`
- `src/components/charts/LeaderboardChart.tsx`
- `src/components/charts/CollectionBreakdown.tsx`
- `src/components/charts/LossReasonChart.tsx`
- `src/components/charts/ProgressRing.tsx`
- `src/test/setup.ts`
- `src/lib/selectors.test.ts`
- `src/lib/okr.test.ts`
- `src/components/EditableDataGrid.test.tsx`
- `src/context/SettingsContext.test.tsx`

### Notes

- The current workspace is not a Git repository. Each commit step below includes exact commands, but those commands only work after Git is initialized or after the app is moved back into a repository checkout.
- The current codebase already contains useful seed data and Supabase types. Preserve those where possible instead of discarding them wholesale.

## Task 1: Install Test Harness And Theme Bootstrap

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write the failing test harness configuration expectation**

Add this test script block to `package.json` and create the setup file import in the test command target:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Run install to verify the test command is missing before implementation**

Run: `npm run test`

Expected: FAIL with a missing script error such as `Missing script: "test"`.

- [ ] **Step 3: Write the minimal implementation for package scripts and setup**

Update `package.json`, create `src/test/setup.ts`, and change `src/main.tsx` to load the global stylesheet once before rendering:

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

```ts
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Run install and verify the test runner boots**

Run: `npm install`

Expected: dependencies install successfully and `package-lock.json` updates.

- [ ] **Step 5: Run the test command to verify the runner now passes with zero tests**

Run: `npm run test`

Expected: PASS with `No test files found` or a clean zero-test exit after configuration is in place.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.tsx src/test/setup.ts
git commit -m "chore: add test harness bootstrap"
```

## Task 2: Build TryGC Brand Tokens And Shared Shell Primitives

**Files:**
- Create: `src/branding/tokens.ts`
- Create: `src/branding/logo.tsx`
- Create: `src/components/primitives/SectionHeading.tsx`
- Create: `src/components/primitives/KpiCard.tsx`
- Create: `src/components/primitives/StatusBadge.tsx`
- Create: `src/components/primitives/ViewToggle.tsx`
- Modify: `src/index.css`
- Modify: `src/App.css`

- [ ] **Step 1: Write the failing selector-style token test**

Create `src/lib/selectors.test.ts` with a first failing test that proves the stage colors and theme tokens are exported from one place:

```ts
import { describe, expect, it } from 'vitest'
import { STAGE_COLOR_MAP, TRY_GC_THEME } from '../branding/tokens'

describe('branding tokens', () => {
  it('exposes the approved TryGC stage and theme colors', () => {
    expect(TRY_GC_THEME.dark.bg).toBe('#08031a')
    expect(TRY_GC_THEME.brand.orange).toBe('#F26522')
    expect(STAGE_COLOR_MAP['Pending for closure']).toBe('#EA580C')
  })
})
```

- [ ] **Step 2: Run the token test to verify it fails**

Run: `npm run test -- src/lib/selectors.test.ts`

Expected: FAIL with module-not-found errors for `../branding/tokens`.

- [ ] **Step 3: Write the minimal branding implementation**

Create the token exports and the logo component:

```ts
// src/branding/tokens.ts
export const TRY_GC_THEME = {
  brand: {
    orange: '#F26522',
    orangeTint: 'rgba(242,101,34,.14)',
    orangeGlow: 'rgba(242,101,34,.25)',
    purpleDark: '#5C2D91',
    purpleMid: '#7B3FC4',
    purpleLight: '#9B6DD6',
    purpleTint: 'rgba(92,45,145,.14)',
  },
  dark: {
    bg: '#08031a',
    card: '#110630',
    row: '#190940',
    deep: '#1f0e4a',
    border: '#281558',
    border2: '#351b6e',
    nav: '#0a0422',
    text1: '#f0e8ff',
    text2: '#c4ade8',
    text3: '#9b87c4',
    text4: '#6b5a8e',
  },
  light: {
    bg: '#f5f0ff',
    card: '#ffffff',
    row: '#f0ebff',
    border: '#d4c8f0',
    text1: '#1a0d35',
    text2: '#4a3270',
    text3: '#7a68a0',
  },
}

export const STAGE_COLOR_MAP = {
  'Leads & Calls': '#9B6DD6',
  Meeting: '#7B3FC4',
  Quotations: '#F59E0B',
  Opportunities: '#3B82F6',
  Plans: '#F26522',
  'Pending for closure': '#EA580C',
  'Closed – With Contract': '#22C55E',
  'Closed – No Contract': '#CA8A04',
  Lost: '#EF4444',
} as const
```

```tsx
// src/branding/logo.tsx
export function TryGcLogo() {
  return (
    <svg viewBox="0 0 38 42" aria-hidden="true">
      <circle cx="17" cy="14" r="12" fill="#F26522" />
      <circle cx="17" cy="14" r="6.5" fill="#08031a" />
      <circle cx="29" cy="5" r="4" fill="#5C2D91" />
      <polygon points="28,8.5 25,12 31,12" fill="#5C2D91" />
      <path d="M5 27 A 14.5 14.5 0 1 0 33 27" stroke="#5C2D91" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 4: Replace global CSS with TryGC tokens and shell rules**

Write the root variables, light/dark overrides, DM Sans/DM Mono imports, scrollbar rules, and reusable classes in `src/index.css`. Start with this skeleton:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');

:root {
  --o: #F26522;
  --o2: rgba(242,101,34,.14);
  --o3: rgba(242,101,34,.25);
  --p: #5C2D91;
  --pm: #7B3FC4;
  --pl: #9B6DD6;
  --p2: rgba(92,45,145,.14);
  --bg: #08031a;
  --card: #110630;
  --c2: #190940;
  --c3: #1f0e4a;
  --bd: #281558;
  --bdl: #351b6e;
  --nav: #0a0422;
  --t: #f0e8ff;
  --t2: #c4ade8;
  --t3: #9b87c4;
  --tm: #6b5a8e;
  --radius-card: 10px;
  --radius-small: 8px;
  --radius-button: 6px;
  --font-display: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}

[data-theme='light'] {
  --bg: #f5f0ff;
  --card: #ffffff;
  --c2: #f0ebff;
  --bd: #d4c8f0;
  --t: #1a0d35;
  --t2: #4a3270;
  --t3: #7a68a0;
}
```

- [ ] **Step 5: Run the branding test to verify it passes**

Run: `npm run test -- src/lib/selectors.test.ts`

Expected: PASS for the branding token assertions.

- [ ] **Step 6: Commit**

```bash
git add src/branding/tokens.ts src/branding/logo.tsx src/components/primitives/SectionHeading.tsx src/components/primitives/KpiCard.tsx src/components/primitives/StatusBadge.tsx src/components/primitives/ViewToggle.tsx src/index.css src/App.css src/lib/selectors.test.ts
git commit -m "feat: add trygc branding primitives"
```

## Task 3: Expand Settings Schema And Provider Boundaries

**Files:**
- Create: `src/context/SettingsContext.tsx`
- Create: `src/context/WorkspaceDataContext.tsx`
- Create: `src/context/SettingsContext.test.tsx`
- Modify: `src/lib/workspace.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing settings persistence test**

Create `src/context/SettingsContext.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { SettingsProvider, useSettings } from './SettingsContext'

describe('SettingsContext', () => {
  beforeEach(() => localStorage.clear())

  it('persists advanced TryGC settings to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider })

    act(() => {
      result.current.updateSettings({
        defaultView: 'grid',
        rowsPerPage: 250,
        staleDealThresholdDays: 12,
        confirmDeletes: true,
      })
    })

    const stored = JSON.parse(localStorage.getItem('gc-ksa-settings-v3')!)
    expect(stored.defaultView).toBe('grid')
    expect(stored.rowsPerPage).toBe(250)
    expect(stored.staleDealThresholdDays).toBe(12)
    expect(stored.confirmDeletes).toBe(true)
  })
})
```

- [ ] **Step 2: Run the settings test to verify it fails**

Run: `npm run test -- src/context/SettingsContext.test.tsx`

Expected: FAIL because `SettingsContext` and `gc-ksa-settings-v3` do not exist.

- [ ] **Step 3: Write the versioned settings model**

Replace the current settings type in `src/lib/workspace.ts` with a grouped operational shape:

```ts
export interface AppSettings {
  version: 3
  theme: 'dark' | 'light' | 'system'
  accentPalette: 'trygc-orange' | 'trygc-purple' | 'emerald' | 'red' | 'amber' | 'blue'
  borderRadius: 'sharp' | 'normal' | 'rounded'
  glassmorphism: boolean
  animations: boolean
  sidebarMode: 'expanded' | 'collapsed' | 'auto'
  currency: 'SAR' | 'AED' | 'KWD' | 'EGP' | 'USD'
  showCurrencyCode: boolean
  compactNumbers: boolean
  numberFormat: 'en-SA' | 'en-US' | 'ar-SA'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  defaultView: 'dashboard' | 'grid'
  tableDensity: 'compact' | 'normal' | 'spacious'
  defaultLandingPage: 'overview' | 'pipeline' | 'kanban' | 'contracts' | 'revenue' | 'commissions' | 'salesteam' | 'lost' | 'clients' | 'goals' | 'settings'
  showAlertsPanel: boolean
  showLeaderboard: boolean
  leaderboardSize: 3 | 5 | 10 | 13
  autoRefresh: boolean
  autoRefreshSeconds: 60 | 120 | 300
  staleDealThresholdDays: number
  lowProbabilityThreshold: number
  highValueThresholdSar: number
  alertThresholdDays: number
  freezeFirstColumn: boolean
  showRowNumbers: boolean
  zebraRows: boolean
  showTotalsRow: boolean
  rowsPerPage: 25 | 50 | 100 | 250 | 500
  notifyOverdueCollections: boolean
  notifyStaleDeals: boolean
  notifyNewDealAdded: boolean
  notifyTierChange: boolean
  dataMode: 'mock' | 'auto' | 'live'
  supabaseUrlOverride: string
  supabaseAnonKeyOverride: string
  autoSave: boolean
  confirmDeletes: boolean
}
```

- [ ] **Step 4: Implement `SettingsProvider` and `WorkspaceDataProvider`**

Create focused providers and mount them in `src/App.tsx`:

```tsx
// src/App.tsx
import { SettingsProvider } from './context/SettingsContext'
import { WorkspaceDataProvider } from './context/WorkspaceDataContext'
import { AppShell } from './components/layout/AppShell'

export default function App() {
  return (
    <SettingsProvider>
      <WorkspaceDataProvider>
        <AppShell />
      </WorkspaceDataProvider>
    </SettingsProvider>
  )
}
```

- [ ] **Step 5: Run the settings test to verify it passes**

Run: `npm run test -- src/context/SettingsContext.test.tsx`

Expected: PASS with the new persistence key and settings fields.

- [ ] **Step 6: Commit**

```bash
git add src/lib/workspace.ts src/context/SettingsContext.tsx src/context/WorkspaceDataContext.tsx src/context/SettingsContext.test.tsx src/App.tsx
git commit -m "feat: split settings and workspace providers"
```

## Task 4: Centralize Domain Formatters, Selectors, And Finance Logic

**Files:**
- Create: `src/lib/formatters.ts`
- Create: `src/lib/selectors.ts`
- Create: `src/lib/clientAggregates.ts`
- Create: `src/lib/okr.ts`
- Modify: `src/lib/data.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/lib/selectors.test.ts`
- Create: `src/lib/okr.test.ts`

- [ ] **Step 1: Extend the failing selector tests for commission and OKR logic**

Add these tests:

```ts
import { commissionForRep, overviewMetrics } from './selectors'
import { buildOkrs } from './okr'
import { MOCK_DEALS, MOCK_MONTHLY, MOCK_REPS } from './data'

it('computes the highest tier commission using explicit thresholds', () => {
  const topRep = MOCK_REPS.find((rep) => rep.name === 'Mahmoud Jad')!
  expect(commissionForRep(topRep).tier).toBe(5)
  expect(commissionForRep(topRep).commission).toBe(593084)
})

it('builds overview metrics from shared selectors', () => {
  const metrics = overviewMetrics(MOCK_DEALS, MOCK_REPS, MOCK_MONTHLY)
  expect(metrics.primary.pipelineValue).toBeGreaterThan(0)
  expect(metrics.secondary.alertCount).toBeGreaterThanOrEqual(0)
})

it('builds 10 OKRs from shared data', () => {
  const okrs = buildOkrs(MOCK_DEALS, MOCK_REPS, MOCK_MONTHLY)
  expect(okrs).toHaveLength(10)
})
```

- [ ] **Step 2: Run selector and OKR tests to verify they fail**

Run: `npm run test -- src/lib/selectors.test.ts src/lib/okr.test.ts`

Expected: FAIL because the new exports do not exist.

- [ ] **Step 3: Normalize monthly targets and commission helpers**

Write these core utilities:

```ts
// src/lib/selectors.ts
import type { Deal, Rep, MonthlyTarget } from './supabase'

export function commissionForRep(rep: Rep) {
  if (rep.secured >= rep.tier5_threshold) return { tier: 5, commission: rep.tier5_comm }
  if (rep.secured >= rep.tier4_threshold) return { tier: 4, commission: rep.tier4_comm }
  if (rep.secured >= rep.tier3_threshold) return { tier: 3, commission: rep.tier3_comm }
  if (rep.secured >= rep.tier2_threshold) return { tier: 2, commission: rep.tier2_comm }
  if (rep.secured >= rep.tier1_threshold) return { tier: 1, commission: rep.tier1_comm }
  return { tier: 0, commission: 0 }
}

export function pipelineValue(deals: Deal[]) {
  return deals
    .filter((deal) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
}
```

- [ ] **Step 4: Implement shared formatter helpers**

Create `src/lib/formatters.ts`:

```ts
import type { AppSettings } from './workspace'

export function formatCurrency(value: number, settings: AppSettings) {
  const formatted = new Intl.NumberFormat(settings.numberFormat, {
    maximumFractionDigits: 0,
  }).format(value)
  return settings.showCurrencyCode ? `${settings.currency} ${formatted}` : formatted
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
```

- [ ] **Step 5: Run selector and OKR tests to verify they pass**

Run: `npm run test -- src/lib/selectors.test.ts src/lib/okr.test.ts`

Expected: PASS for commission, metrics, and OKR coverage.

- [ ] **Step 6: Commit**

```bash
git add src/lib/data.ts src/lib/supabase.ts src/lib/formatters.ts src/lib/selectors.ts src/lib/clientAggregates.ts src/lib/okr.ts src/lib/selectors.test.ts src/lib/okr.test.ts
git commit -m "feat: centralize sales and finance selectors"
```

## Task 5: Replace The Current Table With The Advanced Operational Grid

**Files:**
- Modify: `src/components/EditableDataGrid.tsx`
- Create: `src/components/grid/GridToolbar.tsx`
- Create: `src/components/grid/ColumnManager.tsx`
- Create: `src/components/grid/PinnedTotalsRow.tsx`
- Create: `src/components/grid/PaginationBar.tsx`
- Create: `src/components/grid/cellStyles.ts`
- Create: `src/components/EditableDataGrid.test.tsx`
- Modify: `src/lib/workspace.ts`

- [ ] **Step 1: Write the failing grid behavior tests**

Create `src/components/EditableDataGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EditableDataGrid from './EditableDataGrid'
import { makeBlankDeal, dealColumns, DEFAULT_SETTINGS } from '../lib/workspace'
import { MOCK_DEALS } from '../lib/data'

describe('EditableDataGrid', () => {
  it('supports double-click editing and enter-to-save', async () => {
    const user = userEvent.setup()
    const onUpdateRow = vi.fn()

    render(
      <EditableDataGrid
        title="Deals"
        rows={MOCK_DEALS.slice(0, 2)}
        columns={dealColumns}
        settings={{ ...DEFAULT_SETTINGS, rowsPerPage: 25 }}
        createBlankRow={makeBlankDeal}
        onAddRows={vi.fn()}
        onUpdateRow={onUpdateRow}
      />
    )

    await user.dblClick(screen.getByText(MOCK_DEALS[0].company_name))
    const input = screen.getByDisplayValue(MOCK_DEALS[0].company_name)
    await user.clear(input)
    await user.type(input, 'Updated Company{Enter}')

    expect(onUpdateRow).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the grid test to verify it fails**

Run: `npm run test -- src/components/EditableDataGrid.test.tsx`

Expected: FAIL because the current grid is immediate-input based and has no double-click edit contract.

- [ ] **Step 3: Add the new column type and totals config support**

Extend `WorkspaceColumn` in `src/lib/workspace.ts`:

```ts
export type ColumnType = 'text' | 'number' | 'currency' | 'percent' | 'date' | 'select' | 'badge' | 'boolean'

export interface WorkspaceColumn<T extends WorkspaceRow = WorkspaceRow> {
  key: keyof T | string
  label: string
  type?: ColumnType
  editable?: boolean
  options?: string[]
  width?: number
  minWidth?: number
  align?: 'left' | 'right' | 'center'
  hiddenByDefault?: boolean
  total?: 'sum' | 'avg' | 'none'
  formatter?: (value: unknown, row: T) => string
}
```

- [ ] **Step 4: Implement the advanced grid**

Replace the table behavior in `src/components/EditableDataGrid.tsx` with:

```tsx
const [editing, setEditing] = useState<{ rowId: string; columnKey: string } | null>(null)
const [draftValue, setDraftValue] = useState('')

function beginEdit(rowId: string, columnKey: string, value: unknown) {
  setEditing({ rowId, columnKey })
  setDraftValue(String(value ?? ''))
}

function commitEdit<T extends WorkspaceRow>(row: T, column: WorkspaceColumn<T>) {
  if (!editing) return
  onUpdateRow(row.id, {
    [column.key]: normalizeValue(column, draftValue),
  } as Partial<T>)
  setEditing(null)
}
```

And render cells so they switch between formatted display and editor mode on double-click.

- [ ] **Step 5: Add pinned totals, rows-per-page, and bulk actions**

Implement:

- pinned totals row based on `column.total`
- configurable page size from settings
- row selection state
- bulk delete button
- frozen first column when `settings.freezeFirstColumn` is true

- [ ] **Step 6: Run the grid test to verify it passes**

Run: `npm run test -- src/components/EditableDataGrid.test.tsx`

Expected: PASS for inline edit flow.

- [ ] **Step 7: Commit**

```bash
git add src/components/EditableDataGrid.tsx src/components/grid/GridToolbar.tsx src/components/grid/ColumnManager.tsx src/components/grid/PinnedTotalsRow.tsx src/components/grid/PaginationBar.tsx src/components/grid/cellStyles.ts src/components/EditableDataGrid.test.tsx src/lib/workspace.ts
git commit -m "feat: add advanced operations grid"
```

## Task 6: Rebuild App Shell, Sidebar, Topbar, And Shared Page Frame

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Topbar.tsx`
- Modify: `src/components/PageWorkspace.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write the failing shell render test**

Add this to `src/context/SettingsContext.test.tsx` or create a shell test:

```tsx
import { render, screen } from '@testing-library/react'
import { AppShell } from '../components/layout/AppShell'

it('renders the dark persistent sidebar and topbar shell', () => {
  render(<AppShell />)
  expect(screen.getByText('GC KSA Sales Command Center')).toBeInTheDocument()
  expect(screen.getByText('Overview')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run: `npm run test -- src/context/SettingsContext.test.tsx`

Expected: FAIL because `AppShell` does not exist.

- [ ] **Step 3: Implement `AppShell`, `Sidebar`, and `Topbar`**

Use the dark nav chrome regardless of theme:

```tsx
// src/components/layout/Sidebar.tsx
import { TryGcLogo } from '../../branding/logo'

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <TryGcLogo />
        <div>
          <strong>GC KSA Sales Command Center</strong>
          <span>TryGC SuperAdmin</span>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Update `PageWorkspace` to use the new reusable page frame**

Make the view switcher explicit and shared:

```tsx
<ViewToggle
  dashboardLabel="Dashboard"
  gridLabel="Excel"
  activeView={view}
  onChange={onViewChange}
/>
```

- [ ] **Step 5: Run the shell test to verify it passes**

Run: `npm run test -- src/context/SettingsContext.test.tsx`

Expected: PASS for shell chrome rendering.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/AppShell.tsx src/components/layout/Sidebar.tsx src/components/layout/Topbar.tsx src/components/PageWorkspace.tsx src/App.css src/context/SettingsContext.test.tsx
git commit -m "feat: rebuild trygc application shell"
```

## Task 7: Rebuild Overview, Pipeline, Kanban, And Contracts On Shared Selectors

**Files:**
- Modify: `src/pages/Overview.tsx`
- Modify: `src/pages/Pipeline.tsx`
- Modify: `src/pages/Kanban.tsx`
- Modify: `src/pages/Contracts.tsx`
- Create: `src/components/charts/PipelineFunnel.tsx`
- Create: `src/components/charts/TargetVsAchievedChart.tsx`
- Create: `src/components/charts/RevenueDonut.tsx`
- Create: `src/components/charts/CollectionBreakdown.tsx`

- [ ] **Step 1: Write the failing overview render expectation**

Add a page smoke test:

```tsx
import { render, screen } from '@testing-library/react'
import Overview from './Overview'

it('renders overview dashboard sections from shared selectors', () => {
  render(<Overview />)
  expect(screen.getByText(/pipeline funnel/i)).toBeInTheDocument()
  expect(screen.getByText(/alerts/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the page test to verify it fails**

Run: `npm run test -- src/pages/Overview.tsx`

Expected: FAIL because the current page does not render the required sections.

- [ ] **Step 3: Implement Overview with shared dashboard blocks**

Build `Overview.tsx` around:

- 8 primary KPI cards
- 6 secondary KPI cards
- `PipelineFunnel`
- `TargetVsAchievedChart`
- `RevenueDonut`
- leaderboard panel
- alerts panel

The primary KPI list should come from one selector call:

```tsx
const metrics = useOverviewMetrics()
```

- [ ] **Step 4: Implement Pipeline, Kanban, and Contracts with selector-driven dashboard sections**

For `Pipeline.tsx`:

- stage filter tiles
- stage value chart
- preview table

For `Kanban.tsx`:

- 9 columns from `STAGE_COLOR_MAP`
- lane totals by count and value

For `Contracts.tsx`:

- closed/collected/outstanding/overdue KPI cards
- collection status chart
- overdue alert list

- [ ] **Step 5: Run the overview and page smoke tests to verify they pass**

Run: `npm run test -- src/pages/Overview.tsx`

Expected: PASS for overview dashboard section presence.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Overview.tsx src/pages/Pipeline.tsx src/pages/Kanban.tsx src/pages/Contracts.tsx src/components/charts/PipelineFunnel.tsx src/components/charts/TargetVsAchievedChart.tsx src/components/charts/RevenueDonut.tsx src/components/charts/CollectionBreakdown.tsx
git commit -m "feat: rebuild core sales dashboards"
```

## Task 8: Rebuild Revenue, Commissions, Sales Team, Lost Deals, Clients, Goals, And Settings

**Files:**
- Modify: `src/pages/Revenue.tsx`
- Modify: `src/pages/Commissions.tsx`
- Modify: `src/pages/SalesTeam.tsx`
- Modify: `src/pages/LostDeals.tsx`
- Modify: `src/pages/Clients.tsx`
- Modify: `src/pages/Goals.tsx`
- Modify: `src/pages/Settings.tsx`
- Create: `src/components/charts/LeaderboardChart.tsx`
- Create: `src/components/charts/LossReasonChart.tsx`
- Create: `src/components/charts/ProgressRing.tsx`

- [ ] **Step 1: Write the failing commissions and settings tests**

Add expectations:

```tsx
it('renders the commission pool and tier reference sections', () => {
  render(<Commissions />)
  expect(screen.getByText(/total commission pool/i)).toBeInTheDocument()
  expect(screen.getByText(/tier reference/i)).toBeInTheDocument()
})

it('renders all seven settings sections', () => {
  render(<Settings />)
  expect(screen.getByText(/appearance/i)).toBeInTheDocument()
  expect(screen.getByText(/advanced/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the page tests to verify they fail**

Run: `npm run test -- src/pages/Commissions.tsx`

Expected: FAIL because the current pages do not render the required TryGC sections.

- [ ] **Step 3: Rebuild the finance-heavy pages**

For `Revenue.tsx`:

- add waterfall chart
- add monthly P&L line
- add revenue by rep table
- add expenses panel

For `Commissions.tsx`:

- total commission pool KPI
- tier calculator per rep
- commission chart by tier color
- tier reference table

- [ ] **Step 4: Rebuild the people and recovery pages**

For `SalesTeam.tsx`:

- rep scorecards
- attainment bars
- activity metrics
- ranking table

For `LostDeals.tsx`:

- loss reason breakdown
- recoverable flag section
- rep loss analysis

For `Clients.tsx`:

- client directory sorted by portfolio value
- grid/list toggle
- deal count and active/won status

For `Goals.tsx`:

- 10 OKR cards from `buildOkrs`
- progress rings
- category breakdown donut

- [ ] **Step 5: Rebuild Settings with the full seven-section operational form**

Make `Settings.tsx` render these exact sections in order:

1. Appearance
2. Data & Display
3. Dashboard
4. Pipeline
5. Excel View
6. Notifications
7. Advanced

And wire every field to `updateSettings`.

- [ ] **Step 6: Run the page tests to verify they pass**

Run: `npm run test -- src/pages/Commissions.tsx`

Expected: PASS for commission and settings coverage.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Revenue.tsx src/pages/Commissions.tsx src/pages/SalesTeam.tsx src/pages/LostDeals.tsx src/pages/Clients.tsx src/pages/Goals.tsx src/pages/Settings.tsx src/components/charts/LeaderboardChart.tsx src/components/charts/LossReasonChart.tsx src/components/charts/ProgressRing.tsx
git commit -m "feat: complete finance and team dashboards"
```

## Task 9: Finish Supabase Live Mode, Realtime Sync, And Final Verification

**Files:**
- Modify: `src/context/WorkspaceDataContext.tsx`
- Modify: `src/lib/supabase.ts`
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Write the failing data-mode integration test**

Add an adapter test that verifies mock mode and live mode share the same shape:

```ts
it('returns deals, reps, and monthly targets in a stable domain shape', async () => {
  const result = await loadWorkspaceSnapshot('mock')
  expect(result.deals.length).toBeGreaterThan(0)
  expect(result.reps.length).toBeGreaterThan(0)
  expect(result.monthlyTargets.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run the integration test to verify it fails**

Run: `npm run test -- src/lib/selectors.test.ts`

Expected: FAIL because `loadWorkspaceSnapshot` is not implemented.

- [ ] **Step 3: Implement live adapter and realtime subscriptions**

Add adapter functions in `WorkspaceDataContext`:

```ts
async function loadWorkspaceSnapshot(mode: 'mock' | 'auto' | 'live') {
  if (mode === 'mock') {
    return { deals: MOCK_DEALS, reps: MOCK_REPS, monthlyTargets: MOCK_MONTHLY }
  }

  const [dealsResult, repsResult, monthlyResult] = await Promise.all([
    supabase.from('deals').select('*'),
    supabase.from('reps').select('*'),
    supabase.from('monthly_targets').select('*'),
  ])

  return {
    deals: dealsResult.data ?? MOCK_DEALS,
    reps: repsResult.data ?? MOCK_REPS,
    monthlyTargets: monthlyResult.data ?? MOCK_MONTHLY,
  }
}
```

- [ ] **Step 4: Run all tests and the production build**

Run: `npm run test`

Expected: PASS for all tests.

Run: `npm run build`

Expected: PASS and `dist/` output generated without TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/context/WorkspaceDataContext.tsx src/lib/supabase.ts src/pages/Settings.tsx
git commit -m "feat: finish live data mode and realtime sync"
```

## Self-Review

### Spec Coverage

- Brand system: covered in Tasks 2 and 6
- dark/light layout and TryGC shell: covered in Tasks 2 and 6
- advanced grid behavior: covered in Task 5
- settings expansion and persistence: covered in Task 3 and Task 8
- centralized business calculations: covered in Task 4
- all page dashboards and Excel modes: covered in Tasks 7 and 8
- Supabase/live mode and realtime behavior: covered in Task 9

No uncovered spec sections remain.

### Placeholder Scan

- No `TBD`
- No `TODO`
- No “implement later”
- Every code-changing step includes concrete code or exact structure
- Every verification step includes explicit commands and expected outcomes

### Type Consistency

- `AppSettings` uses `defaultView`, `rowsPerPage`, `confirmDeletes`, and `staleDealThresholdDays` consistently
- selectors use explicit `tier1` through `tier5` fields consistently
- storage mode naming remains `mock | auto | live`

## Execution Handoff

Plan complete and saved to [docs/superpowers/plans/2026-04-19-gc-ksa-sales-command-center.md](C:\Users\Essmats\Downloads\GC_KSA_React_Supabase_Source\gc-ksa-app\docs\superpowers\plans\2026-04-19-gc-ksa-sales-command-center.md). Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
