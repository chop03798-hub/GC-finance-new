# GC KSA CRM — Zoho-Style Upscale with TryGC Brand
**Date:** 2026-04-19  
**Status:** Approved for implementation

---

## Goal
Transform the current dark-purple CRM into a Zoho CRM-grade enterprise interface using the official TryGC brand system (from Brand Manual V2 2025), while keeping all existing data flows, routing, and Supabase integration intact.

---

## Brand Token System

### Fonts (replace DM Sans/DM Mono)
| Role | Font |
|------|------|
| Display / headings | Barlow Condensed (500–900) |
| Body / UI | Mulish (300–900) |
| Mono / numbers | JetBrains Mono (500–700) |

Google Fonts import added to `index.css`.

### Colors
| Token | Value | Use |
|-------|-------|-----|
| `--gc-purple` | `#52358C` | Primary brand, nav active, buttons |
| `--gc-orange` | `#E8630C` | Accent, CTAs, highlights |
| `--gc-lavender` | `#A798BF` | Secondary accent |
| `--gc-peach` | `#E3A579` | Warm accent |
| `--gc-purple-soft` | `#EEEAF4` | Hover states, badges, tag backgrounds |
| `--gc-orange-soft` | `#FDF2E9` | Orange badge backgrounds |
| `--ink-900` | `#1A1220` | Primary text |
| `--ink-700` | `#433651` | Secondary text |
| `--ink-500` | `#6B5E78` | Tertiary / placeholder |
| `--ink-300` | `#A89FB0` | Disabled / muted |
| `--ink-100` | `#E8E3EC` | Dividers |
| `--bg` | `#FBFAFC` | Page background |
| `--white` | `#FFFFFF` | Card / panel background |
| `--border` | `#EEE9F1` | Default border |
| `--border-strong` | `#DCD4E2` | Emphasized border |

### Shadows
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(82,53,140,0.06)` |
| `--shadow` | `0 4px 20px rgba(82,53,140,0.08)` |
| `--shadow-lg` | `0 16px 48px rgba(82,53,140,0.12)` |

### Radii
`--r-sm: 8px` · `--r: 14px` · `--r-lg: 20px` · `--r-xl: 28px`

### Dark theme
Remap existing dark palette to TryGC-compatible dark:
- bg `#0D0818`, card `#160D2C`, borders `#281A50`, text `#F0EBFF` / `#C4ADE8`

---

## Architecture — What Changes, What Stays

### Stays unchanged
- All page files (`Overview`, `Pipeline`, `Kanban`, etc.) — data/logic only
- `WorkspaceDataContext` — all state, Supabase, auth
- `SettingsContext` — all settings including theme toggle
- `EditableDataGrid` — structure kept, styles updated via CSS tokens

### Changes

#### 1. `tokens.ts` — full brand token replacement
- Replace `TRY_GC_THEME` with the TryGC V2 brand palette above
- `ROOT_THEME_CSS_VARIABLES` → light theme vars (bg, card, text, border)
- `LIGHT_THEME_CSS_VARIABLES` → same (light is now the primary theme)
- Dark theme remapped to `[data-theme='dark']` block
- Add font CSS variables: `--font-display`, `--font-body`, `--font-mono`

#### 2. `index.css` — font import + base resets
- Add Google Fonts import for Mulish, Barlow Condensed, JetBrains Mono
- Update `body` to use `--font-body`
- Update `--font-display` / `--font-mono` references

#### 3. `App.css` — full visual restyle
All existing class names kept (no renames), but visual properties updated:
- **Sidebar**: white bg, `1px solid var(--border)` right border, nav items as Zoho-style pill with purple active state + orange left indicator strip
- **Topbar**: white bg, `box-shadow: var(--shadow-sm)`, search bar centered, action buttons right-aligned
- **Cards**: white bg, `border: 1px solid var(--border)`, `border-radius: var(--r-lg)`, `box-shadow: var(--shadow-sm)`
- **KPI boxes**: top color strip, stat value in Barlow Condensed
- **Buttons**: primary = purple gradient, ghost = white + purple border, danger = red soft
- **Tables**: alternating row tint, sticky header with purple bottom border, row hover = purple-soft bg
- **Badges**: pill shape, color-coded per status
- **Forms / fields**: white bg, purple focus ring

#### 4. `App.tsx` — Zoho sidebar rail + topbar upgrade
**Sidebar:**
- Icon + label layout (existing behavior kept)
- Active nav item: `background: var(--gc-purple-soft)`, left orange strip `3px`, text color purple
- Sidebar logo: TryGC SVG mark + "GC Workspace" wordmark in Barlow Condensed
- Bottom footer: user avatar circle, name, role chip, logout link

**Topbar:**
- Left: hamburger toggle
- Center: `<SearchBar />` component (triggers `SearchPalette` on focus)
- Right: New Deal quick-add button · Notifications bell (badge) · Theme toggle · User avatar dropdown

#### 5. New: `components/SearchPalette.tsx`
- `Ctrl+K` / `Cmd+K` keyboard shortcut opens modal overlay
- Input filters deals, reps, clients in real-time (client-side, from context)
- Results grouped: **Deals** · **Reps** · **Clients**
- Click result: navigates to relevant page + opens `RecordPanel` for that row
- `Escape` closes

#### 6. New: `components/RecordPanel.tsx`
- Slide-in drawer from right, 480px wide, full viewport height
- Opens when user clicks any row in `EditableDataGrid` or a search result
- Sections:
  - **Header**: company/rep name, stage badge, close button
  - **Details**: all record fields in 2-col Zoho-style label+value grid, editable inline
  - **Activity Feed**: scrollable timeline (see below)
- Save edits via existing `onUpdateRow` prop passed down through context
- Closes on Escape or backdrop click

#### 7. New: `components/ActivityFeed.tsx`
- Rendered inside `RecordPanel`
- Timeline list: date · icon · description
- Initial activity entries seeded from record data (created date, stage, value)
- "Add Note" text input at bottom — appends to local state (per-session, no persistence yet)
- Entry types: `created` · `stage_change` · `note` · `value_change`

#### 8. New: `components/FunnelChart.tsx`
- SVG trapezoid funnel, one segment per pipeline stage
- Width of each segment = proportional to deal value at that stage
- Color per stage from existing `STAGE_COLORS` map → remapped to TryGC palette
- Hover tooltip: stage name, count, total value, avg days
- Click segment: emits `onStageFilter(stage)` callback
- Used in `Pipeline` dashboard view, replaces the existing bar-list chart

#### 9. New: `components/NotificationBell.tsx`
- Bell icon in topbar with red count badge
- Dropdown panel on click: list of system alerts (stale deals >14 days, overdue collections, critical-risk items)
- Derived from existing deal data — no new data model needed
- "Mark all read" clears the badge (session-only)

#### 10. `components/PageWorkspace.tsx` — row click → RecordPanel
- Add `onRowClick` handler that opens `RecordPanel` with the clicked row
- `RecordPanel` state (`open`, `record`) lives here
- Pass `onUpdateRow` into `RecordPanel` for inline saves

---

## New Component File List
```
src/components/SearchPalette.tsx
src/components/RecordPanel.tsx
src/components/ActivityFeed.tsx
src/components/FunnelChart.tsx
src/components/NotificationBell.tsx
```

---

## CSS Class Strategy
No class renames. All existing class names (`.card`, `.btn`, `.tbl`, `.sidebar`, etc.) keep their names — only their visual property values change. This prevents any JSX edits outside the files listed above.

---

## Theme Behavior
- Default theme: **light** (TryGC brand light palette)
- Dark theme: remapped to purple-dominant dark (existing feel, just TryGC-corrected colors)
- Theme toggle in topbar still works; `data-theme='dark'` attribute still controls it

---

## Out of Scope (this iteration)
- Server-side activity persistence (activities are session-local)
- Notification persistence / read state across sessions
- Funnel chart animation
- Mobile responsive overhaul
- New pages or data models
