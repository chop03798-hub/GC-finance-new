import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { BriefcaseBusiness, ChartNoAxesCombined, ClipboardList, Coins, Goal, LayoutDashboard, LogOut, Moon, PanelsTopLeft, Search, Settings2, SunMedium, TrendingDown, Users, WalletCards, Zap } from 'lucide-react'
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
import NotificationBell from './components/NotificationBell'
import SearchPalette from './components/SearchPalette'
import { ROLE_LABELS } from './lib/auth'
import { SettingsProvider } from './context/SettingsContext'
import { WorkspaceDataProvider, useWorkspaceData } from './context/WorkspaceDataContext'
import type { Deal } from './lib/supabase'
import './App.css'

export type PageId =
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

const NAV: Array<{ id: PageId; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number }>; page: ComponentType }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, page: Overview },
  { id: 'pipeline', label: 'Pipeline', icon: ClipboardList, page: Pipeline },
  { id: 'kanban', label: 'Kanban', icon: PanelsTopLeft, page: Kanban },
  { id: 'contracts', label: 'Contracts', icon: BriefcaseBusiness, page: Contracts },
  { id: 'revenue', label: 'Revenue', icon: WalletCards, page: Revenue },
  { id: 'commissions', label: 'Commissions', icon: Coins, page: Commissions },
  { id: 'salesteam', label: 'Sales Team', icon: Users, page: SalesTeam },
  { id: 'lost', label: 'Lost Deals', icon: TrendingDown, page: LostDeals },
  { id: 'clients', label: 'Clients', icon: ChartNoAxesCombined, page: Clients },
  { id: 'goals', label: 'Goals', icon: Goal, page: Goals },
  { id: 'settings', label: 'Settings', icon: Settings2, page: Settings },
]

function AppShell() {
  const {
    deals,
    reps,
    feedbacks,
    settings,
    setSettings,
    currentUser,
    login,
    logout,
    visibleNav,
    page,
    setPage,
    sidebarOpen,
    setSidebarOpen,
    botOpen,
    setBotOpen,
    liveStatus,
    fmtK,
    fmtSAR,
  } = useWorkspaceData()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [pendingSelectedDeal, setPendingSelectedDeal] = useState<Deal | null>(null)

  const notificationItems = useMemo(() => {
    const staleDeals = deals.filter((deal) => deal.days_in_stage > 10).slice(0, 3)
    const highValueDeals = deals.filter((deal) => deal.quotation_value >= 500000).slice(0, 2)

    return [
      ...staleDeals.map((deal) => ({
        id: `stale-${deal.id}`,
        title: `${deal.company_name} is aging in ${deal.stage}`,
        detail: `${deal.days_in_stage} days without movement`,
        tone: 'alert' as const,
      })),
      ...highValueDeals.map((deal) => ({
        id: `value-${deal.id}`,
        title: `High-value deal needs attention`,
        detail: `${deal.company_name} at ${fmtK(deal.quotation_value)} SAR`,
        tone: 'success' as const,
      })),
    ]
  }, [deals, fmtK])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (page !== 'pipeline' || !pendingSelectedDeal) return

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gc-open-deal-record', { detail: pendingSelectedDeal }))
      setPendingSelectedDeal(null)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [page, pendingSelectedDeal])

  if (!currentUser) {
    return <AuthScreen onLogin={login} />
  }

  const activePageMeta = NAV.find((item) => item.id === page)
  const ActivePage = activePageMeta?.page ?? Overview
  const ActiveIcon = activePageMeta?.icon ?? LayoutDashboard
  const pipelineValue = deals
    .filter((deal) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
  const closedValue = deals
    .filter((deal) => ['Closed – With Contract', 'Closed – No Contract'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
  const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'

  const openDealsCount = deals.filter(
    (d) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(d.stage)
  ).length

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">GC</div>
          {sidebarOpen && (
            <div className="logo-text">
              <span className="logo-title">Grand Community</span>
              <span className="logo-sub">KSA Sales Command Center</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map((item) => {
            const navMeta = NAV.find((navItem) => navItem.id === item.id)
            const Icon = navMeta?.icon ?? LayoutDashboard
            const badge = item.id === 'pipeline' ? openDealsCount : null

            return (
              <button
                key={item.id}
                className={`nav-item${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}
                type="button"
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="nav-icon">
                  <Icon size={17} strokeWidth={2} />
                  {!sidebarOpen && badge !== null && badge > 0 && (
                    <span className="nav-badge-collapsed">{badge}</span>
                  )}
                </span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
                {sidebarOpen && badge !== null && badge > 0 && (
                  <span className="nav-badge">{badge}</span>
                )}
                {page === item.id && <span className="nav-indicator" />}
              </button>
            )
          })}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-kpis">
              <div className="mini-kpi">
                <span>Pipeline</span>
                <span className="accent">{fmtK(pipelineValue)} SAR</span>
              </div>
              <div className="mini-kpi">
                <span>Closed</span>
                <span className="green">{fmtK(closedValue)} SAR</span>
              </div>
              <div className="mini-kpi">
                <span>Source</span>
                <span style={{ color: liveStatus.connected ? 'var(--green)' : 'var(--text3)' }}>
                  {liveStatus.source}
                </span>
              </div>
            </div>
            <div className="sidebar-user-row">
              <div className="sidebar-avatar">
                {currentUser.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{currentUser.name}</span>
                <span className="sidebar-user-role">{ROLE_LABELS[currentUser.role]}</span>
              </div>
              <button className="sidebar-logout-btn" onClick={logout} title="Sign out" type="button">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="topbar">
        <button className="topbar-toggle" onClick={() => setSidebarOpen((current) => !current)} type="button">
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <div className="topbar-breadcrumb">
          <span className="topbar-brand">Grand Community</span>
          <span className="topbar-divider">›</span>
          <span className="topbar-page">
            <ActiveIcon size={16} strokeWidth={2} />
            {activePageMeta?.label}
          </span>
        </div>
        <div className="topbar-actions">
          <button className="topbar-search" onClick={() => setPaletteOpen(true)} type="button">
            <Search size={15} />
            <span>Search everything</span>
            <kbd>Ctrl K</kbd>
          </button>

          <div className={`topbar-source-badge ${liveStatus.connected ? 'live' : ''}`}>
            <span className="badge-dot" />
            {liveStatus.connected ? 'Live' : liveStatus.source === 'local' ? 'Local' : 'Mock'}
          </div>

          <NotificationBell items={notificationItems} />

          <button className="btn-icon" title={`Switch to ${nextTheme} mode`} onClick={() => setSettings({ theme: nextTheme })} type="button">
            {settings.theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
          </button>

          <button className="btn btn-primary topbar-bot" onClick={() => setBotOpen(true)} type="button">
            <Zap size={13} strokeWidth={2.5} />
            AI Assistant
          </button>

          <div className="topbar-user-chip" title={`${currentUser.email} · ${ROLE_LABELS[currentUser.role]}`}>
            <div className="topbar-avatar">
              {currentUser.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{currentUser.name.split(' ')[0]}</span>
              <span className="topbar-user-role">{ROLE_LABELS[currentUser.role]}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="main-content">
        <ActivePage />
      </main>
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
      <SearchPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        deals={deals}
        reps={reps}
        onNavigate={setPage}
        onSelectDeal={(deal) => {
          setPendingSelectedDeal(deal)
          setPage('pipeline')
        }}
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
