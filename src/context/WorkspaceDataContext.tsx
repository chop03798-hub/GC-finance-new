import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { MOCK_DEALS, MOCK_FEEDBACKS, MOCK_MONTHLY, MOCK_REPS, fmtK, fmtSAR, repTier, STAGE_COLORS, STAGE_ORDER } from '../lib/data'
import { applyDealDataRules, buildDealFieldOptions } from '../lib/dealHierarchy'
import type { DealFieldOptions } from '../lib/dealHierarchy'
import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase'
import type { ClientFeedback, Deal, MonthlyTarget, Rep } from '../lib/supabase'
import {
  AUTH_SESSION_KEY,
  MANAGED_USERS_KEY,
  SEEDED_USER_OVERRIDES_KEY,
  SEEDED_USER_EMAILS,
  authenticateManagedUser,
  coerceUserRole,
  roleCanAccessPage,
  roleCanEditPage,
} from '../lib/auth'
import type { AppUser, ManagedUser, SeededUserOverrides } from '../lib/auth'
import {
  DEALS_KEY,
  MONTHLY_TARGETS_KEY,
  PAGE_VIEW_KEY,
  parseStored,
  REPS_KEY,
} from '../lib/workspace'
import type { AppSettings, ImportMode, PageView } from '../lib/workspace'
import type { PageId } from '../App'
import { useSettings } from './SettingsContext'

interface LiveStatus {
  configured: boolean
  connected: boolean
  mode: AppSettings['dataMode']
  source: 'mock' | 'local' | 'supabase'
  message: string
}

interface WorkspaceDataContextValue {
  deals: Deal[]
  reps: Rep[]
  dealFieldOptions: DealFieldOptions
  feedbacks: ClientFeedback[]
  monthlyTargets: MonthlyTarget[]
  settings: AppSettings
  setSettings: (patch: Partial<AppSettings>) => void
  currentUser: AppUser | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  managedUsers: ManagedUser[]
  addManagedUser: (user: Omit<ManagedUser, 'id' | 'createdAt'>) => string | null
  updateManagedUser: (id: string, patch: Partial<ManagedUser>) => void
  deleteManagedUser: (id: string) => void
  seededUserOverrides: SeededUserOverrides
  updateSeededUserOverride: (id: string, patch: Partial<Pick<AppUser, 'role' | 'region' | 'repName'>>) => void
  liveStatus: LiveStatus
  pageViews: Record<string, PageView>
  page: PageId
  setPage: (page: PageId) => void
  visibleNav: Array<{ id: PageId; label: string; icon: string }>
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  botOpen: boolean
  setBotOpen: React.Dispatch<React.SetStateAction<boolean>>
  canEditCurrentPage: boolean
  updateDeal: (id: string, patch: Partial<Deal>) => void
  updateRep: (id: string, patch: Partial<Rep>) => void
  bulkAddDeals: (rows: Deal[], mode: ImportMode) => void
  bulkAddReps: (rows: Rep[], mode: ImportMode) => void
  duplicateDeal: (id: string) => void
  duplicateRep: (id: string) => void
  deleteDeal: (id: string) => void
  deleteRep: (id: string) => void
  setPageView: (pageId: string, view: PageView) => void
  resetData: () => void
  roleCanAccess: (pageId: string) => boolean
  roleCanEdit: (pageId: string) => boolean
  fmtSAR: typeof fmtSAR
  fmtK: typeof fmtK
  repTier: typeof repTier
  STAGE_ORDER: typeof STAGE_ORDER
  STAGE_COLORS: typeof STAGE_COLORS
}

const WorkspaceDataContext = createContext<WorkspaceDataContextValue | null>(null)

const NAV_META: Array<{ id: PageId; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'pipeline', label: 'Pipeline', icon: '📋' },
  { id: 'kanban', label: 'Kanban', icon: '🗂' },
  { id: 'contracts', label: 'Contracts', icon: '📝' },
  { id: 'revenue', label: 'Revenue', icon: '💵' },
  { id: 'commissions', label: 'Commissions', icon: '💰' },
  { id: 'salesteam', label: 'Sales Team', icon: '👥' },
  { id: 'lost', label: 'Lost Deals', icon: '📉' },
  { id: 'clients', label: 'Clients', icon: '🏢' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const isSupabaseConfigured =
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY') &&
  SUPABASE_URL.startsWith('http')

export function WorkspaceDataProvider({ children }: PropsWithChildren) {
  const { settings, updateSettings } = useSettings()
  const normalizeStoredUser = (user: AppUser | null): AppUser | null =>
    user ? { ...user, role: coerceUserRole(user.role) } : null
  const normalizeManagedUsers = (users: ManagedUser[]): ManagedUser[] =>
    users.map((user) => ({ ...user, role: coerceUserRole(user.role) }))
  const normalizeSeededOverrides = (overrides: SeededUserOverrides): SeededUserOverrides =>
    Object.fromEntries(
      Object.entries(overrides).map(([id, override]) => [
        id,
        { ...override, role: override.role ? coerceUserRole(override.role) : override.role },
      ]),
    )
  const [deals, setDeals] = useState<Deal[]>(() => parseStored(localStorage.getItem(DEALS_KEY), MOCK_DEALS))
  const [reps, setReps] = useState<Rep[]>(() => parseStored(localStorage.getItem(REPS_KEY), MOCK_REPS))
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>(
    () => parseStored(localStorage.getItem(MONTHLY_TARGETS_KEY), MOCK_MONTHLY),
  )
  const [feedbacks] = useState<ClientFeedback[]>(() => MOCK_FEEDBACKS)
  const [pageViews, setPageViews] = useState<Record<string, PageView>>(
    () => parseStored(localStorage.getItem(PAGE_VIEW_KEY), {}),
  )
  const [page, setPage] = useState<PageId>(settings.defaultLandingPage)
  const [sidebarOpen, setSidebarOpen] = useState(settings.sidebarMode !== 'collapsed')
  const [botOpen, setBotOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    normalizeStoredUser(parseStored(localStorage.getItem(AUTH_SESSION_KEY), null)),
  )
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() =>
    normalizeManagedUsers(parseStored(localStorage.getItem(MANAGED_USERS_KEY), [])),
  )
  const [seededUserOverrides, setSeededUserOverrides] = useState<SeededUserOverrides>(() =>
    normalizeSeededOverrides(parseStored(localStorage.getItem(SEEDED_USER_OVERRIDES_KEY), {})),
  )
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    configured: isSupabaseConfigured,
    connected: false,
    mode: settings.dataMode,
    source: localStorage.getItem(DEALS_KEY) ? 'local' : 'mock',
    message: isSupabaseConfigured
      ? 'Supabase ready. Local editable cache is active.'
      : 'Supabase not configured. Running in editable local mode.',
  })

  useEffect(() => {
    const theme = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [settings.theme])

  useEffect(() => {
    setSidebarOpen(settings.sidebarMode !== 'collapsed')
  }, [settings.sidebarMode])

  useEffect(() => {
    localStorage.setItem(DEALS_KEY, JSON.stringify(deals))
  }, [deals])

  useEffect(() => {
    localStorage.setItem(REPS_KEY, JSON.stringify(reps))
  }, [reps])

  useEffect(() => {
    localStorage.setItem(MONTHLY_TARGETS_KEY, JSON.stringify(monthlyTargets))
  }, [monthlyTargets])

  useEffect(() => {
    localStorage.setItem(PAGE_VIEW_KEY, JSON.stringify(pageViews))
  }, [pageViews])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY)
    }
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(managedUsers))
  }, [managedUsers])

  useEffect(() => {
    localStorage.setItem(SEEDED_USER_OVERRIDES_KEY, JSON.stringify(seededUserOverrides))
  }, [seededUserOverrides])

  const login = async (email: string, password: string) => {
    const managedUser = authenticateManagedUser(email, password, managedUsers)
    if (managedUser) {
      setCurrentUser(managedUser)
      return null
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const payload = await response.json() as { user?: AppUser }
        if (payload.user) {
          const seededOverride = seededUserOverrides[payload.user.id] ?? {}
          const seededUser = {
            ...payload.user,
            ...seededOverride,
            role: coerceUserRole(seededOverride.role ?? payload.user.role),
          }
          setCurrentUser(seededUser)
          return null
        }
      }

      if (response.status === 401) return 'Invalid email or password.'
      return 'Sign-in service is unavailable right now.'
    } catch {
      return 'Sign-in service is unavailable right now.'
    }
  }

  const updateSeededUserOverride = (id: string, patch: Partial<Pick<AppUser, 'role' | 'region' | 'repName'>>) => {
    const normalizedPatch = patch.role ? { ...patch, role: coerceUserRole(patch.role) } : patch
    setSeededUserOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...normalizedPatch } }))
  }

  const addManagedUser = (user: Omit<ManagedUser, 'id' | 'createdAt'>): string | null => {
    const allEmails = [
      ...managedUsers.map((u) => u.email.toLowerCase()),
      ...SEEDED_USER_EMAILS,
    ]
    if (allEmails.includes(user.email.trim().toLowerCase())) return 'Email already in use.'
    if (!user.name.trim()) return 'Name is required.'
    if (!user.email.trim()) return 'Email is required.'
    if (!user.password.trim() || user.password.length < 6) return 'Password must be at least 6 characters.'
    const newUser: ManagedUser = {
      ...user,
      role: coerceUserRole(user.role),
      id: `user-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    }
    setManagedUsers((current) => [newUser, ...current])
    return null
  }

  const updateManagedUser = (id: string, patch: Partial<ManagedUser>) => {
    const normalizedPatch = patch.role ? { ...patch, role: coerceUserRole(patch.role) } : patch
    setManagedUsers((current) => current.map((u) => u.id === id ? { ...u, ...normalizedPatch } : u))
    if (currentUser?.id === id) {
      const { password: _pw, createdAt: _ca, createdBy: _cb, isSeeded: _is, ...safe } = normalizedPatch as ManagedUser
      setCurrentUser((prev) => prev ? { ...prev, ...safe, role: coerceUserRole(safe.role ?? prev.role) } : prev)
    }
  }

  const deleteManagedUser = (id: string) => {
    setManagedUsers((current) => current.filter((u) => u.id !== id))
  }

  const logout = () => {
    setCurrentUser(null)
    setBotOpen(false)
  }

  const roleCanAccess = (pageId: string) => (currentUser ? roleCanAccessPage(currentUser.role, pageId) : false)
  const roleCanEdit = (pageId: string) => (currentUser ? roleCanEditPage(currentUser.role, pageId) : false)

  const visibleNav = useMemo(() => {
    if (!currentUser) return []
    return NAV_META.filter((item) => roleCanAccess(item.id))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    if (!roleCanAccess(page)) {
      const fallback = visibleNav[0]?.id
      if (fallback) setPage(fallback)
    }
  }, [currentUser, page, visibleNav])

  useEffect(() => {
    let cancelled = false

    async function loadLiveData() {
      if (!isSupabaseConfigured || settings.dataMode === 'mock') {
        if (!cancelled) {
          setLiveStatus({
            configured: isSupabaseConfigured,
            connected: false,
            mode: settings.dataMode,
            source: localStorage.getItem(DEALS_KEY) ? 'local' : 'mock',
            message: settings.dataMode === 'mock'
              ? 'Mock mode selected. Editable local workspace active.'
              : 'Supabase credentials are missing. Editable local workspace active.',
          })
        }
        return
      }

      const [dealsResult, repsResult, monthlyResult] = await Promise.all([
        supabase.from('deals').select('*').order('date', { ascending: false }),
        supabase.from('reps').select('*').order('name', { ascending: true }),
        supabase.from('monthly_targets').select('*').order('month', { ascending: true }),
      ])

      if (cancelled) return

      if (!dealsResult.error && !repsResult.error && dealsResult.data && repsResult.data) {
        setDeals(dealsResult.data as Deal[])
        setReps(repsResult.data as Rep[])
        if (!monthlyResult.error && monthlyResult.data) {
          setMonthlyTargets(monthlyResult.data as MonthlyTarget[])
        }
        setLiveStatus({
          configured: true,
          connected: true,
          mode: settings.dataMode,
          source: 'supabase',
          message: 'Connected to Supabase live data.',
        })
        return
      }

      setLiveStatus({
        configured: true,
        connected: false,
        mode: settings.dataMode,
        source: localStorage.getItem(DEALS_KEY) ? 'local' : 'mock',
        message: 'Live fetch failed. Local editable workspace is still available.',
      })
    }

    loadLiveData()

    return () => {
      cancelled = true
    }
  }, [settings.dataMode])

  const syncRowPatch = async (table: 'deals' | 'reps', id: string, patch: object) => {
    if (!(settings.liveSync && liveStatus.connected)) return
    await supabase.from(table).update(patch).eq('id', id)
  }

  const syncBulk = async (table: 'deals' | 'reps', rows: Array<Deal | Rep>, mode: ImportMode) => {
    if (!(settings.liveSync && liveStatus.connected)) return
    if (mode === 'replace') {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }
    await supabase.from(table).upsert(rows)
  }

  const updateDeal = (id: string, patch: Partial<Deal>) => {
    if (!roleCanEdit(page)) return
    const currentDeal = deals.find((d) => d.id === id)
    if (!currentDeal) return
    if (currentUser?.role === 'sales_rep' && currentUser.repName && currentDeal.sales_exec_name !== currentUser.repName) return
    const scopedPatch = currentUser?.role === 'sales_rep' && currentUser.repName
      ? { ...patch, sales_exec_name: currentUser.repName }
      : patch
    const normalizedPatch = applyDealDataRules(currentDeal, scopedPatch, dealFieldOptions)
    setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, ...normalizedPatch } : deal)))
    syncRowPatch('deals', id, normalizedPatch)
  }

  const updateRep = (id: string, patch: Partial<Rep>) => {
    if (!roleCanEdit(page)) return
    const currentRep = reps.find((rep) => rep.id === id)
    if (!currentRep) return
    if (currentUser?.role === 'sales_rep' && currentUser.repName && currentRep.name !== currentUser.repName) return
    const normalizedPatch = currentUser?.role === 'sales_rep' && currentUser.repName
      ? { ...patch, name: currentUser.repName }
      : patch
    setReps((current) => current.map((rep) => (rep.id === id ? { ...rep, ...normalizedPatch } : rep)))
    syncRowPatch('reps', id, normalizedPatch)
  }

  const bulkAddDeals = (rows: Deal[], mode: ImportMode) => {
    if (!roleCanEdit(page)) return
    const normalizedRows = rows.map((row) => {
      const scopedRow = currentUser?.role === 'sales_rep' && currentUser.repName
        ? { ...row, sales_exec_name: currentUser.repName }
        : row
      return { ...scopedRow, ...applyDealDataRules(scopedRow, scopedRow, dealFieldOptions) }
    })
    const next = mode === 'replace' ? normalizedRows : [...normalizedRows, ...deals]
    setDeals(next)
    syncBulk('deals', next, mode)
  }

  const bulkAddReps = (rows: Rep[], mode: ImportMode) => {
    if (!roleCanEdit(page)) return
    const normalizedRows = rows.map((row) =>
      currentUser?.role === 'sales_rep' && currentUser.repName
        ? { ...row, name: currentUser.repName }
        : row
    )
    const next = mode === 'replace' ? normalizedRows : [...normalizedRows, ...reps]
    setReps(next)
    syncBulk('reps', next, mode)
  }

  const duplicateDeal = (id: string) => {
    if (!roleCanEdit(page)) return
    const source = deals.find((deal) => deal.id === id)
    if (!source) return
    const copy = { ...source, id: crypto.randomUUID(), company_name: `${source.company_name} Copy` }
    setDeals((current) => [copy, ...current])
  }

  const duplicateRep = (id: string) => {
    if (!roleCanEdit(page)) return
    const source = reps.find((rep) => rep.id === id)
    if (!source) return
    const copy = { ...source, id: crypto.randomUUID(), name: `${source.name} Copy` }
    setReps((current) => [copy, ...current])
  }

  const deleteDeal = (id: string) => {
    if (!roleCanEdit(page)) return
    if (currentUser?.role === 'sales_rep' && currentUser.repName) {
      const deal = deals.find((d) => d.id === id)
      if (deal && deal.sales_exec_name !== currentUser.repName) return
    }
    setDeals((current) => current.filter((deal) => deal.id !== id))
    if (settings.liveSync && liveStatus.connected) {
      void supabase.from('deals').delete().eq('id', id)
    }
  }

  const deleteRep = (id: string) => {
    if (!roleCanEdit(page)) return
    setReps((current) => current.filter((rep) => rep.id !== id))
    if (settings.liveSync && liveStatus.connected) {
      void supabase.from('reps').delete().eq('id', id)
    }
  }

  const setPageView = (pageId: string, view: PageView) => {
    setPageViews((current) => ({ ...current, [pageId]: view }))
  }

  const resetData = () => {
    setDeals(MOCK_DEALS)
    setReps(MOCK_REPS)
    setMonthlyTargets(MOCK_MONTHLY)
    setLiveStatus((current) => ({
      ...current,
      source: 'mock',
      connected: false,
      message: 'Seed data restored.',
    }))
  }

  const scopedDeals = useMemo(() => {
    if (!currentUser) return deals
    if (currentUser.role === 'sales_rep' && currentUser.repName) {
      return deals.filter((d) => d.sales_exec_name === currentUser.repName)
    }
    return deals
  }, [deals, currentUser])

  const scopedReps = useMemo(() => {
    if (!currentUser) return reps
    if (currentUser.role === 'sales_rep' && currentUser.repName) {
      return reps.filter((r) => r.name === currentUser.repName)
    }
    return reps
  }, [reps, currentUser])

  const dealFieldOptions = useMemo(() => buildDealFieldOptions(deals, reps), [deals, reps])

  const value = useMemo<WorkspaceDataContextValue>(() => ({
    deals: scopedDeals,
    reps: scopedReps,
    dealFieldOptions,
    feedbacks,
    monthlyTargets,
    settings,
    setSettings: updateSettings,
    currentUser,
    login,
    logout,
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    seededUserOverrides,
    updateSeededUserOverride,
    liveStatus,
    pageViews,
    page,
    setPage,
    visibleNav,
    sidebarOpen,
    setSidebarOpen,
    botOpen,
    setBotOpen,
    canEditCurrentPage: currentUser ? roleCanEdit(page) : false,
    updateDeal,
    updateRep,
    bulkAddDeals,
    bulkAddReps,
    duplicateDeal,
    duplicateRep,
    deleteDeal,
    deleteRep,
    setPageView,
    resetData,
    roleCanAccess,
    roleCanEdit,
    fmtSAR,
    fmtK,
    repTier,
    STAGE_ORDER,
    STAGE_COLORS,
  }), [
    scopedDeals,
    scopedReps,
    dealFieldOptions,
    deals,
    reps,
    feedbacks,
    monthlyTargets,
    settings,
    updateSettings,
    currentUser,
    managedUsers,
    seededUserOverrides,
    liveStatus,
    pageViews,
    page,
    visibleNav,
    sidebarOpen,
    botOpen,
  ])

  return (
    <WorkspaceDataContext.Provider value={value}>
      {children}
    </WorkspaceDataContext.Provider>
  )
}

export function useWorkspaceData() {
  const context = useContext(WorkspaceDataContext)
  if (!context) throw new Error('useWorkspaceData must be used within WorkspaceDataProvider')
  return context
}
