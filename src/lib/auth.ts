export type UserRole = 'super_admin' | 'sales_manager' | 'sales_rep' | 'finance'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  region?: string
  repName?: string
}

export interface ManagedUser extends AppUser {
  password: string
  createdAt: string
  createdBy: string
  isSeeded?: boolean
}

interface SeedUser extends AppUser {
  password: string
}

export const AUTH_SESSION_KEY = 'gc-ksa-auth-session-v1'
export const MANAGED_USERS_KEY = 'gc-ksa-managed-users-v1'
export const SEEDED_USER_OVERRIDES_KEY = 'gc-ksa-seeded-overrides-v1'

export type SeededUserOverrides = Record<string, Partial<Pick<AppUser, 'role' | 'region' | 'repName'>>>
export const USER_ROLES: UserRole[] = ['super_admin', 'sales_manager', 'sales_rep', 'finance']

export function coerceUserRole(role: unknown): UserRole {
  if (role === 'super_admin' || role === 'sales_manager' || role === 'sales_rep' || role === 'finance') {
    return role
  }
  return 'finance'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Rep',
  finance: 'Finance',
}

export const SEEDED_USERS: SeedUser[] = [
  { id: 'user-admin', name: 'Admin Operator', email: 'admin@trygc.local', password: 'admin123', role: 'super_admin', region: 'All Regions' },
  { id: 'user-manager', name: 'Sales Manager', email: 'manager@trygc.local', password: 'manager123', role: 'sales_manager', region: 'KSA' },
  { id: 'user-finance', name: 'Finance Controller', email: 'finance@trygc.local', password: 'finance123', role: 'finance', region: 'Finance' },
  { id: 'user-joud', name: 'Joud Ismael', email: 'joud@trygc.local', password: 'sales123', role: 'sales_rep', region: 'Riyadh', repName: 'Joud Ismael' },
]

function normalizePage(pageId: string) {
  return pageId.toLowerCase()
}

const ACCESS_BY_ROLE: Record<UserRole, string[]> = {
  super_admin: ['overview', 'pipeline', 'kanban', 'contracts', 'revenue', 'commissions', 'salesteam', 'lost', 'clients', 'goals', 'settings'],
  sales_manager: ['overview', 'pipeline', 'kanban', 'contracts', 'revenue', 'commissions', 'salesteam', 'lost', 'clients', 'goals', 'settings'],
  sales_rep: ['overview', 'pipeline', 'kanban', 'clients', 'goals'],
  finance: ['overview', 'contracts', 'revenue', 'commissions', 'clients', 'settings'],
}

export function sanitizeUser(user: SeedUser): AppUser {
  const { password: _password, ...safeUser } = user
  return { ...safeUser, role: coerceUserRole(safeUser.role) }
}

export function authenticateUser(
  email: string,
  password: string,
  managedUsers: ManagedUser[] = [],
  seededOverrides: SeededUserOverrides = {},
): AppUser | null {
  const normalizedEmail = email.trim().toLowerCase()
  const seededMatch = SEEDED_USERS.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
  )
  if (seededMatch) {
    const base = sanitizeUser(seededMatch)
    const overrides = seededOverrides[seededMatch.id] ?? {}
    return { ...base, ...overrides, role: coerceUserRole(overrides.role ?? base.role) }
  }

  const managedMatch = managedUsers.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
  )
  if (managedMatch) {
    const { password: _pw, createdAt: _ca, createdBy: _cb, isSeeded: _is, ...safe } = managedMatch
    return { ...safe, role: coerceUserRole(safe.role) }
  }
  return null
}

export function getSeededUsers(overrides: SeededUserOverrides = {}): AppUser[] {
  return SEEDED_USERS.map((u) => {
    const base = sanitizeUser(u)
    const override = overrides[u.id] ?? {}
    return { ...base, ...override, role: coerceUserRole(override.role ?? base.role) }
  })
}

export function roleCanAccessPage(role: UserRole, pageId: string) {
  return ACCESS_BY_ROLE[role].includes(normalizePage(pageId))
}

export function roleCanEditPage(role: UserRole, pageId: string) {
  return roleCanAccessPage(role, pageId)
}
