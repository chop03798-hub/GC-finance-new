import { useState } from 'react'
import { exportRowsToCsv, exportRowsToXlsx } from '../lib/workspace'
import type { AppSettings, AccentPalette, BorderRadiusMode, SidebarMode, CurrencyCode, NumberFormat, DateFormat, LandingPage } from '../lib/workspace'
import { useApp } from '../App'
import { AGENT_PROFILES } from '../lib/agentProfiles'
import { ROLE_LABELS, getSeededUsers } from '../lib/auth'
import UserManagement from '../components/UserManagement'
import TargetsManager from '../components/TargetsManager'
import ScheduledAlerts from '../components/ScheduledAlerts'

type SettingsTab = 'workspace' | 'display' | 'data' | 'alerts' | 'agents' | 'account' | 'targets' | 'users'

const ACCENT_PALETTES: { id: AccentPalette; label: string; color: string }[] = [
  { id: 'trygc-orange', label: 'TryGC Orange', color: '#e8621a' },
  { id: 'trygc-purple', label: 'TryGC Purple', color: '#7c3aed' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'red', label: 'Red', color: '#ef4444' },
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'blue', label: 'Blue', color: '#3b82f6' },
]

const LANDING_PAGES: { id: LandingPage; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'kanban', label: 'Kanban Board' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'salesteam', label: 'Sales Team' },
  { id: 'lost', label: 'Lost Deals' },
  { id: 'clients', label: 'Clients' },
  { id: 'goals', label: 'Goals' },
  { id: 'settings', label: 'Settings' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--border)', position: 'relative', flexShrink: 0,
        transition: 'background .2s',
      }}
    >
      <span style={{
        display: 'block', width: 14, height: 14, borderRadius: 999,
        background: '#fff', position: 'absolute', top: 3,
        left: checked ? 19 : 3, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }} />
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="section-title">{title}</div>
      <div className="settings-form">{children}</div>
    </div>
  )
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { deals, reps, settings, setSettings, liveStatus, resetData, currentUser, logout } = useApp()
  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace')
  const activeAgent = AGENT_PROFILES.find((agent) => agent.id === settings.activeAgent) ?? AGENT_PROFILES[0]
  const healthyAgents = AGENT_PROFILES.filter((agent) => agent.healthy).length
  const users = getSeededUsers()

  if (!currentUser) return null

  const tabs: Array<{ id: SettingsTab; label: string; icon: string; adminOnly?: boolean }> = [
    { id: 'workspace', label: 'Appearance', icon: '🎨' },
    { id: 'display', label: 'Display', icon: '📊' },
    { id: 'data', label: 'Data & Sync', icon: '🔗' },
    { id: 'alerts', label: 'Alerts & Calls', icon: '🔔' },
    { id: 'agents', label: 'AI Agents', icon: '🤖' },
    { id: 'account', label: 'Account', icon: '👤' },
    ...(['super_admin', 'sales_manager'].includes(currentUser.role)
      ? [{ id: 'targets' as SettingsTab, label: 'Sales Targets', icon: '🎯' }]
      : []),
    ...(currentUser.role === 'super_admin'
      ? [{ id: 'users' as SettingsTab, label: 'User Management', icon: '👥', adminOnly: true }]
      : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-sub">Interface, display, data connections, AI agents, and workspace management.</p>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab-btn${activeTab === tab.id ? ' active' : ''}${tab.adminOnly ? ' admin-tab' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.adminOnly && <span className="admin-tab-badge">Admin</span>}
          </button>
        ))}
      </div>

      {/* ── APPEARANCE TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'workspace' && (
        <div className="settings-grid">
          <SectionCard title="Theme & Colors">
            <SettingRow label="Color Theme">
              <select className="field" value={settings.theme} onChange={(e) => setSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </SettingRow>
            <SettingRow label="Accent Palette" hint="Primary color used for buttons, badges, and highlights">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ACCENT_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.label}
                    onClick={() => setSettings({ accentPalette: p.id as AccentPalette })}
                    style={{
                      width: 26, height: 26, borderRadius: 999, background: p.color, border: settings.accentPalette === p.id ? '3px solid var(--text1)' : '2px solid transparent',
                      cursor: 'pointer', outline: settings.accentPalette === p.id ? '2px solid var(--bg)' : 'none', outlineOffset: -4,
                    }}
                  />
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Border Radius" hint="Corner rounding style for cards and inputs">
              <div style={{ display: 'flex', gap: 6 }}>
                {(['sharp', 'normal', 'rounded'] as BorderRadiusMode[]).map((r) => (
                  <button key={r} type="button" onClick={() => setSettings({ borderRadius: r as BorderRadiusMode })}
                    style={{ padding: '4px 10px', fontSize: 11, borderRadius: r === 'sharp' ? 2 : r === 'normal' ? 6 : 999, border: `1px solid ${settings.borderRadius === r ? 'var(--accent)' : 'var(--border)'}`, background: settings.borderRadius === r ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card)', color: settings.borderRadius === r ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', fontWeight: settings.borderRadius === r ? 700 : 400 }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SectionCard>

          <SectionCard title="Layout & Motion">
            <SettingRow label="Sidebar Mode">
              <select className="field" value={settings.sidebarMode} onChange={(e) => setSettings({ sidebarMode: e.target.value as SidebarMode })}>
                <option value="expanded">Always Expanded</option>
                <option value="collapsed">Always Collapsed</option>
                <option value="auto">Auto (hover to expand)</option>
              </select>
            </SettingRow>
            <SettingRow label="Default Landing Page" hint="Page shown after login">
              <select className="field" value={settings.defaultLandingPage} onChange={(e) => setSettings({ defaultLandingPage: e.target.value as LandingPage })}>
                {LANDING_PAGES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </SettingRow>
            <SettingRow label="Default Page View">
              <select className="field" value={settings.defaultPageView} onChange={(e) => setSettings({ defaultPageView: e.target.value as 'dashboard' | 'grid' })}>
                <option value="dashboard">Dashboard</option>
                <option value="grid">Excel / Grid View</option>
              </select>
            </SettingRow>
            <SettingRow label="Glassmorphism" hint="Frosted glass effects on cards and modals">
              <Toggle checked={settings.glassmorphism} onChange={(v) => setSettings({ glassmorphism: v })} />
            </SettingRow>
            <SettingRow label="Animations" hint="Transition and hover animations">
              <Toggle checked={settings.animations} onChange={(v) => setSettings({ animations: v })} />
            </SettingRow>
            <SettingRow label="Show Leaderboard" hint="Rep performance leaderboard on Overview">
              <Toggle checked={settings.showLeaderboard} onChange={(v) => setSettings({ showLeaderboard: v })} />
            </SettingRow>
            <SettingRow label="Leaderboard Size">
              <select className="field" value={settings.leaderboardSize} onChange={(e) => setSettings({ leaderboardSize: Number(e.target.value) as 3 | 5 | 10 | 13 })}>
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={13}>All</option>
              </select>
            </SettingRow>
            <SettingRow label="Show Alerts Panel" hint="Notification panel on the dashboard">
              <Toggle checked={settings.showAlertsPanel} onChange={(v) => setSettings({ showAlertsPanel: v })} />
            </SettingRow>
          </SectionCard>

          <SectionCard title="Reset / Recovery">
            <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
              Restores the demo workspace with seeded data. Any imported or manually entered records will be replaced.
            </p>
            <button className="btn btn-danger" onClick={resetData}>Restore Seed Data</button>
          </SectionCard>
        </div>
      )}

      {/* ── DISPLAY TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'display' && (
        <div className="settings-grid">
          <SectionCard title="Locale & Formatting">
            <SettingRow label="Currency">
              <select className="field" value={settings.currency} onChange={(e) => setSettings({ currency: e.target.value as CurrencyCode })}>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="KWD">KWD — Kuwaiti Dinar</option>
                <option value="EGP">EGP — Egyptian Pound</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </SettingRow>
            <SettingRow label="Show Currency Code" hint="Display 'SAR' next to amounts">
              <Toggle checked={settings.showCurrencyCode} onChange={(v) => setSettings({ showCurrencyCode: v })} />
            </SettingRow>
            <SettingRow label="Compact Numbers" hint="1.2M instead of 1,200,000">
              <Toggle checked={settings.compactNumbers} onChange={(v) => setSettings({ compactNumbers: v })} />
            </SettingRow>
            <SettingRow label="Number Format">
              <select className="field" value={settings.numberFormat} onChange={(e) => setSettings({ numberFormat: e.target.value as NumberFormat })}>
                <option value="en-SA">1,234.56 (en-SA)</option>
                <option value="en-US">1,234.56 (en-US)</option>
                <option value="ar-SA">١٬٢٣٤٫٥٦ (ar-SA)</option>
              </select>
            </SettingRow>
            <SettingRow label="Date Format">
              <select className="field" value={settings.dateFormat} onChange={(e) => setSettings({ dateFormat: e.target.value as DateFormat })}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </SettingRow>
          </SectionCard>

          <SectionCard title="Table Options">
            <SettingRow label="Grid Density">
              <select className="field" value={settings.density} onChange={(e) => setSettings({ density: e.target.value as 'compact' | 'comfortable' })}>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </SettingRow>
            <SettingRow label="Rows Per Page">
              <select className="field" value={settings.rowsPerPage} onChange={(e) => setSettings({ rowsPerPage: Number(e.target.value) as AppSettings['rowsPerPage'] })}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </SettingRow>
            <SettingRow label="Wrap Cell Content">
              <Toggle checked={settings.wrapCells} onChange={(v) => setSettings({ wrapCells: v })} />
            </SettingRow>
            <SettingRow label="Show Row Numbers">
              <Toggle checked={settings.showRowNumbers} onChange={(v) => setSettings({ showRowNumbers: v })} />
            </SettingRow>
            <SettingRow label="Sticky Table Header">
              <Toggle checked={settings.stickyHeader} onChange={(v) => setSettings({ stickyHeader: v })} />
            </SettingRow>
            <SettingRow label="Freeze First Column">
              <Toggle checked={settings.freezeFirstColumn} onChange={(v) => setSettings({ freezeFirstColumn: v })} />
            </SettingRow>
            <SettingRow label="Zebra Row Striping">
              <Toggle checked={settings.zebraRows} onChange={(v) => setSettings({ zebraRows: v })} />
            </SettingRow>
            <SettingRow label="Show Totals Row">
              <Toggle checked={settings.showTotalsRow} onChange={(v) => setSettings({ showTotalsRow: v })} />
            </SettingRow>
            <SettingRow label="Auto-save Local Edits">
              <Toggle checked={settings.autoSave} onChange={(v) => setSettings({ autoSave: v })} />
            </SettingRow>
            <SettingRow label="Confirm Deletes" hint="Show confirmation dialog before deleting rows">
              <Toggle checked={settings.confirmDeletes} onChange={(v) => setSettings({ confirmDeletes: v })} />
            </SettingRow>
          </SectionCard>

          <SectionCard title="Auto-Refresh">
            <SettingRow label="Auto-Refresh Data" hint="Periodically reload from Supabase when connected">
              <Toggle checked={settings.autoRefresh} onChange={(v) => setSettings({ autoRefresh: v })} />
            </SettingRow>
            <SettingRow label="Refresh Interval">
              <select className="field" value={settings.autoRefreshSeconds} onChange={(e) => setSettings({ autoRefreshSeconds: Number(e.target.value) as AppSettings['autoRefreshSeconds'] })} disabled={!settings.autoRefresh}>
                <option value={10}>Every 10 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </SettingRow>
          </SectionCard>
        </div>
      )}

      {/* ── DATA TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'data' && (
        <div className="settings-grid">
          <SectionCard title="Data Flow">
            <SettingRow label="Data Source Mode">
              <select className="field" value={settings.dataMode} onChange={(e) => setSettings({ dataMode: e.target.value as 'mock' | 'auto' | 'live' })}>
                <option value="mock">Mock only</option>
                <option value="auto">Auto detect live</option>
                <option value="live">Live first</option>
              </select>
            </SettingRow>
            <SettingRow label="Push Edits to Supabase" hint="Sync local changes back to live database">
              <Toggle checked={settings.liveSync} onChange={(v) => setSettings({ liveSync: v })} />
            </SettingRow>
            <SettingRow label="Default Import Mode">
              <select className="field" value={settings.importMode} onChange={(e) => setSettings({ importMode: e.target.value as 'append' | 'replace' })}>
                <option value="append">Append to existing</option>
                <option value="replace">Replace current table</option>
              </select>
            </SettingRow>
            <SettingRow label="Preferred Export Format">
              <select className="field" value={settings.exportFormat} onChange={(e) => setSettings({ exportFormat: e.target.value as 'csv' | 'xlsx' })}>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
            </SettingRow>
            <div className="live-status-box" style={{ marginTop: 8 }}>
              <div><strong>Status:</strong> {liveStatus.message}</div>
              <div><strong>Configured:</strong> {liveStatus.configured ? 'Yes' : 'No'}</div>
              <div><strong>Current source:</strong> {liveStatus.source}</div>
            </div>
          </SectionCard>

          <SectionCard title="Bulk Import / Export">
            <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
              Snapshot both core tables to CSV or Excel.
            </p>
            <div className="settings-actions">
              <button className="btn btn-ghost" onClick={() => exportRowsToCsv('all-deals', deals, [
                { key: 'date', label: 'Date' }, { key: 'company_name', label: 'Company' },
                { key: 'parent_company_name', label: 'Group / Parent Company' }, { key: 'brand_name', label: 'Brand' },
                { key: 'sales_exec_name', label: 'Salesman' }, { key: 'stage', label: 'Stage' }, { key: 'quotation_value', label: 'Value' },
              ])}>Deals CSV</button>
              <button className="btn btn-ghost" onClick={() => exportRowsToXlsx('all-deals', deals, [
                { key: 'date', label: 'Date' }, { key: 'company_name', label: 'Company' },
                { key: 'parent_company_name', label: 'Group / Parent Company' }, { key: 'brand_name', label: 'Brand' },
                { key: 'sales_exec_name', label: 'Salesman' }, { key: 'stage', label: 'Stage' }, { key: 'quotation_value', label: 'Value' },
              ])}>Deals Excel</button>
              <button className="btn btn-ghost" onClick={() => exportRowsToCsv('all-reps', reps, [
                { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'region', label: 'Region' },
                { key: 'secured', label: 'Secured' }, { key: 'monthly_target', label: 'Monthly Target' },
              ])}>Reps CSV</button>
              <button className="btn btn-ghost" onClick={() => exportRowsToXlsx('all-reps', reps, [
                { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'region', label: 'Region' },
                { key: 'secured', label: 'Secured' }, { key: 'monthly_target', label: 'Monthly Target' },
              ])}>Reps Excel</button>
            </div>
          </SectionCard>

          <SectionCard title="Automation Bot">
            {settings.automationProvider === 'cloudflare' && (
              <div style={{ padding: '10px 12px', background: 'color-mix(in srgb, var(--green) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--green) 22%, transparent)', borderRadius: 8, fontSize: 12, color: 'var(--green)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>☁️</span>
                <span><strong>Cloudflare Workers AI is active.</strong> AI calls <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>/api/ai</code> on this deployment — no API key required.</span>
              </div>
            )}
            <SettingRow label="Provider">
              <select className="field" value={settings.automationProvider} onChange={(e) => setSettings({ automationProvider: e.target.value as AppSettings['automationProvider'] })}>
                <option value="cloudflare">☁️ Cloudflare Workers AI (built-in)</option>
                <option value="local">Local rules engine</option>
                <option value="ollama">Ollama</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="openai-compatible">OpenAI-compatible</option>
              </select>
            </SettingRow>
            <SettingRow label="Model">
              {settings.automationProvider === 'cloudflare' ? (
                <select className="field" value={settings.automationModel} onChange={(e) => setSettings({ automationModel: e.target.value })}>
                  <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B (recommended)</option>
                  <option value="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B (fast)</option>
                  <option value="@cf/mistral/mistral-7b-instruct-v0.1">Mistral 7B</option>
                  <option value="@cf/google/gemma-7b-it-lora">Gemma 7B IT</option>
                  <option value="@cf/qwen/qwen1.5-14b-chat-awq">Qwen 1.5 14B</option>
                </select>
              ) : (
                <input className="field" value={settings.automationModel} onChange={(e) => setSettings({ automationModel: e.target.value })} />
              )}
            </SettingRow>
            <SettingRow label="Base URL">
              <input className="field" value={settings.automationBaseUrl} onChange={(e) => setSettings({ automationBaseUrl: e.target.value })} placeholder="Optional endpoint URL" />
            </SettingRow>
            <SettingRow label="API Key">
              <input className="field" type="password" value={settings.automationApiKey} onChange={(e) => setSettings({ automationApiKey: e.target.value })} placeholder="Leave blank for local/Cloudflare" />
            </SettingRow>
            <SettingRow label="Temperature" hint="0 = deterministic, 1 = creative">
              <input className="field" type="number" min="0" max="1" step="0.05" style={{ width: 80 }} value={settings.automationTemperature} onChange={(e) => setSettings({ automationTemperature: Number(e.target.value) || 0 })} />
            </SettingRow>
            <SettingRow label="Auto-fallback to Local" hint="Use local engine if provider call fails">
              <Toggle checked={settings.automationAutoFallback} onChange={(v) => setSettings({ automationAutoFallback: v })} />
            </SettingRow>
          </SectionCard>
        </div>
      )}

      {/* ── ALERTS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="settings-grid">
            <SectionCard title="Notification Triggers">
              <SettingRow label="Overdue Collections" hint="Alert when a deal's collection is overdue">
                <Toggle checked={settings.notifyOverdueCollections} onChange={(v) => setSettings({ notifyOverdueCollections: v })} />
              </SettingRow>
              <SettingRow label="Stale Deals" hint="Alert when a deal hasn't moved stages">
                <Toggle checked={settings.notifyStaleDeals} onChange={(v) => setSettings({ notifyStaleDeals: v })} />
              </SettingRow>
              <SettingRow label="New Deal Added" hint="Notify when any user creates a new deal">
                <Toggle checked={settings.notifyNewDealAdded} onChange={(v) => setSettings({ notifyNewDealAdded: v })} />
              </SettingRow>
              <SettingRow label="Commission Tier Change" hint="Alert when a rep moves to a different tier">
                <Toggle checked={settings.notifyTierChange} onChange={(v) => setSettings({ notifyTierChange: v })} />
              </SettingRow>
            </SectionCard>

            <SectionCard title="Alert Thresholds">
              <SettingRow label="Stale Deal Threshold" hint="Days without stage change before flagging">
                <input className="field" type="number" min={1} max={90} style={{ width: 80 }} value={settings.staleDealThresholdDays} onChange={(e) => setSettings({ staleDealThresholdDays: Number(e.target.value) || 10 })} />
              </SettingRow>
              <SettingRow label="Alert Lead Days" hint="Days before contract expiry to generate an alert">
                <input className="field" type="number" min={1} max={90} style={{ width: 80 }} value={settings.alertThresholdDays} onChange={(e) => setSettings({ alertThresholdDays: Number(e.target.value) || 10 })} />
              </SettingRow>
              <SettingRow label="Low Probability Threshold %" hint="Deals below this % are flagged at-risk">
                <input className="field" type="number" min={0} max={100} style={{ width: 80 }} value={settings.lowProbabilityThreshold} onChange={(e) => setSettings({ lowProbabilityThreshold: Number(e.target.value) || 50 })} />
              </SettingRow>
              <SettingRow label="High-Value Threshold (SAR)" hint="Deals above this value get a high-value flag">
                <input className="field" type="number" min={0} step={50000} style={{ width: 120 }} value={settings.highValueThresholdSar} onChange={(e) => setSettings({ highValueThresholdSar: Number(e.target.value) || 500000 })} />
              </SettingRow>
            </SectionCard>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Schedule calls, deadlines, and follow-ups. Overdue contracts and collections are surfaced automatically.
          </div>
          <ScheduledAlerts />
        </div>
      )}

      {/* ── AGENTS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-title">Agent Overview</div>
            <div className="settings-form">
              <div className="live-status-box">
                <div><strong>Healthy agents:</strong> {healthyAgents} / {AGENT_PROFILES.length}</div>
                <div><strong>Active agent:</strong> {activeAgent.name}</div>
                <div><strong>Config file:</strong> {activeAgent.file}</div>
              </div>
              <label className="settings-row">
                <span>Active Agent</span>
                <select className="field" value={settings.activeAgent} onChange={(e) => setSettings({ activeAgent: e.target.value })}>
                  {AGENT_PROFILES.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGENT_PROFILES.map((agent) => (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-header">
                  <h4>{agent.name}</h4>
                  <span className={`agent-health ${agent.healthy ? 'healthy' : 'degraded'}`}>
                    {agent.healthy ? 'Healthy' : 'Needs attention'}
                  </span>
                </div>
                <p>{agent.description}</p>
                <div className="agent-meta-grid">
                  <div><strong>Roles</strong><ul>{agent.roleBullets.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><strong>Tooling</strong><ul>{agent.toolPreferences.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
                {agent.healthNotes.length > 0 && (
                  <div className="agent-issues">{agent.healthNotes.map((note) => <div key={note}>{note}</div>)}</div>
                )}
                <div className="agent-actions">
                  <button className="btn btn-primary" onClick={() => setSettings({ activeAgent: agent.id })}>Activate</button>
                  <span className="agent-file-label">{agent.file}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACCOUNT TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="settings-grid">
          <SectionCard title="Current Session">
            <div className="live-status-box">
              <div><strong>Signed in as:</strong> {currentUser.name}</div>
              <div><strong>Email:</strong> {currentUser.email}</div>
              <div><strong>Role:</strong> {ROLE_LABELS[currentUser.role]}</div>
              {currentUser.region && <div><strong>Region:</strong> {currentUser.region}</div>}
            </div>
            <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={logout}>Sign out</button>
          </SectionCard>

          <SectionCard title="Workspace Users">
            <div className="agent-meta-grid">
              {users.map((user) => (
                <div key={user.id} className="agent-card">
                  <div className="agent-card-header">
                    <h4>{user.name}</h4>
                    <span className="agent-health healthy">{ROLE_LABELS[user.role]}</span>
                  </div>
                  <p>{user.email}</p>
                  <div className="agent-file-label">{user.region || 'Workspace access'}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── USER MANAGEMENT TAB ──────────────────────────────────────────────── */}
      {activeTab === 'users' && currentUser.role === 'super_admin' && (
        <div className="card">
          <UserManagement />
        </div>
      )}

      {/* ── SALES TARGETS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'targets' && ['super_admin', 'sales_manager'].includes(currentUser.role) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Set and adjust monthly revenue targets for each sales representative. Changes apply immediately.
          </div>
          <TargetsManager />
        </div>
      )}
    </div>
  )
}
