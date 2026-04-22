# GC KSA Sales Command Center Design

## Summary

Build a branded React + TypeScript sales operations dashboard for TryGC named `GC KSA Sales Command Center`. The application must support daily operational use by finance and sales teams in the KSA market for Q1 2026, with all monetary values displayed in SAR by default.

The app should keep the existing Vite/TypeScript codebase and current React package baseline, while being restructured for clearer domain boundaries and stronger reuse. The product is an operations workspace first and a dashboard second: dashboard views summarize activity, while Excel views are the main editing surface for day-to-day work.

## Goals

- Deliver a branded TryGC workspace with dark-first styling and light mode support.
- Make every major business page available in both `Dashboard` and `Excel` modes.
- Support inline editing, bulk operations, exports, filtering, and pagination for operational users.
- Keep all configurable preferences in localStorage with versioned defaults and safe migration.
- Support built-in mock mode and optional Supabase live mode without changing the UI contract.
- Centralize business calculations so finance numbers, commissions, targets, and OKRs remain consistent across pages.

## Non-Goals

- No Redux adoption.
- No backend-only admin portal separate from the dashboard.
- No page-specific spreadsheet implementations.
- No dependency downgrade solely to match an earlier React version unless a verified incompatibility appears.

## Product Principles

- The left sidebar and topbar remain dark in both themes.
- Dashboard mode is visual, executive, and navigational.
- Excel mode is the operational source of truth for editing.
- Shared UI and data primitives must be reused across pages.
- Derived metrics are computed in selectors/hooks, not ad hoc inside page components.

## Information Architecture

### Shell

- Fixed sidebar: `220px` expanded, `58px` collapsed.
- Sticky topbar: `52px`.
- Scrollable main content.
- Theme toggle in topbar.
- Sidebar bottom mini-KPIs:
  - `Pipeline`
  - `Closed`

### Navigation

- `Overview`
- `Pipeline`
- `Kanban`
- `Contracts`
- `Revenue`
- `Commissions`
- `Sales Team`
- `Lost Deals`
- `Clients`
- `Goals`
- divider
- `Settings`

## Brand and Design System

### Typography

- Display/body font: `DM Sans`
- Numeric font: `DM Mono`

### Tokens

Implement a centralized token layer that exposes:

- primary TryGC orange values
- purple secondary values
- dark theme backgrounds, borders, and text
- light theme purple-tinted surfaces and text
- semantic success, danger, warning, info, neutral colors
- stage colors for all 9 pipeline stages
- badge variants `badge-o`, `badge-p`, `badge-y`, `badge-r`, `badge-g`

### Mandatory UI Rules

- Every section title uses an orange pipe prefix via a reusable heading component.
- Every KPI card uses a `3px` top border in the relevant accent color.
- Active navigation item uses orange text with orange-tint background.
- Scrollbars stay thin with transparent tracks and branded borders.
- Section entry animation uses `fadeUp 0.35s ease` when animations are enabled.
- Radius system:
  - cards `10px`
  - small cards `8px`
  - buttons `6px`
- Chart grid and bar colors must respect dark/light token variants.

### Sidebar Logo

Render the supplied TryGC SVG logo as a reusable `TryGcLogo` component at the top of the sidebar.

## High-Level Structure

- `src/branding`
  - theme tokens
  - stage colors
  - badge recipes
  - logo component
- `src/context`
  - `SettingsContext`
  - `WorkspaceDataContext`
- `src/lib`
  - seed data
  - settings schema/defaults/migrations
  - selectors
  - formatters
  - Supabase adapter
- `src/components/layout`
  - sidebar
  - topbar
  - shell
- `src/components/primitives`
  - section heading
  - KPI card
  - badges
  - panels
  - alert items
- `src/components/grid`
  - reusable advanced Excel grid
  - toolbar
  - column manager
  - pagination
  - totals row
  - cell renderers/editors
- `src/components/charts`
  - funnel
  - revenue donut
  - target-achieved line
  - leaderboard
  - waterfall
  - progress rings
  - loss charts
- `src/pages`
  - page containers only; each page composes shared blocks and selectors

## State Model

### Settings Context

Owns:

- appearance settings
- data/display settings
- dashboard settings
- pipeline threshold settings
- Excel/grid settings
- notification settings
- advanced mode settings

Persists to localStorage with:

- version number
- migration function
- safe fallback to defaults when parsing fails

### Workspace Data Context

Owns:

- deals
- reps
- monthly targets
- data source mode
- autosave status
- Supabase sync status
- editing actions
- import/export actions

### Selectors Layer

Pure functions and memoized hooks compute:

- pipeline totals
- stage counts and stage values
- overdue exposure
- stale deal counts
- collected vs outstanding
- revenue by rep
- commission tier and payout
- client aggregation
- team ranking
- OKR progress

No page may duplicate these calculations inline when a shared selector is appropriate.

## Data Model

### Core Tables

#### deals

- `id`
- `date`
- `company_name`
- `instagram_account`
- `business_type`
- `contact_person`
- `designation`
- `mobile_number`
- `email`
- `sales_exec_name`
- `status`
- `stage`
- `probability`
- `days_in_stage`
- `priority`
- `quotation_value`
- `contract_ref`
- `invoice_ref`
- `collection_status`
- `collected_amount`
- `contract_date`
- `contract_expiry`
- `contract_status`
- `campaign_months`
- `monthly_value`
- `lost_reason`
- `comments`

#### reps

- `id`
- `name`
- `role`
- `region`
- `salary`
- `monthly_target`
- `secured`
- `leads`
- `meetings`
- `quotes`
- `opps`
- `pending`
- `closed`
- `lost_deals`
- `close_rate`
- `avg_deal`
- `cycle_time`
- `join_date`
- `tier15_threshold`
- `tier15_comm`

The prompt uses `tier15_threshold` and `tier15_comm` as shorthand. Implementation must normalize this into explicit per-tier fields needed by the calculator, for example:

- `tier1_threshold` through `tier5_threshold`
- `tier1_comm` through `tier5_comm`

UI labels may still present these as one grouped commission model, but storage and selectors should use explicit tier fields.

#### monthly_targets

- `id`
- `month`
- `target`
- `achieved`
- `status`

### Derived Data

- client aggregates from deals
- team leaderboard from reps and deals
- commission summaries from reps
- OKR cards from targets, reps, and deals

## Grid Requirements

Build one reusable advanced grid used by every page.

### Interaction

- double-click to edit
- `Enter` confirms
- `Esc` cancels
- `Tab` moves right
- sortable headers with reversible direction
- drag-to-resize columns
- show/hide columns menu
- row selection checkboxes
- bulk delete
- live search across all columns
- pinned totals row
- pagination with `25 / 50 / 100 / 250 / 500`
- row numbers gutter
- zebra striping
- frozen first column

### Column Types

- text
- number
- currency
- percent
- date
- select
- badge
- boolean

### Cell Styling Rules

- SAR positive values highlighted green
- probability:
  - green `>= 75`
  - amber `50-74`
  - red `< 50`
- days in stage red when above stale threshold
- collection status badge styling by semantic state
- stage badge styling by stage palette
- priority styling:
  - high red
  - medium amber
  - low gray
- attainment:
  - green `>= 100`
  - amber `70-99`
  - red `< 70`

### Editing Reliability

The grid must support:

- local in-memory updates
- localStorage persistence
- optional Supabase write-through when enabled
- optional delete confirmation based on settings
- read-only mode for derived tables such as client aggregation when editing is not meaningful

## Page Specifications

### Overview

Dashboard:

- 8 primary KPIs
- 6 secondary KPIs
- pipeline funnel
- orange/purple bar chart
- target vs achieved line chart
- revenue donut
- team leaderboard with progress bars
- alerts panel for overdue, stale, no-contract, and tier warnings

Excel:

- toggle between all deals view and team stats view

### Pipeline

Dashboard:

- clickable stage tiles
- stage bar chart
- preview table
- search and filters

Excel:

- full deals editing surface with stage, probability, value, priority, and collection controls

### Kanban

Dashboard:

- 9 stage columns with deal cards
- live count and value summaries per stage

Excel:

- deal grid with editable stage dropdown for movement

### Contracts

Dashboard:

- closed
- collected
- outstanding
- overdue
- collection status breakdown
- overdue alerts

Excel:

- contract and invoice tracking fields editable

### Revenue

Dashboard:

- waterfall from pipeline to closed to collected
- monthly P&L line
- revenue by rep table
- expenses section

Excel:

- financial deal rows with editable monetary fields

### Commissions

Dashboard:

- total commission pool
- tier calculator by rep
- commission-by-rep chart
- tier reference table

Excel:

- editable secured values
- auto-calculated tier and commission

### Sales Team

Dashboard:

- rep scorecards
- attainment bars
- activity metrics
- ranking table

Excel:

- full rep editing surface

### Lost Deals

Dashboard:

- loss reason breakdown
- recoverable deals flag
- rep loss analysis
- recovery action tags

Excel:

- lost reason, comments, and recovery status editable

### Clients

Dashboard:

- company directory sorted by portfolio value
- grid/table toggle
- deal count per company
- won vs active state

Excel:

- read-optimized aggregated client table

### Goals and OKRs

Dashboard:

- 10 auto-calculated OKRs
- progress rings
- category donut

Excel:

- goal targets and progress tracking

### Settings

Build 7 sections with 35+ options:

- Appearance
- Data and Display
- Dashboard
- Pipeline
- Excel View
- Notifications
- Advanced

Each setting must persist in localStorage and immediately affect the relevant UI where possible.

## Settings Schema

### Appearance

- theme: dark / light / system
- accent palette
- border radius mode
- glassmorphism toggle
- animations toggle
- sidebar mode

### Data and Display

- currency
- currency code toggle
- compact numbers toggle
- number format
- date format
- default global view
- table density

### Dashboard

- default landing page
- show alerts panel
- show leaderboard
- leaderboard size
- auto-refresh enabled
- auto-refresh interval

### Pipeline

- stale deal threshold
- low probability threshold
- high value threshold
- alert threshold

### Excel View

- freeze first column
- row numbers
- zebra rows
- totals row
- rows per page

### Notifications

- overdue collections
- stale deals
- new deal added
- tier change

### Advanced

- data source mode
- Supabase URL
- Supabase anon key
- autosave
- confirm deletes
- reset settings
- clear localStorage
- raw config JSON viewer

## Data Source Behavior

### Mock Mode

- uses bundled seed data
- fully editable
- persisted locally

### Supabase Mode

- tables:
  - `deals`
  - `reps`
  - `monthly_targets`
- views:
  - `pipeline_summary`
  - `rep_performance`
- supports anon read for demo and authenticated flows for live use
- optional realtime subscriptions over WebSocket

### Sync Contract

- UI shape must not depend on storage mode
- adapters convert persisted rows to the same internal domain types
- sync failures must surface as non-blocking status messages, not hard app crashes

## Charts and KPI Rules

- Recharts is the charting layer
- shared chart wrappers enforce brand colors and grid styling
- all currency charts use SAR formatting from one formatter layer
- all number formatting honors settings for compact values and locale

## Accessibility and Daily-Use Expectations

- keyboard access for grid editing, pagination, filters, and view toggles
- high-contrast readable text in both modes
- no hidden destructive actions
- finance-critical values never rely on color alone
- large tables must remain usable in normal laptop viewports

## Testing Strategy

- selector/unit tests for:
  - commission tier logic
  - KPI aggregation
  - OKR calculations
  - pipeline thresholds
  - client aggregation
- component tests for:
  - grid editing behavior
  - view toggle persistence
  - settings persistence
- integration tests for:
  - data mode switching
  - export behavior
  - basic page rendering with mock data

## Build and Packaging Notes

- Keep the current Vite-based development workflow.
- Keep TypeScript strictness aligned with the repo.
- Preserve optional Supabase support.
- If single-file bundle output is still required, add it as a build target after the architecture cleanup rather than rewriting the dev stack first.

## Risks and Mitigations

- Grid complexity can expand quickly:
  - mitigate by building one reusable grid engine and type-safe column config
- Settings sprawl can become inconsistent:
  - mitigate with a versioned settings schema and grouped defaults
- Finance numbers can drift across pages:
  - mitigate with centralized selectors and formatters
- Supabase mode can introduce brittle UI coupling:
  - mitigate with adapters and shared domain models

## Implementation Sequence

1. Establish brand tokens, fonts, shell, and shared primitives.
2. Expand settings schema and localStorage persistence.
3. Rebuild the advanced reusable grid.
4. Centralize selectors and finance/sales calculations.
5. Rebuild pages using shared dashboard blocks.
6. Add Supabase/live sync refinements and realtime hooks.
7. Add focused tests for calculations, grid behavior, and settings persistence.

## Open Execution Constraints

- The workspace is not currently a Git repository, so the design document cannot be committed unless version control is initialized or the repo context changes.
