# GC KSA CRM — Zoho-Style Upscale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the GC KSA CRM into a Zoho CRM-grade interface using TryGC Brand Manual V2 tokens, adding global search (Cmd+K), a record detail side panel, a pipeline funnel chart, an activity feed, and a notification bell — without breaking any existing data flows.

**Architecture:** Brand tokens in `tokens.ts` are replaced with the TryGC V2 light-first palette; `App.css` is fully restyled using those tokens with all class names kept intact; five new self-contained components are created and wired into `App.tsx`, `PageWorkspace.tsx`, and `Pipeline.tsx`.

**Tech Stack:** React 18, TypeScript, Vite, CSS custom properties, inline SVG (FunnelChart), existing Supabase/context layer — zero new npm dependencies.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/branding/tokens.ts` | Replace palette with TryGC V2, flip to light-first |
| Modify | `src/index.css` | Import Mulish / Barlow Condensed / JetBrains Mono |
| Modify | `src/lib/workspace.ts` | Change default theme from `'dark'` to `'light'` |
| Modify | `src/App.css` | Full visual restyle — all class names kept, properties updated + new component classes added |
| Create | `src/components/SearchPalette.tsx` | Cmd+K command palette, searches deals + reps |
| Create | `src/components/ActivityFeed.tsx` | Timeline log + add-note input for a record |
| Create | `src/components/RecordPanel.tsx` | Slide-in record detail drawer, embeds ActivityFeed |
| Create | `src/components/FunnelChart.tsx` | SVG trapezoid funnel for pipeline stages |
| Create | `src/components/NotificationBell.tsx` | Bell icon, badge count, alert dropdown |
| Modify | `src/App.tsx` | Zoho sidebar rail, topbar with search/notifications, Cmd+K listener |
| Modify | `src/components/PageWorkspace.tsx` | Row-click opens RecordPanel |
| Modify | `src/pages/Pipeline.tsx` | Add FunnelChart to dashboard view |

---

## Task 1 — Replace brand tokens (`tokens.ts`)

**Files:**
- Modify: `src/branding/tokens.ts`

- [ ] **Step 1: Replace the entire file with the TryGC V2 palette, light-first**

```typescript
// src/branding/tokens.ts
const TRY_GC_THEME_STYLE_ID = 'trygc-theme-vars'

export const TRY_GC_THEME = {
  brand: {
    orange: '#E8630C',
    orangeSoft: '#FDF2E9',
    orangeMid: 'rgba(232,99,12,0.08)',
    purple: '#52358C',
    purpleMid: '#7255B5',
    purpleLight: '#A798BF',
    purpleSoft: '#EEEAF4',
    purpleMidAlpha: 'rgba(82,53,140,0.12)',
    peach: '#E3A579',
    peachSoft: '#FCF1E9',
    lavenderSoft: '#F3EFF8',
  },
  light: {
    bg: '#FBFAFC',
    card: '#FFFFFF',
    row: '#F3EFF8',
    deep: '#EEEAF4',
    border: '#EEE9F1',
    border2: '#DCD4E2',
    nav: '#FFFFFF',
    text1: '#1A1220',
    text2: '#433651',
    text3: '#6B5E78',
    text4: '#A89FB0',
    navActiveBg: '#EEEAF4',
    navActiveColor: '#52358C',
    rowHover: '#EEEAF4',
    tblHeadBg: '#FBFAFC',
  },
  dark: {
    bg: '#0D0818',
    card: '#160D2C',
    row: '#1C1035',
    deep: '#251545',
    border: '#2D1A55',
    border2: '#3D2470',
    nav: '#0A0520',
    text1: '#F0EBFF',
    text2: '#C4ADE8',
    text3: '#9B87C4',
    text4: '#6B5A8E',
    navActiveBg: 'rgba(82,53,140,0.25)',
    navActiveColor: '#C4ADE8',
    rowHover: 'rgba(82,53,140,0.14)',
    tblHeadBg: 'rgba(255,255,255,0.02)',
  },
  feedback: {
    info: '#3B82F6',
    success: '#22C55E',
    warning: '#CA8A04',
    danger: '#EF4444',
    cyan: '#7dd3fc',
  },
} as const

type CssVariableMap = Record<`--${string}`, string>

const WHITE_HSL = '0 0% 100%'

function hexToRgb(hex: string) {
  const n = hex.replace('#', '')
  const p = n.length === 3 ? n.split('').map(c => c + c).join('') : n
  const v = Number.parseInt(p, 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

function hexToHslChannels(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const rd = r / 255, gd = g / 255, bd = b / 255
  const max = Math.max(rd, gd, bd), min = Math.min(rd, gd, bd)
  const delta = max - min
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (delta !== 0) {
    if (max === rd) h = ((gd - bd) / delta) % 6
    else if (max === gd) h = (bd - rd) / delta + 2
    else h = (rd - gd) / delta + 4
  }
  return `${Math.round((h * 60 + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function serializeCssVariableMap(variables: CssVariableMap) {
  return Object.entries(variables).map(([name, value]) => `${name}:${value};`).join('')
}

function applyCssVariableMap(style: CSSStyleDeclaration, variables: CssVariableMap) {
  for (const [name, value] of Object.entries(variables)) {
    style.setProperty(name, value)
  }
}

function makeThemeVars(palette: typeof TRY_GC_THEME.light): CssVariableMap {
  return {
    '--bg': palette.bg,
    '--card': palette.card,
    '--c2': palette.row,
    '--c3': palette.deep,
    '--bd': palette.border,
    '--bdl': palette.border2,
    '--nav': palette.nav,
    '--t': palette.text1,
    '--t2': palette.text2,
    '--t3': palette.text3,
    '--tm': palette.text4,
    '--nav-active-bg': palette.navActiveBg,
    '--nav-active-color': palette.navActiveColor,
    '--row-hover': palette.rowHover,
    '--tbl-head-bg': palette.tblHeadBg,
    '--background': hexToHslChannels(palette.bg),
    '--foreground': hexToHslChannels(palette.text1),
    '--card-foreground': hexToHslChannels(palette.text1),
    '--popover': hexToHslChannels(palette.bg),
    '--popover-foreground': hexToHslChannels(palette.text1),
    '--secondary': hexToHslChannels(palette.deep),
    '--secondary-foreground': hexToHslChannels(palette.text1),
    '--muted': hexToHslChannels(palette.row),
    '--muted-foreground': hexToHslChannels(palette.text2),
    '--input': hexToHslChannels(palette.border),
  }
}

export const ROOT_THEME_CSS_VARIABLES: CssVariableMap = {
  // Brand (same in both themes)
  '--o': TRY_GC_THEME.brand.orange,
  '--o-soft': TRY_GC_THEME.brand.orangeSoft,
  '--o-mid': TRY_GC_THEME.brand.orangeMid,
  '--p': TRY_GC_THEME.brand.purple,
  '--pm': TRY_GC_THEME.brand.purpleMid,
  '--pl': TRY_GC_THEME.brand.purpleLight,
  '--p-soft': TRY_GC_THEME.brand.purpleSoft,
  '--p-mid': TRY_GC_THEME.brand.purpleMidAlpha,
  '--peach': TRY_GC_THEME.brand.peach,
  '--blue': TRY_GC_THEME.feedback.info,
  '--green': TRY_GC_THEME.feedback.success,
  '--amber': TRY_GC_THEME.feedback.warning,
  '--red': TRY_GC_THEME.feedback.danger,
  '--cyan': TRY_GC_THEME.feedback.cyan,
  '--primary': hexToHslChannels(TRY_GC_THEME.brand.purple),
  '--primary-foreground': WHITE_HSL,
  '--destructive': hexToHslChannels(TRY_GC_THEME.feedback.danger),
  '--destructive-foreground': WHITE_HSL,
  '--ring': hexToHslChannels(TRY_GC_THEME.brand.purple),
  '--accent-foreground': WHITE_HSL,
  // Light palette as root default
  ...makeThemeVars(TRY_GC_THEME.light),
}

export const DARK_THEME_CSS_VARIABLES: CssVariableMap = makeThemeVars(TRY_GC_THEME.dark)

export function installTryGcThemeVariables(doc: Document = document) {
  const rootRule = `:root{color-scheme:light;${serializeCssVariableMap(ROOT_THEME_CSS_VARIABLES)}}`
  const darkRule = `[data-theme='dark']{color-scheme:dark;${serializeCssVariableMap(DARK_THEME_CSS_VARIABLES)}}`

  let styleTag = doc.getElementById(TRY_GC_THEME_STYLE_ID) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = doc.createElement('style')
    styleTag.id = TRY_GC_THEME_STYLE_ID
    doc.head.appendChild(styleTag)
  }
  styleTag.textContent = rootRule + darkRule
}

// Keep for backwards compat (unused internally)
export const LIGHT_THEME_CSS_VARIABLES = makeThemeVars(TRY_GC_THEME.light)

export const STAGE_COLOR_MAP = {
  'Leads & Calls': TRY_GC_THEME.brand.purpleLight,
  'Meeting': TRY_GC_THEME.brand.purpleMid,
  'Quotations': '#F59E0B',
  'Opportunities': TRY_GC_THEME.feedback.info,
  'Plans': TRY_GC_THEME.brand.orange,
  'Pending for closure': '#EA580C',
  'Closed – With Contract': TRY_GC_THEME.feedback.success,
  'Closed – No Contract': TRY_GC_THEME.feedback.warning,
  'Lost': TRY_GC_THEME.feedback.danger,
} as const

export type StageName = keyof typeof STAGE_COLOR_MAP
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "C:/Users/Essmats/Downloads/GC_KSA_React_Supabase_Source/gc-ksa-app"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `tokens.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/branding/tokens.ts
git commit -m "feat: replace brand tokens with TryGC V2 palette, light-first"
```

---

## Task 2 — Update font imports (`index.css`)

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the entire file**

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius-card: 14px;
    --radius-small: 8px;
    --radius-button: 8px;
    --radius-xl: 20px;
    --font-display: 'Barlow Condensed', 'Mulish', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --font-body: 'Mulish', sans-serif;

    --bg2: var(--card);
    --bg3: var(--c2);
    --text1: var(--t);
    --text2: var(--t2);
    --text3: var(--t3);
    --accent: var(--o);
    --accent2: color-mix(in srgb, var(--o) 78%, white);
    --green-bg: color-mix(in srgb, var(--green) 12%, transparent);
    --amber-bg: color-mix(in srgb, var(--amber) 14%, transparent);
    --red-bg: color-mix(in srgb, var(--red) 14%, transparent);
    --violet: var(--p);
    --orange: var(--o);
    --border: var(--bd);
    --border2: var(--bdl);
    --shadow: 0 16px 48px rgba(82,53,140,0.12);
    --shadow-sm: 0 1px 3px rgba(82,53,140,0.06);
    --shadow-md: 0 4px 20px rgba(82,53,140,0.08);
    --sidebar-w: 240px;
    --topbar-h: 56px;
    --font: var(--font-body);
    --mono: var(--font-mono);
    --display: var(--font-display);
    --radius: var(--radius-small);
  }

  * { @apply border-border; }

  html { scrollbar-color: var(--bdl) transparent; scrollbar-width: thin; }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bdl); border-radius: 999px; }
}
```

- [ ] **Step 2: Verify dev server still starts**

```bash
npm run dev -- --port 5173
```

Expected: Vite starts, no CSS parse errors in console.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: import TryGC V2 brand fonts (Mulish, Barlow Condensed, JetBrains Mono)"
```

---

## Task 3 — Change default theme to light (`workspace.ts`)

**Files:**
- Modify: `src/lib/workspace.ts` line 98

- [ ] **Step 1: Change `theme: 'dark'` to `theme: 'light'` in `DEFAULT_SETTINGS`**

Find this line in `src/lib/workspace.ts`:
```typescript
  theme: 'dark',
```
Change to:
```typescript
  theme: 'light',
```

- [ ] **Step 2: Clear stored settings so the new default takes effect**

The app reads from localStorage. Returning users will keep their stored theme. New / cleared sessions will default to light. This is the correct behavior — no further action needed.

- [ ] **Step 3: Commit**

```bash
git add src/lib/workspace.ts
git commit -m "feat: default theme changed to light"
```

---

## Task 4 — Full visual restyle (`App.css`)

**Files:**
- Modify: `src/App.css` (complete replacement)

- [ ] **Step 1: Replace the entire file with the TryGC-branded stylesheet**

```css
/* src/App.css */
/* ── RESET ──────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body { font-family: var(--font-body); background: var(--bg); color: var(--t); font-size: 14px; line-height: 1.5; }
button { font-family: var(--font-body); cursor: pointer; border: none; outline: none; }
input, select, textarea { font-family: var(--font-body); outline: none; }

/* ── LAYOUT ─────────────────────────────────────────────────────────────── */
.app-shell {
  display: grid; height: 100vh; width: 100vw; overflow: hidden;
  grid-template-areas: "sidebar topbar" "sidebar main";
  grid-template-rows: var(--topbar-h) 1fr;
  transition: grid-template-columns .22s ease;
}
.sidebar-open  { grid-template-columns: var(--sidebar-w) 1fr; }
.sidebar-closed { grid-template-columns: 64px 1fr; }

/* ── SIDEBAR ────────────────────────────────────────────────────────────── */
.sidebar {
  grid-area: sidebar;
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden; z-index: 10;
  box-shadow: 2px 0 8px rgba(82,53,140,0.04);
}
.sidebar-logo {
  display: flex; align-items: center; gap: 10px; padding: 0 14px;
  border-bottom: 1px solid var(--border); min-height: var(--topbar-h); flex-shrink: 0;
}
.logo-mark {
  width: 32px; height: 32px; flex-shrink: 0;
}
.logo-title {
  font-family: var(--font-display); font-weight: 800; font-size: 15px;
  color: var(--t); display: block; line-height: 1.2; letter-spacing: 0.5px;
}
.logo-sub { font-size: 10px; color: var(--t3); letter-spacing: 0.8px; }

.sidebar-nav { flex: 1; padding: 8px 0; overflow-y: auto; overflow-x: hidden; }
.nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px;
  background: none; color: var(--t3); font-size: 13px; font-weight: 500;
  position: relative; transition: all .15s; border-radius: 0; text-align: left;
  white-space: nowrap; font-family: var(--font-body);
}
.nav-item:hover { background: var(--nav-active-bg); color: var(--p); }
.nav-item.active {
  background: var(--nav-active-bg); color: var(--nav-active-color); font-weight: 600;
}
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 60%; background: var(--o);
  border-radius: 0 2px 2px 0;
}
.nav-icon { width: 22px; text-align: center; flex-shrink: 0; font-size: 14px; }
.nav-label { flex: 1; }
.nav-indicator { display: none; }

.sidebar-footer {
  padding: 12px 14px; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 8px;
}
.sidebar-user {
  display: flex; align-items: center; gap: 10px;
}
.sidebar-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--p), var(--pm));
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.sidebar-user-info { flex: 1; min-width: 0; }
.sidebar-user-name { font-size: 12px; font-weight: 600; color: var(--t); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: 10px; color: var(--t3); }
.sidebar-logout {
  font-size: 11px; color: var(--t3); background: none; border: none; cursor: pointer; padding: 0;
  text-align: left; font-family: var(--font-body);
}
.sidebar-logout:hover { color: var(--red); }
.mini-kpi { display: flex; justify-content: space-between; font-size: 11px; color: var(--t3); }
.mini-kpi .accent { color: var(--p); font-weight: 600; font-family: var(--mono); }
.mini-kpi .green  { color: var(--green); font-weight: 600; font-family: var(--mono); }

/* ── TOPBAR ─────────────────────────────────────────────────────────────── */
.topbar {
  grid-area: topbar; background: var(--card); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px; padding: 0 16px; z-index: 9;
  box-shadow: var(--shadow-sm);
}
.topbar-toggle {
  background: none; color: var(--t3); font-size: 11px; padding: 6px 8px;
  border-radius: var(--radius-button); transition: all .15s; flex-shrink: 0;
}
.topbar-toggle:hover { background: var(--nav-active-bg); color: var(--p); }

.topbar-search {
  flex: 1; max-width: 420px;
  display: flex; align-items: center; gap: 8px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-button); padding: 6px 12px;
  cursor: pointer; transition: border-color .15s;
}
.topbar-search:hover { border-color: var(--bdl); }
.topbar-search-icon { font-size: 13px; color: var(--t3); }
.topbar-search-placeholder { font-size: 13px; color: var(--t3); flex: 1; }
.topbar-search-kbd {
  font-family: var(--mono); font-size: 10px; color: var(--t3);
  background: var(--c2); border: 1px solid var(--border); border-radius: 4px;
  padding: 1px 5px;
}

.topbar-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.btn-icon {
  background: var(--bg); border: 1px solid var(--border); color: var(--p);
  width: 34px; height: 34px; border-radius: var(--radius-button); font-size: 14px;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
  position: relative;
}
.btn-icon:hover { border-color: var(--p); background: var(--nav-active-bg); }

.topbar-badge {
  display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--green);
  background: color-mix(in srgb, var(--green) 10%, transparent);
  padding: 4px 10px; border-radius: 99px;
  border: 1px solid color-mix(in srgb, var(--green) 22%, transparent); font-weight: 600;
}
.topbar-badge-neutral { color: var(--t2); background: var(--bg); border-color: var(--border); }
.badge-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.topbar-user {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--p), var(--pm));
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; cursor: pointer;
  border: 2px solid var(--p-soft);
}

.topbar-breadcrumb { display: flex; align-items: center; gap: 6px; }
.topbar-brand { font-size: 12px; color: var(--t3); }
.topbar-divider { color: var(--t3); font-size: 12px; }
.topbar-page { font-weight: 700; font-size: 13px; color: var(--t); font-family: var(--font-display); }
.topbar-bot { min-width: 132px; }

/* ── MAIN ───────────────────────────────────────────────────────────────── */
.main-content {
  grid-area: main; overflow-y: auto; padding: 20px 22px; background: var(--bg);
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}

/* ── PAGE COMPONENTS ────────────────────────────────────────────────────── */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
.page-title {
  font-family: var(--font-display); font-size: 26px; font-weight: 800;
  color: var(--t); line-height: 1; letter-spacing: -0.3px;
}
.page-sub { font-size: 12px; color: var(--t3); margin-top: 4px; }
.page-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.section-heading {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
}
.section-heading-copy { display: flex; flex-direction: column; gap: 4px; }
.section-heading-title {
  font-family: var(--font-display); font-size: 16px; font-weight: 800;
  color: var(--t); letter-spacing: 0.04em; text-transform: uppercase;
}
.section-heading-subtitle { font-size: 12px; color: var(--t3); }

/* ── CARDS ──────────────────────────────────────────────────────────────── */
.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-card); padding: 18px 20px;
  box-shadow: var(--shadow-sm);
}
.card-hover:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); transition: all .15s; }

/* ── KPI GRID ───────────────────────────────────────────────────────────── */
.kpi-grid { display: grid; gap: 12px; }
.kpi-grid-4 { grid-template-columns: repeat(4,1fr); }
.kpi-grid-3 { grid-template-columns: repeat(3,1fr); }
.kpi-grid-2 { grid-template-columns: repeat(2,1fr); }

.kpi-box {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-card); padding: 16px 18px;
  position: relative; overflow: hidden; box-shadow: var(--shadow-sm);
}
.kpi-box::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: var(--kpi-color, var(--p));
}
.kpi-label {
  font-size: 10px; color: var(--t3); font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px;
  font-family: var(--font-display);
}
.kpi-value {
  font-family: var(--font-display); font-size: 24px; font-weight: 800;
  color: var(--p); line-height: 1.1;
}
.kpi-sub { font-size: 11px; color: var(--t3); margin-top: 4px; }
.kpi-icon { position: absolute; top: 14px; right: 16px; font-size: 18px; opacity: .45; }

.kpi-card {
  --kpi-accent: var(--p);
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-card); padding: 16px; box-shadow: var(--shadow-sm);
  position: relative; overflow: hidden;
}
.kpi-card::before {
  content: ''; position: absolute; inset: 0 auto auto 0;
  width: 100%; height: 3px; background: var(--kpi-accent);
}
.kpi-card-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.kpi-card-label {
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--t3);
}
.kpi-card-icon { color: var(--kpi-accent); opacity: .8; }
.kpi-card-value {
  margin-top: 10px; font-family: var(--font-display); font-size: 22px;
  line-height: 1.1; color: var(--p); font-weight: 800;
}
.kpi-card-sublabel { margin-top: 6px; font-size: 12px; color: var(--t2); }

/* ── STATUS BADGE ───────────────────────────────────────────────────────── */
.status-badge {
  border-radius: 999px;
  border-color: color-mix(in srgb, var(--status-accent, var(--p)) 30%, transparent);
  background: color-mix(in srgb, var(--status-accent, var(--p)) 10%, transparent);
  color: var(--status-accent, var(--p));
  font-size: 10px; letter-spacing: .04em; text-transform: uppercase;
}

/* ── VIEW TOGGLE ────────────────────────────────────────────────────────── */
.view-toggle {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  padding: 3px; background: var(--bg);
}
.view-toggle-item { border-radius: 6px; color: var(--t2); }
.view-toggle-item[data-state='on'] { background: var(--p); color: #fff; }

/* ── TABLES ─────────────────────────────────────────────────────────────── */
.tbl-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--border); }
.tbl { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.tbl th {
  background: var(--tbl-head-bg); color: var(--t3); font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em; font-size: 10px; padding: 10px 14px;
  text-align: left; border-bottom: 2px solid var(--border); white-space: nowrap;
  cursor: pointer; user-select: none; font-family: var(--font-display);
}
.tbl th:hover { color: var(--p); }
.tbl td {
  padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--t); vertical-align: middle;
}
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: var(--row-hover); }
.tbl .mono { font-family: var(--mono); }

/* ── BADGES ─────────────────────────────────────────────────────────────── */
.badge {
  display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 99px;
  font-size: 10px; font-weight: 700; white-space: nowrap; font-family: var(--font-display);
  letter-spacing: 0.04em;
}

/* ── BUTTONS ────────────────────────────────────────────────────────────── */
.btn {
  padding: 7px 16px; border-radius: var(--radius-button); font-size: 13px;
  font-weight: 700; transition: all .15s; border: 1.5px solid transparent;
  font-family: var(--font-display); letter-spacing: 0.3px;
}
.btn-primary {
  background: linear-gradient(135deg, var(--p), var(--pm)); color: #fff;
  border-color: transparent;
}
.btn-primary:hover { background: var(--pm); }
.btn-ghost {
  background: transparent; color: var(--p); border-color: var(--bdl);
}
.btn-ghost:hover { border-color: var(--p); background: var(--p-soft); }
.btn-danger {
  background: color-mix(in srgb, var(--red) 8%, transparent);
  color: var(--red); border-color: color-mix(in srgb, var(--red) 24%, transparent);
}
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-xs { padding: 3px 8px; font-size: 11px; min-height: 28px; }

/* ── FORM ───────────────────────────────────────────────────────────────── */
.field {
  background: var(--bg); border: 1.5px solid var(--bdl);
  border-radius: var(--radius-small); color: var(--t); padding: 7px 11px;
  font-size: 13px; width: 100%; transition: border-color .15s;
  font-family: var(--font-body);
}
.field:focus {
  border-color: var(--p);
  box-shadow: 0 0 0 3px rgba(82,53,140,0.10);
}
.field option { background: var(--card); }

/* ── SECTION HEADER ─────────────────────────────────────────────────────── */
.section-title {
  font-family: var(--font-display); font-size: 11px; font-weight: 800;
  color: var(--p); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px;
  display: inline-flex; align-items: center; gap: 8px;
}
.section-title::before {
  content: ''; width: 20px; height: 2px; background: currentColor; display: inline-block;
}

/* ── PROGRESS ───────────────────────────────────────────────────────────── */
.progress-bar { height: 5px; background: var(--c2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width .5s ease; }

/* ── SCROLLBAR ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bdl); border-radius: 99px; }

/* ── WORKSPACE ──────────────────────────────────────────────────────────── */
.workspace-toolbar {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; flex-wrap: wrap; position: relative; z-index: 12; overflow: visible;
}
.workspace-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

.data-grid-shell {
  overflow: auto; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--card); position: relative; z-index: 1;
}
.spreadsheet-table { min-width: 1180px; }
.spreadsheet-table.compact td, .spreadsheet-table.compact th { padding-top: 6px; padding-bottom: 6px; }
.spreadsheet-table.wrap-cells td { white-space: normal; }
.spreadsheet-table td { min-width: 110px; }

.grid-input {
  min-height: 34px; background: transparent; border-color: transparent; padding: 6px 8px;
}
.grid-input:hover { border-color: var(--bdl); }
.grid-input:focus { background: var(--c2); border-color: var(--p); }

.sticky-head th { position: sticky; top: 0; z-index: 2; }

.grid-secondary-toolbar {
  display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
  flex-wrap: wrap; padding: 10px 14px; position: relative; z-index: 20; overflow: visible;
}
.column-menu { position: relative; }
.column-menu-trigger { min-width: 170px; justify-content: space-between; }
.column-menu-panel {
  position: absolute; top: calc(100% + 8px); left: 0; width: min(320px, 80vw);
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-card);
  box-shadow: var(--shadow); padding: 12px; display: flex; flex-direction: column;
  gap: 10px; z-index: 50;
}
.grid-row-actions { display: flex; gap: 6px; flex-wrap: wrap; }

/* ── SETTINGS ───────────────────────────────────────────────────────────── */
.settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.settings-form { display: flex; flex-direction: column; gap: 12px; }
.settings-row { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--t2); }
.settings-check { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--t2); }
.settings-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── LIVE STATUS ────────────────────────────────────────────────────────── */
.live-status-box {
  border: 1px solid var(--border); border-radius: var(--radius-small); padding: 12px;
  background: var(--bg); display: flex; flex-direction: column; gap: 6px;
  font-size: 12px; color: var(--t2);
}

/* ── ANALYSIS ───────────────────────────────────────────────────────────── */
.insight-list { display: flex; flex-direction: column; gap: 8px; }
.analysis-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.analysis-stack { display: flex; flex-direction: column; gap: 16px; }
.analysis-stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.analysis-stat {
  border: 1px solid var(--border); border-radius: var(--radius-card);
  padding: 12px; background: var(--bg);
}
.analysis-stat-label {
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--t3); margin-bottom: 6px;
}
.analysis-stat-value { font-family: var(--mono); font-size: 20px; font-weight: 600; color: var(--p); }
.analysis-stat-sub { margin-top: 4px; font-size: 11px; color: var(--t2); }

.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: grid; grid-template-columns: minmax(120px, 1.1fr) minmax(0, 1.8fr) auto; gap: 10px; align-items: center; }
.bar-track { height: 6px; border-radius: 999px; background: var(--c2); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; }

.insight-row {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 8px;
  align-items: center; padding: 10px 14px; border-radius: var(--radius-small);
  border: 1px solid var(--border); background: var(--bg);
  font-size: 12px; color: var(--t2); transition: background .12s;
}
.insight-row:hover { background: var(--nav-active-bg); }
.insight-row strong { color: var(--t); }

/* ── KANBAN ─────────────────────────────────────────────────────────────── */
.kanban-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.kanban-lane {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  background: var(--bg); min-height: 280px; display: flex; flex-direction: column;
}
.kanban-lane-header {
  padding: 10px 12px; border-bottom: 2px solid var(--p);
  display: flex; justify-content: space-between; align-items: center; font-size: 12px;
  font-family: var(--font-display); font-weight: 700; background: var(--card);
  border-radius: var(--radius-small) var(--radius-small) 0 0;
}
.kanban-lane-body { display: flex; flex-direction: column; gap: 8px; padding: 10px; }
.kanban-card {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  background: var(--card); padding: 10px; display: flex; flex-direction: column;
  gap: 4px; font-size: 12px; color: var(--t2); box-shadow: var(--shadow-sm);
  transition: box-shadow .15s;
}
.kanban-card:hover { box-shadow: var(--shadow-md); }
.kanban-card strong { color: var(--t); }

.stage-strip { display: flex; flex-wrap: wrap; gap: 10px; }
.stage-pill {
  border: 1px solid var(--border); border-left-width: 3px; border-radius: var(--radius-small);
  background: var(--card); padding: 12px; display: flex; flex-direction: column;
  gap: 4px; font-size: 12px; color: var(--t2); min-width: 120px; flex: 1;
}

/* ── AGENTS ─────────────────────────────────────────────────────────────── */
.agent-card {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  background: var(--bg); padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.agent-card-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.agent-health {
  flex-shrink: 0; border: 1px solid var(--border); border-radius: 999px;
  padding: 4px 10px; font-size: 11px; font-weight: 600;
}
.agent-health.healthy {
  color: var(--green); background: color-mix(in srgb, var(--green) 10%, transparent);
  border-color: color-mix(in srgb, var(--green) 26%, transparent);
}
.agent-health.degraded {
  color: var(--amber); background: color-mix(in srgb, var(--amber) 10%, transparent);
  border-color: color-mix(in srgb, var(--amber) 26%, transparent);
}
.agent-card h4 { margin: 0; color: var(--t); font-size: 14px; font-weight: 600; }
.agent-card p { margin: 0; color: var(--t2); font-size: 12px; line-height: 1.4; }
.agent-meta-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px; font-size: 12px; color: var(--t2);
}
.agent-meta-grid strong { display: block; margin-bottom: 6px; color: var(--t); }
.agent-meta-grid ul { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
.agent-meta-grid li { color: var(--t2); }
.agent-issues {
  border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent);
  background: color-mix(in srgb, var(--amber) 8%, transparent);
  border-radius: var(--radius-small); padding: 10px 12px; font-size: 12px;
  color: var(--amber); display: flex; flex-direction: column; gap: 4px;
}
.agent-actions { display: flex; gap: 8px; margin-top: 4px; align-items: center; flex-wrap: wrap; }
.agent-file-label { font-size: 12px; color: var(--t3); font-family: var(--mono); }

/* ── AUTH ───────────────────────────────────────────────────────────────── */
.auth-shell {
  min-height: 100vh; display: grid; place-items: center; padding: 32px 18px;
  background: linear-gradient(135deg, var(--p-soft) 0%, var(--bg) 60%);
}
.auth-card {
  width: min(960px, 100%); border: 1px solid var(--border); border-radius: var(--radius-xl);
  background: var(--card); box-shadow: var(--shadow-lg); padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}
.auth-header { display: flex; align-items: center; gap: 16px; }
.auth-header h1 {
  margin: 0 0 6px; font-size: 28px; color: var(--t);
  font-family: var(--font-display); font-weight: 800;
}
.auth-header p { margin: 0; color: var(--t2); font-size: 13px; }
.auth-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.auth-error {
  grid-column: 1 / -1;
  border: 1px solid color-mix(in srgb, var(--red) 28%, transparent);
  background: color-mix(in srgb, var(--red) 8%, transparent);
  color: var(--red); border-radius: var(--radius-small); padding: 10px 12px; font-size: 12px;
}
.auth-submit { grid-column: 1 / -1; }
.auth-presets { display: flex; flex-direction: column; gap: 12px; }
.auth-preset-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.auth-preset {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  background: var(--bg); padding: 12px; display: flex; flex-direction: column;
  gap: 6px; color: var(--t2); text-align: left; transition: all .15s;
}
.auth-preset:hover { border-color: var(--p); background: var(--p-soft); }
.auth-preset strong { color: var(--t); }

/* ── BOT PANEL ──────────────────────────────────────────────────────────── */
.bot-overlay {
  position: fixed; inset: 0;
  background: rgba(82,53,140,0.12); z-index: 120; display: flex; justify-content: flex-end;
}
.bot-panel {
  width: min(560px, 100%); height: 100vh; background: var(--card);
  border-left: 1px solid var(--border); box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column;
}
.bot-header {
  padding: 18px 18px 14px; border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
}
.bot-header h3 { margin: 0 0 4px; font-size: 18px; color: var(--t); font-family: var(--font-display); font-weight: 800; }
.bot-header p { margin: 0; font-size: 12px; color: var(--t2); }
.bot-tabs, .bot-actions { padding: 14px 18px 0; display: flex; gap: 8px; flex-wrap: wrap; }
.bot-input { width: 100%; resize: vertical; }
.bot-stream { flex: 1; overflow: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.bot-empty, .bot-message {
  border: 1px solid var(--border); border-radius: var(--radius-small);
  background: var(--card); padding: 12px;
}
.bot-message.user { background: var(--p-soft); }
.bot-message-role, .bot-message-meta { font-size: 11px; color: var(--t3); }
.bot-message-role { margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
.bot-message pre { margin: 0; white-space: pre-wrap; font-family: inherit; color: var(--t); line-height: 1.55; }
.bot-message-meta { margin-top: 8px; }

/* ── SEARCH PALETTE ─────────────────────────────────────────────────────── */
.search-palette-overlay {
  position: fixed; inset: 0; background: rgba(26,18,32,0.35);
  z-index: 200; display: flex; align-items: flex-start; justify-content: center;
  padding-top: 80px;
}
.search-palette {
  width: min(560px, 90vw); background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden;
}
.search-palette-input-wrap {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.search-palette-icon { font-size: 15px; color: var(--t3); }
.search-palette-input {
  flex: 1; background: none; border: none; outline: none; font-size: 15px;
  color: var(--t); font-family: var(--font-body);
}
.search-palette-input::placeholder { color: var(--t3); }
.search-palette-kbd {
  font-family: var(--mono); font-size: 10px; color: var(--t3);
  background: var(--bg); border: 1px solid var(--border); border-radius: 5px;
  padding: 2px 6px;
}
.search-palette-results { max-height: 360px; overflow-y: auto; }
.search-palette-group { padding: 8px 0; }
.search-palette-group-label {
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  color: var(--t3); text-transform: uppercase; letter-spacing: .08em;
  padding: 4px 16px 8px;
}
.search-palette-result {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 16px;
  background: none; text-align: left; transition: background .1s; border-radius: 0;
}
.search-palette-result:hover { background: var(--p-soft); }
.search-result-icon { font-size: 16px; flex-shrink: 0; }
.search-result-label { font-size: 13px; font-weight: 600; color: var(--t); }
.search-result-sub { font-size: 11px; color: var(--t3); margin-top: 1px; }
.search-palette-empty, .search-palette-hint {
  padding: 20px 16px; font-size: 13px; color: var(--t3); text-align: center;
}

/* ── RECORD PANEL ───────────────────────────────────────────────────────── */
.record-panel-backdrop {
  position: fixed; inset: 0; background: rgba(26,18,32,0.18); z-index: 110;
}
.record-panel {
  position: fixed; top: 0; right: 0; width: min(480px, 100vw); height: 100vh;
  background: var(--card); border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg); z-index: 111; display: flex; flex-direction: column;
  animation: panelSlideIn .22s ease;
}
@keyframes panelSlideIn {
  from { transform: translateX(40px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.record-panel-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.record-panel-title {
  font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--t);
  line-height: 1.2; margin-bottom: 6px;
}
.record-panel-badge {
  display: inline-block; background: var(--p-soft); color: var(--p);
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 99px; letter-spacing: 0.04em; text-transform: uppercase;
  border: 1px solid color-mix(in srgb, var(--p) 18%, transparent);
}
.record-panel-close {
  background: var(--bg); border: 1px solid var(--border); color: var(--t3);
  width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 12px; cursor: pointer; flex-shrink: 0;
  transition: all .15s;
}
.record-panel-close:hover { background: var(--red); color: white; border-color: var(--red); }
.record-panel-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 20px; }

.record-fields {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
  border: 1px solid var(--border); border-radius: var(--radius-small); overflow: hidden;
}
.record-field { padding: 10px 12px; border-bottom: 1px solid var(--border); }
.record-field:nth-last-child(-n+2) { border-bottom: none; }
.record-field-label {
  font-family: var(--font-display); font-size: 9px; font-weight: 700;
  color: var(--t3); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px;
}
.record-field-value { font-size: 13px; color: var(--t); font-weight: 500; }

/* ── ACTIVITY FEED ──────────────────────────────────────────────────────── */
.activity-feed { display: flex; flex-direction: column; gap: 14px; }
.activity-feed-title {
  font-family: var(--font-display); font-size: 11px; font-weight: 800;
  color: var(--p); text-transform: uppercase; letter-spacing: .08em;
  display: inline-flex; align-items: center; gap: 8px;
}
.activity-feed-title::before { content: ''; width: 20px; height: 2px; background: currentColor; display: inline-block; }
.activity-list { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 20px; }
.activity-list::before {
  content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px;
  background: linear-gradient(to bottom, var(--p), var(--o));
  border-radius: 2px;
}
.activity-item {
  display: flex; align-items: flex-start; gap: 12px; padding: 8px 0;
  position: relative;
}
.activity-dot {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--card); border: 2px solid var(--p);
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; color: var(--p); flex-shrink: 0; margin-left: -20px; position: relative; z-index: 1;
}
.activity-body { flex: 1; }
.activity-desc { font-size: 12px; color: var(--t); line-height: 1.4; }
.activity-date { font-size: 10px; color: var(--t3); margin-top: 2px; font-family: var(--mono); }
.activity-item.activity-note .activity-dot { border-color: var(--o); color: var(--o); }
.activity-add { display: flex; flex-direction: column; gap: 8px; }
.activity-note-input { resize: vertical; min-height: 56px; }

/* ── FUNNEL CHART ───────────────────────────────────────────────────────── */
.funnel-chart {
  border: 1px solid var(--border); border-radius: var(--radius-card);
  background: var(--card); padding: 16px; box-shadow: var(--shadow-sm);
}
.funnel-chart-title {
  font-family: var(--font-display); font-size: 11px; font-weight: 800;
  color: var(--p); text-transform: uppercase; letter-spacing: .08em;
  margin-bottom: 12px; display: inline-flex; align-items: center; gap: 8px;
}
.funnel-chart-title::before { content: ''; width: 20px; height: 2px; background: currentColor; display: inline-block; }

/* ── NOTIFICATION BELL ──────────────────────────────────────────────────── */
.notif-bell-wrap { position: relative; }
.notif-bell-btn { position: relative; }
.notif-badge {
  position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px;
  background: var(--red); color: white; border-radius: 99px;
  font-size: 9px; font-weight: 700; font-family: var(--mono);
  display: flex; align-items: center; justify-content: center; padding: 0 3px;
  border: 2px solid var(--card);
}
.notif-backdrop { position: fixed; inset: 0; z-index: 98; }
.notif-panel {
  position: absolute; top: calc(100% + 8px); right: 0; width: 300px;
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg); z-index: 99; overflow: hidden;
}
.notif-panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--t);
}
.notif-mark-read {
  font-size: 11px; color: var(--p); background: none; border: none; cursor: pointer;
  font-family: var(--font-body); font-weight: 600;
}
.notif-list { display: flex; flex-direction: column; }
.notif-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}
.notif-item:last-child { border-bottom: none; }
.notif-icon { font-size: 16px; flex-shrink: 0; }
.notif-title { font-size: 12px; font-weight: 600; color: var(--t); }
.notif-sub { font-size: 11px; color: var(--t3); margin-top: 2px; }
.notif-item.notif-warning { background: color-mix(in srgb, var(--amber) 5%, transparent); }
.notif-item.notif-danger  { background: color-mix(in srgb, var(--red)   5%, transparent); }
.notif-item.notif-info    { background: var(--bg); }

/* ── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .kpi-grid-4 { grid-template-columns: repeat(2,1fr); }
  .kpi-grid-3 { grid-template-columns: repeat(2,1fr); }
  .analysis-grid, .settings-grid, .kanban-board { grid-template-columns: 1fr; }
  .analysis-stat-grid, .insight-row, .bar-row { grid-template-columns: 1fr; }
  .agent-meta-grid { grid-template-columns: 1fr; }
  .auth-form, .auth-preset-grid { grid-template-columns: 1fr; }
}
@media (max-width: 1100px) {
  .analysis-grid, .settings-grid, .kanban-board { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Verify the app renders without broken styles**

Start dev server and visually check the Overview page loads with the light theme.

```bash
npm run dev -- --port 5173
```

Expected: White/light cards, purple sidebar nav, orange accent strips on active nav items.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat: restyle all UI classes with TryGC V2 brand tokens (Zoho-grade light theme)"
```

---

## Task 5 — Create `SearchPalette` component

**Files:**
- Create: `src/components/SearchPalette.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/SearchPalette.tsx
import { useEffect, useRef, useState } from 'react'
import type { Deal, Rep } from '../lib/supabase'

interface SearchResult {
  type: 'deal' | 'rep'
  id: string
  label: string
  sub: string
  data: Deal | Rep
}

interface SearchPaletteProps {
  open: boolean
  deals: Deal[]
  reps: Rep[]
  onClose: () => void
  onSelectDeal: (deal: Deal) => void
  onSelectRep: (rep: Rep) => void
}

export default function SearchPalette({ open, deals, reps, onClose, onSelectDeal, onSelectRep }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results: SearchResult[] = []
  if (query.trim().length >= 2) {
    const q = query.toLowerCase()
    deals
      .filter(d => d.company_name.toLowerCase().includes(q) || d.sales_exec_name.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(d => results.push({ type: 'deal', id: d.id, label: d.company_name, sub: `${d.stage} · ${d.sales_exec_name}`, data: d }))
    reps
      .filter(r => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(r => results.push({ type: 'rep', id: r.id, label: r.name, sub: `${r.role} · ${r.region}`, data: r }))
  }

  if (!open) return null

  const dealResults = results.filter(r => r.type === 'deal')
  const repResults  = results.filter(r => r.type === 'rep')
  const hasResults  = results.length > 0
  const shortQuery  = query.trim().length < 2

  return (
    <div className="search-palette-overlay" onClick={onClose}>
      <div className="search-palette" onClick={e => e.stopPropagation()}>
        <div className="search-palette-input-wrap">
          <span className="search-palette-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-palette-input"
            placeholder="Search deals, reps, clients…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="search-palette-kbd">ESC</kbd>
        </div>

        {shortQuery && <div className="search-palette-hint">Type at least 2 characters to search</div>}

        {!shortQuery && !hasResults && (
          <div className="search-palette-empty">No results for "{query}"</div>
        )}

        {hasResults && (
          <div className="search-palette-results">
            {dealResults.length > 0 && (
              <div className="search-palette-group">
                <div className="search-palette-group-label">Deals</div>
                {dealResults.map(r => (
                  <button key={r.id} className="search-palette-result" onClick={() => { onSelectDeal(r.data as Deal); onClose() }}>
                    <span className="search-result-icon">💼</span>
                    <div>
                      <div className="search-result-label">{r.label}</div>
                      <div className="search-result-sub">{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {repResults.length > 0 && (
              <div className="search-palette-group">
                <div className="search-palette-group-label">Reps</div>
                {repResults.map(r => (
                  <button key={r.id} className="search-palette-result" onClick={() => { onSelectRep(r.data as Rep); onClose() }}>
                    <span className="search-result-icon">👤</span>
                    <div>
                      <div className="search-result-label">{r.label}</div>
                      <div className="search-result-sub">{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep SearchPalette
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchPalette.tsx
git commit -m "feat: add Cmd+K SearchPalette component"
```

---

## Task 6 — Create `ActivityFeed` component

**Files:**
- Create: `src/components/ActivityFeed.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/ActivityFeed.tsx
import { useMemo, useState } from 'react'
import type { Deal, Rep } from '../lib/supabase'

interface Activity {
  id: string
  type: 'created' | 'stage_change' | 'value_change' | 'note'
  date: string
  description: string
}

interface ActivityFeedProps {
  record: Deal | Rep
  recordType: 'deal' | 'rep'
}

const ICONS: Record<Activity['type'], string> = {
  created: '✦',
  stage_change: '→',
  value_change: '💰',
  note: '📝',
}

function seedActivities(record: Deal | Rep, recordType: 'deal' | 'rep'): Activity[] {
  if (recordType === 'deal') {
    const d = record as Deal
    const base: Activity[] = [
      { id: `c-${d.id}`, type: 'created',      date: d.date, description: `Deal created for ${d.company_name}` },
      { id: `s-${d.id}`, type: 'stage_change', date: d.date, description: `Stage set to "${d.stage}"` },
    ]
    if (d.quotation_value > 0) {
      base.push({ id: `v-${d.id}`, type: 'value_change', date: d.date, description: `Value set to SAR ${d.quotation_value.toLocaleString()}` })
    }
    return base
  }
  const r = record as Rep
  return [{ id: `c-${r.id}`, type: 'created', date: r.join_date ?? new Date().toISOString().slice(0, 10), description: `Rep profile created for ${r.name}` }]
}

export default function ActivityFeed({ record, recordType }: ActivityFeedProps) {
  const seeded = useMemo(() => seedActivities(record, recordType), [record.id, recordType])
  const [notes, setNotes]   = useState<Activity[]>([])
  const [draft, setDraft]   = useState('')

  const all = [...seeded, ...notes].sort((a, b) => b.date.localeCompare(a.date))

  function addNote() {
    if (!draft.trim()) return
    setNotes(prev => [...prev, {
      id: `note-${Date.now()}`,
      type: 'note',
      date: new Date().toISOString().slice(0, 10),
      description: draft.trim(),
    }])
    setDraft('')
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed-title">Activity</div>
      <div className="activity-list">
        {all.map(a => (
          <div key={a.id} className={`activity-item activity-${a.type}`}>
            <div className="activity-dot">{ICONS[a.type]}</div>
            <div className="activity-body">
              <div className="activity-desc">{a.description}</div>
              <div className="activity-date">{a.date}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="activity-add">
        <textarea
          className="field activity-note-input"
          placeholder="Add a note… (Ctrl+Enter to save)"
          value={draft}
          rows={2}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote() }}
        />
        <button className="btn btn-primary btn-sm" onClick={addNote}>Add Note</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep ActivityFeed
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/ActivityFeed.tsx
git commit -m "feat: add ActivityFeed component with seeded timeline and note input"
```

---

## Task 7 — Create `RecordPanel` component

**Files:**
- Create: `src/components/RecordPanel.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/RecordPanel.tsx
import { useEffect } from 'react'
import type { Deal, Rep } from '../lib/supabase'
import ActivityFeed from './ActivityFeed'

interface RecordPanelProps {
  deal?: Deal | null
  rep?: Rep | null
  onClose: () => void
  onUpdateDeal?: (id: string, patch: Partial<Deal>) => void
  onUpdateRep?: (id: string, patch: Partial<Rep>) => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="record-field">
      <div className="record-field-label">{label}</div>
      <div className="record-field-value">{value || '—'}</div>
    </div>
  )
}

export default function RecordPanel({ deal, rep, onClose }: RecordPanelProps) {
  const open = !!(deal || rep)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <div className="record-panel-backdrop" onClick={onClose} />
      <div className="record-panel">
        <div className="record-panel-header">
          <div>
            <div className="record-panel-title">{deal?.company_name ?? rep?.name}</div>
            <span className="record-panel-badge">{deal?.stage ?? rep?.role}</span>
          </div>
          <button className="record-panel-close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        <div className="record-panel-body">
          {deal && (
            <div className="record-fields">
              <Field label="Owner"            value={deal.sales_exec_name} />
              <Field label="Stage"            value={deal.stage} />
              <Field label="Value"            value={`SAR ${deal.quotation_value.toLocaleString()}`} />
              <Field label="Probability"      value={`${deal.probability}%`} />
              <Field label="Date"             value={deal.date} />
              <Field label="Region"           value={deal.region ?? ''} />
              <Field label="Days in Stage"    value={String(deal.days_in_stage)} />
              <Field label="Priority"         value={deal.priority} />
              <Field label="Collection"       value={deal.collection_status ?? ''} />
              <Field label="Collected"        value={deal.collected_amount ? `SAR ${deal.collected_amount.toLocaleString()}` : ''} />
              <Field label="Contract Status"  value={deal.contract_status ?? ''} />
              <Field label="Contact"          value={deal.contact_person} />
            </div>
          )}

          {rep && (
            <div className="record-fields">
              <Field label="Role"           value={rep.role} />
              <Field label="Region"         value={rep.region} />
              <Field label="Monthly Target" value={`SAR ${rep.monthly_target.toLocaleString()}`} />
              <Field label="Secured"        value={`SAR ${rep.secured.toLocaleString()}`} />
              <Field label="Close Rate"     value={`${rep.close_rate}%`} />
              <Field label="Avg Deal"       value={`SAR ${rep.avg_deal.toLocaleString()}`} />
              <Field label="Leads"          value={String(rep.leads)} />
              <Field label="Meetings"       value={String(rep.meetings)} />
            </div>
          )}

          {deal && <ActivityFeed record={deal} recordType="deal" />}
          {rep  && <ActivityFeed record={rep}  recordType="rep"  />}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep RecordPanel
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecordPanel.tsx
git commit -m "feat: add RecordPanel slide-in drawer with fields grid and activity feed"
```

---

## Task 8 — Create `FunnelChart` component

**Files:**
- Create: `src/components/FunnelChart.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/FunnelChart.tsx
interface FunnelSegment {
  stage: string
  count: number
  value: number
  color: string
}

interface FunnelChartProps {
  segments: FunnelSegment[]
  onStageFilter?: (stage: string | null) => void
  fmtSAR: (n: number) => string
}

export default function FunnelChart({ segments, onStageFilter, fmtSAR }: FunnelChartProps) {
  if (segments.length === 0) return null

  const SEG_H = 44
  const GAP   = 3
  const W     = 400
  const TOTAL_H = segments.length * SEG_H + (segments.length - 1) * GAP
  const maxValue = Math.max(...segments.map(s => s.value), 1)

  return (
    <div className="funnel-chart">
      <div className="funnel-chart-title">Pipeline Funnel</div>
      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} width="100%" style={{ display: 'block' }} preserveAspectRatio="none">
        {segments.map((seg, i) => {
          const topRatio = i === 0 ? 1 : segments[i - 1].value / maxValue
          const botRatio = seg.value / maxValue
          const topW     = W * Math.max(topRatio, 0.12)
          const botW     = W * Math.max(botRatio, 0.12)
          const topOff   = (W - topW) / 2
          const botOff   = (W - botW) / 2
          const y        = i * (SEG_H + GAP)
          const pts      = `${topOff},${y} ${topOff + topW},${y} ${botOff + botW},${y + SEG_H} ${botOff},${y + SEG_H}`

          return (
            <g
              key={seg.stage}
              onClick={() => onStageFilter?.(seg.stage)}
              style={{ cursor: onStageFilter ? 'pointer' : 'default' }}
            >
              <polygon points={pts} fill={seg.color} opacity="0.88" />
              <text
                x={W / 2}
                y={y + SEG_H / 2 + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="10"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="700"
                style={{ pointerEvents: 'none' }}
              >
                {seg.stage} · {seg.count} deals · {fmtSAR(seg.value)}
              </text>
            </g>
          )
        })}
      </svg>
      {onStageFilter && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => onStageFilter(null)}
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep FunnelChart
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/FunnelChart.tsx
git commit -m "feat: add SVG FunnelChart component for pipeline stages"
```

---

## Task 9 — Create `NotificationBell` component

**Files:**
- Create: `src/components/NotificationBell.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/NotificationBell.tsx
import { useState } from 'react'
import type { Deal } from '../lib/supabase'

interface Notification {
  id: string
  icon: string
  title: string
  sub: string
  severity: 'warning' | 'danger' | 'info'
}

function buildNotifications(deals: Deal[]): Notification[] {
  const notifs: Notification[] = []
  const active = deals.filter(d => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(d.stage))

  const stale = active.filter(d => d.days_in_stage > 14)
  if (stale.length > 0) {
    notifs.push({ id: 'stale', icon: '⏱', severity: 'warning', title: `${stale.length} stale deal${stale.length > 1 ? 's' : ''}`, sub: 'Stuck >14 days in stage' })
  }

  const overdue = deals.filter(d => d.collection_status === 'Overdue')
  if (overdue.length > 0) {
    notifs.push({ id: 'overdue', icon: '🔴', severity: 'danger', title: `${overdue.length} overdue collection${overdue.length > 1 ? 's' : ''}`, sub: 'Requires immediate follow-up' })
  }

  const critical = active.filter(d => d.days_in_stage > 14 && d.probability < 50)
  if (critical.length > 0) {
    notifs.push({ id: 'critical', icon: '⚠️', severity: 'danger', title: `${critical.length} critical risk deal${critical.length > 1 ? 's' : ''}`, sub: 'Low probability + long in stage' })
  }

  if (notifs.length === 0) {
    notifs.push({ id: 'clear', icon: '✅', severity: 'info', title: 'All clear', sub: 'No urgent items right now' })
  }

  return notifs
}

interface NotificationBellProps {
  deals: Deal[]
}

export default function NotificationBell({ deals }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(false)

  const notifications = buildNotifications(deals)
  const urgentCount   = notifications.filter(n => n.severity !== 'info').length

  return (
    <div className="notif-bell-wrap">
      <button className="btn-icon notif-bell-btn" onClick={() => setOpen(o => !o)} title="Notifications">
        🔔
        {urgentCount > 0 && !read && <span className="notif-badge">{urgentCount}</span>}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel">
            <div className="notif-panel-header">
              <span>Notifications</span>
              {urgentCount > 0 && !read && (
                <button className="notif-mark-read" onClick={() => { setRead(true); setOpen(false) }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className={`notif-item notif-${n.severity}`}>
                  <span className="notif-icon">{n.icon}</span>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep NotificationBell
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/NotificationBell.tsx
git commit -m "feat: add NotificationBell with stale/overdue/critical deal alerts"
```

---

## Task 10 — Rebuild `App.tsx` (Zoho sidebar + topbar wiring)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
// src/App.tsx
import type { ComponentType } from 'react'
import { useState, useEffect, useCallback } from 'react'
import Overview from './pages/Overview'
import Pipeline from './pages/Pipeline'
import Contracts from './pages/Contracts'
import Revenue from './pages/Revenue'
import Commissions from './pages/Commissions'
import SalesTeam from './pages/SalesTeam'
import LostDeals from './pages/LostDeals'
import Kanban from './pages/Kanban'
import Clients from './pages/Clients'
import Goals from './pages/Goals'
import Settings from './pages/Settings'
import AuthScreen from './components/AuthScreen'
import AutomationBot from './components/AutomationBot'
import SearchPalette from './components/SearchPalette'
import NotificationBell from './components/NotificationBell'
import RecordPanel from './components/RecordPanel'
import { ROLE_LABELS } from './lib/auth'
import { SettingsProvider } from './context/SettingsContext'
import { WorkspaceDataProvider, useWorkspaceData } from './context/WorkspaceDataContext'
import type { Deal, Rep } from './lib/supabase'
import './App.css'

export type PageId =
  | 'overview' | 'pipeline' | 'kanban' | 'contracts' | 'revenue'
  | 'commissions' | 'salesteam' | 'lost' | 'clients' | 'goals' | 'settings'

const NAV: Array<{ id: PageId; label: string; icon: string; page: ComponentType }> = [
  { id: 'overview',    label: 'Overview',    icon: '📊', page: Overview },
  { id: 'pipeline',   label: 'Pipeline',    icon: '📋', page: Pipeline },
  { id: 'kanban',     label: 'Kanban',      icon: '🗂',  page: Kanban },
  { id: 'contracts',  label: 'Contracts',   icon: '📝', page: Contracts },
  { id: 'revenue',    label: 'Revenue',     icon: '💵', page: Revenue },
  { id: 'commissions',label: 'Commissions', icon: '💰', page: Commissions },
  { id: 'salesteam',  label: 'Sales Team',  icon: '👥', page: SalesTeam },
  { id: 'lost',       label: 'Lost Deals',  icon: '📉', page: LostDeals },
  { id: 'clients',    label: 'Clients',     icon: '🏢', page: Clients },
  { id: 'goals',      label: 'Goals',       icon: '🎯', page: Goals },
  { id: 'settings',   label: 'Settings',    icon: '⚙️', page: Settings },
]

// TryGC logo mark SVG (from Brand Manual V2)
function GcMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="logo-mark">
      <circle cx="22" cy="20" r="15" stroke="#E8630C" strokeWidth="4.5" fill="none"/>
      <circle cx="22" cy="20" r="6.8" fill="#E8630C"/>
      <circle cx="40" cy="9" r="3.6" fill="#52358C"/>
      <path d="M 46 36 A 10 10 0 1 0 36 46 L 36 52 L 42 46 Z" fill="#52358C"/>
    </svg>
  )
}

function AppShell() {
  const {
    deals, reps, feedbacks, settings, setSettings,
    currentUser, login, logout, visibleNav, page, setPage,
    sidebarOpen, setSidebarOpen, botOpen, setBotOpen,
    liveStatus, fmtK, fmtSAR, updateDeal, updateRep,
  } = useWorkspaceData()

  const [searchOpen, setSearchOpen]   = useState(false)
  const [panelDeal,  setPanelDeal]    = useState<Deal | null>(null)
  const [panelRep,   setPanelRep]     = useState<Rep  | null>(null)

  // Cmd+K / Ctrl+K global shortcut
  const openSearch = useCallback(() => setSearchOpen(true), [])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch])

  function handleSelectDeal(deal: Deal) {
    setPage('pipeline')
    setPanelDeal(deal)
    setPanelRep(null)
  }

  function handleSelectRep(rep: Rep) {
    setPage('salesteam')
    setPanelRep(rep)
    setPanelDeal(null)
  }

  if (!currentUser) {
    return <AuthScreen onLogin={login} />
  }

  const activePageMeta = NAV.find(item => item.id === page)
  const ActivePage     = activePageMeta?.page ?? Overview
  const nextTheme      = settings.theme === 'dark' ? 'light' : 'dark'
  const userInitials   = currentUser.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const pipelineValue  = deals.filter(d => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(d.stage)).reduce((s, d) => s + d.quotation_value, 0)
  const closedValue    = deals.filter(d => ['Closed – With Contract', 'Closed – No Contract'].includes(d.stage)).reduce((s, d) => s + d.quotation_value, 0)

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <GcMark size={32} />
          {sidebarOpen && (
            <div>
              <span className="logo-title">GC Workspace</span>
              <span className="logo-sub">KSA CRM</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="mini-kpi"><span>Pipeline</span><span className="accent">{fmtK(pipelineValue)} SAR</span></div>
            <div className="mini-kpi"><span>Closed</span><span className="green">{fmtK(closedValue)} SAR</span></div>
            <div className="mini-kpi"><span>Source</span><span>{liveStatus.source}</span></div>
            <div className="sidebar-user" style={{ marginTop: 8 }}>
              <div className="sidebar-avatar">{userInitials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser.name}</div>
                <div className="sidebar-user-role">{ROLE_LABELS[currentUser.role]}</div>
              </div>
            </div>
            <button className="sidebar-logout" onClick={logout}>Sign out</button>
          </div>
        )}
      </aside>

      {/* TOPBAR */}
      <div className="topbar">
        <button className="topbar-toggle" onClick={() => setSidebarOpen(c => !c)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <button className="topbar-search" onClick={openSearch}>
          <span className="topbar-search-icon">🔍</span>
          <span className="topbar-search-placeholder">Search deals, reps…</span>
          <kbd className="topbar-search-kbd">⌘K</kbd>
        </button>

        <div className="topbar-actions">
          <button className="btn-icon" onClick={() => setSettings({ theme: nextTheme })} title="Toggle theme">
            {settings.theme === 'dark' ? '☀' : '🌙'}
          </button>

          <NotificationBell deals={deals} />

          <button className="btn btn-ghost topbar-bot" onClick={() => setBotOpen(true)} type="button">
            Automation Bot
          </button>

          <div className="topbar-badge">
            <span className="badge-dot" />
            {liveStatus.connected ? 'Live Data' : liveStatus.source === 'local' ? 'Local Cache' : 'Mock Data'}
          </div>

          <div className="topbar-user" title={currentUser.email}>{userInitials}</div>
        </div>
      </div>

      {/* MAIN */}
      <main className="main-content">
        <ActivePage />
      </main>

      {/* OVERLAYS */}
      <SearchPalette
        open={searchOpen}
        deals={deals}
        reps={reps}
        onClose={() => setSearchOpen(false)}
        onSelectDeal={handleSelectDeal}
        onSelectRep={handleSelectRep}
      />

      <RecordPanel
        deal={panelDeal}
        rep={panelRep}
        onClose={() => { setPanelDeal(null); setPanelRep(null) }}
        onUpdateDeal={updateDeal}
        onUpdateRep={updateRep}
      />

      <AutomationBot
        open={botOpen}
        onClose={() => setBotOpen(false)}
        pageId={page}
        pageLabel={activePageMeta?.label ?? 'Overview'}
        deals={deals}
        reps={reps}
        feedbacks={feedbacks}
        settings={settings}
        fmtSAR={fmtSAR}
      />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <WorkspaceDataProvider>
        <AppShell />
      </WorkspaceDataProvider>
    </SettingsProvider>
  )
}

export { useWorkspaceData as useApp } from './context/WorkspaceDataContext'
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: Zoho sidebar rail, topbar search/notifications, Cmd+K, RecordPanel wiring"
```

---

## Task 11 — Wire `RecordPanel` into `PageWorkspace`

**Files:**
- Modify: `src/components/PageWorkspace.tsx`

- [ ] **Step 1: Add row-click prop and RecordPanel state**

Replace the entire file:

```typescript
// src/components/PageWorkspace.tsx
import { useState } from 'react'
import type { ReactNode } from 'react'
import EditableDataGrid from './EditableDataGrid'
import RecordPanel from './RecordPanel'
import type { AppSettings, ImportMode, PageView, WorkspaceColumn, WorkspaceRow } from '../lib/workspace'
import type { Deal, Rep } from '../lib/supabase'

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
  recordType?: 'deal' | 'rep'
}

export default function PageWorkspace<T extends WorkspaceRow>({
  title, subtitle, rows, columns, metrics, settings, view, onViewChange,
  createBlankRow, onAddRows, onUpdateRow, onDuplicateRow, onDeleteRow,
  dashboardContent, canEdit = true, recordType,
}: PageWorkspaceProps<T>) {
  const [panelRecord, setPanelRecord] = useState<T | null>(null)

  function handleRowClick(row: T) {
    setPanelRecord(row)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <div className="page-actions">
          <button className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onViewChange('dashboard')}>
            Dashboard
          </button>
          <button className={`btn ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onViewChange('grid')}>
            Grid View
          </button>
        </div>
      </div>

      <div className="kpi-grid kpi-grid-4">
        {metrics.map(metric => (
          <div key={metric.label} className="kpi-box" style={{ '--kpi-color': metric.color } as React.CSSProperties}>
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
            <p style={{ color: 'var(--t2)', fontSize: 13 }}>
              {rows.length} records loaded. Switch to Grid View to edit cells directly.
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
          onRowClick={handleRowClick}
        />
      )}

      {panelRecord && recordType === 'deal' && (
        <RecordPanel
          deal={panelRecord as unknown as Deal}
          onClose={() => setPanelRecord(null)}
          onUpdateDeal={(id, patch) => onUpdateRow(id, patch as Partial<T>)}
        />
      )}
      {panelRecord && recordType === 'rep' && (
        <RecordPanel
          rep={panelRecord as unknown as Rep}
          onClose={() => setPanelRecord(null)}
          onUpdateRep={(id, patch) => onUpdateRow(id, patch as Partial<T>)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add `onRowClick` prop to `EditableDataGrid`**

Open `src/components/EditableDataGrid.tsx`. Add `onRowClick` to the interface and wire it to `<tr>` clicks.

Find the `EditableDataGridProps` interface and add:
```typescript
  onRowClick?: (row: T) => void
```

Find the destructuring at the top of the function body and add `onRowClick`:
```typescript
  onRowClick,
```

Find the `<tbody>` `<tr>` element that renders rows. It currently looks like:
```tsx
<tr key={row.id} ...>
```

Add `onClick` to it:
```tsx
<tr
  key={row.id}
  onClick={() => onRowClick?.(row)}
  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
  ...existing props...
>
```

- [ ] **Step 3: Add `recordType` to pages that use PageWorkspace**

In `src/pages/Pipeline.tsx`, `src/pages/Overview.tsx`, `src/pages/Contracts.tsx`, `src/pages/Revenue.tsx`, `src/pages/LostDeals.tsx` — add `recordType="deal"` to the `<PageWorkspace>` call.

In `src/pages/SalesTeam.tsx` — add `recordType="rep"`.

Example for Pipeline.tsx (find the `<PageWorkspace` opening tag and add the prop):
```tsx
<PageWorkspace
  recordType="deal"
  title="📋 Pipeline"
  ...
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageWorkspace.tsx src/components/EditableDataGrid.tsx src/pages/Pipeline.tsx src/pages/Overview.tsx src/pages/Contracts.tsx src/pages/Revenue.tsx src/pages/LostDeals.tsx src/pages/SalesTeam.tsx
git commit -m "feat: row click opens RecordPanel in all data pages"
```

---

## Task 12 — Integrate `FunnelChart` into `Pipeline.tsx`

**Files:**
- Modify: `src/pages/Pipeline.tsx`

- [ ] **Step 1: Read the current Pipeline.tsx to find the dashboard content section**

The file already builds `stageStats`. We'll add `FunnelChart` above the existing bar chart.

- [ ] **Step 2: Add the import and FunnelChart to the dashboard**

At the top of `src/pages/Pipeline.tsx`, add the import:
```typescript
import FunnelChart from '../components/FunnelChart'
```

Find where `stageStats` is defined. After it, add a `funnelSegments` derivation:
```typescript
const funnelSegments = stageStats
  .filter(s => s.value > 0)
  .map(s => ({
    stage: s.stage,
    count: s.count,
    value: s.value,
    color: STAGE_COLORS[s.stage] ?? '#52358C',
  }))
```

Find the `dashboardContent` prop passed to `<PageWorkspace>`. Inside it, add `<FunnelChart>` as the first element before the existing analysis grid:

```tsx
dashboardContent={
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <FunnelChart
      segments={funnelSegments}
      fmtSAR={fmtSAR}
      onStageFilter={null}
    />
    <div className="analysis-grid">
      {/* existing content unchanged */}
    </div>
  </div>
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Verify in browser**

Open Pipeline page → Dashboard view. Expected: Purple/orange trapezoid funnel appears above the stage breakdown chart.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Pipeline.tsx
git commit -m "feat: integrate FunnelChart into Pipeline dashboard view"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| TryGC V2 brand tokens | Task 1 |
| Mulish/Barlow/JetBrains fonts | Task 2 |
| Default theme → light | Task 3 |
| Full CSS restyle | Task 4 |
| Zoho sidebar rail (orange active strip, logo) | Task 10 |
| Topbar: search bar, notifications, theme toggle | Task 10 |
| Cmd+K global search palette | Tasks 5 + 10 |
| Record detail side panel | Tasks 7 + 11 |
| Activity feed | Task 6 |
| Pipeline funnel chart | Tasks 8 + 12 |
| Notification bell (stale/overdue/critical) | Tasks 9 + 10 |
| Row click opens panel | Task 11 |
| No class renames | Task 4 ✓ |
| No new npm dependencies | All ✓ |

**No placeholders:** All steps contain complete code. ✓

**Type consistency:**
- `RecordPanel` receives `Deal | null` and `Rep | null` — matches `ActivityFeed` props which accept `Deal | Rep`. ✓
- `FunnelChart` `segments` type is consistent between `Pipeline.tsx` derivation and component interface. ✓
- `onRowClick?: (row: T) => void` added to both `EditableDataGridProps` and the call site in `PageWorkspace`. ✓
- `SearchPalette` receives `deals: Deal[]` and `reps: Rep[]` from `useWorkspaceData()` which returns those exact types. ✓
