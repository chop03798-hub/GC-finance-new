import { useState } from 'react'
import { ROLE_LABELS, USER_ROLES, getSeededUsers } from '../lib/auth'
import type { ManagedUser, UserRole } from '../lib/auth'
import { useApp } from '../App'

const ROLES: UserRole[] = USER_ROLES

const BLANK_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'sales_rep' as UserRole,
  region: '',
  repName: '',
}

function roleBadgeStyle(role: UserRole) {
  const map: Record<UserRole, { bg: string; color: string }> = {
    super_admin: { bg: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' },
    sales_manager: { bg: 'color-mix(in srgb, var(--green) 14%, transparent)', color: 'var(--green)' },
    finance: { bg: 'color-mix(in srgb, var(--amber) 14%, transparent)', color: 'var(--amber)' },
    sales_rep: { bg: 'color-mix(in srgb, var(--p) 14%, transparent)', color: 'var(--accent)' },
  }
  return map[role]
}

function redactSeededEmail() {
  return 'Hidden in UI'
}

export default function UserManagement() {
  const { managedUsers, addManagedUser, updateManagedUser, deleteManagedUser,
          seededUserOverrides, updateSeededUserOverride, currentUser } = useApp()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingSeededId, setEditingSeededId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [seededRoleForm, setSeededRoleForm] = useState<{ role: UserRole; region: string; repName: string }>({ role: 'finance', region: '', repName: '' })
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const seededUsers = getSeededUsers(seededUserOverrides)
  const allUsers = [
    ...seededUsers.map((u) => ({ ...u, isSeeded: true as const, password: '••••••', createdAt: 'Built-in', createdBy: 'System' })),
    ...managedUsers,
  ]

  const openAdd = () => {
    setForm(BLANK_FORM)
    setEditingId(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (user: ManagedUser) => {
    setForm({ name: user.name, email: user.email, password: user.password, role: user.role, region: user.region ?? '', repName: user.repName ?? '' })
    setEditingId(user.id)
    setFormError('')
    setFormOpen(true)
  }

  const openEditSeeded = (userId: string, currentRole: UserRole, currentRegion = '', currentRepName = '') => {
    setSeededRoleForm({ role: currentRole, region: currentRegion, repName: currentRepName })
    setEditingSeededId(userId)
  }

  const handleSubmit = () => {
    setFormError('')
    if (!form.name.trim()) { setFormError('Full name is required.'); return }
    if (editingId) {
      const patch: Partial<ManagedUser> = {
        name: form.name.trim(),
        role: form.role,
        region: form.region.trim() || undefined,
        repName: form.role === 'sales_rep' ? form.repName.trim() || undefined : undefined,
      }
      if (form.password && form.password !== '••••••') {
        if (form.password.length < 6) { setFormError('Password must be at least 6 characters.'); return }
        patch.password = form.password
      }
      updateManagedUser(editingId, patch)
      setFormOpen(false)
    } else {
      if (!form.email.trim()) { setFormError('Email address is required.'); return }
      if (!form.password || form.password.length < 6) { setFormError('Password must be at least 6 characters.'); return }
      const err = addManagedUser({
        name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role,
        region: form.region.trim() || undefined,
        repName: form.role === 'sales_rep' ? form.repName.trim() || undefined : undefined,
        createdBy: currentUser?.name ?? 'Admin', isSeeded: false,
      })
      if (err) { setFormError(err); return }
      setFormOpen(false)
    }
  }

  const handleSaveSeededRole = () => {
    if (!editingSeededId) return
    updateSeededUserOverride(editingSeededId, {
      role: seededRoleForm.role,
      region: seededRoleForm.region.trim() || undefined,
      repName: seededRoleForm.role === 'sales_rep' ? seededRoleForm.repName.trim() || undefined : undefined,
    })
    setEditingSeededId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {allUsers.length} users · {seededUsers.length} system · {managedUsers.length} managed
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="data-grid-shell">
        <table className="tbl" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Region</th>
              <th>Rep Name</th>
              <th>Password</th>
              <th>Type</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              const isSeeded = (user as any).isSeeded === true
              const isEditingThisSeeded = editingSeededId === user.id
              const { bg, color } = roleBadgeStyle(user.role)

              return (
                <tr key={user.id}>
                  <td>
                    <strong style={{ color: 'var(--text1)' }}>{user.name}</strong>
                    {user.id === currentUser?.id && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>YOU</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {isSeeded ? <span style={{ color: 'var(--text3)' }}>{redactSeededEmail()}</span> : user.email}
                  </td>
                  <td>
                    {isEditingThisSeeded ? (
                      <select
                        className="field"
                        style={{ fontSize: 11, padding: '3px 6px', minWidth: 140 }}
                        value={seededRoleForm.role}
                        onChange={(e) => setSeededRoleForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    ) : (
                      <span className="badge" style={{ background: bg, color, border: '1px solid currentColor', opacity: 0.9 }}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {isEditingThisSeeded ? (
                      <input className="field" style={{ fontSize: 11, padding: '3px 6px' }} value={seededRoleForm.region} onChange={(e) => setSeededRoleForm((f) => ({ ...f, region: e.target.value }))} placeholder="Region" />
                    ) : (user.region || '—')}
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {isEditingThisSeeded && seededRoleForm.role === 'sales_rep' ? (
                      <input className="field" style={{ fontSize: 11, padding: '3px 6px' }} value={seededRoleForm.repName} onChange={(e) => setSeededRoleForm((f) => ({ ...f, repName: e.target.value }))} placeholder="Rep name" />
                    ) : ((user as any).repName || '—')}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {isSeeded ? (
                      <span style={{ color: 'var(--text3)' }}>server-managed</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{showPasswords[user.id] ? (user as ManagedUser).password : '••••••'}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => setShowPasswords((p) => ({ ...p, [user.id]: !p[user.id] }))} style={{ padding: '1px 6px', fontSize: 10 }}>
                          {showPasswords[user.id] ? 'Hide' : 'Show'}
                        </button>
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 10, color: isSeeded ? 'var(--text3)' : 'var(--accent)', fontWeight: 600 }}>
                      {isSeeded ? 'System' : 'Managed'}
                    </span>
                    {isSeeded && seededUserOverrides[user.id] && (
                      <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>overridden</span>
                    )}
                  </td>
                  <td>
                    <div className="grid-row-actions">
                      {isSeeded && !isEditingThisSeeded && user.id !== currentUser?.id && (
                        <button className="btn btn-ghost btn-xs" onClick={() => openEditSeeded(user.id, user.role, user.region, (user as any).repName)}>
                          Edit Role
                        </button>
                      )}
                      {isEditingThisSeeded && (
                        <>
                          <button className="btn btn-primary btn-xs" onClick={handleSaveSeededRole}>Save</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditingSeededId(null)}>Cancel</button>
                        </>
                      )}
                      {!isSeeded && user.id !== currentUser?.id && (
                        <>
                          <button className="btn btn-ghost btn-xs" onClick={() => openEdit(user as ManagedUser)}>Edit</button>
                          {deleteConfirm === user.id ? (
                            <>
                              <button className="btn btn-danger btn-xs" onClick={() => { deleteManagedUser(user.id); setDeleteConfirm(null) }}>Confirm</button>
                              <button className="btn btn-ghost btn-xs" onClick={() => setDeleteConfirm(null)}>✕</button>
                            </>
                          ) : (
                            <button className="btn btn-danger btn-xs" onClick={() => setDeleteConfirm(user.id)}>Delete</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--bg) 60%, transparent)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)' }} onClick={() => setFormOpen(false)}>
          <div className="card" style={{ width: 'min(520px, 100%)', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="section-title" style={{ marginBottom: 2 }}>{editingId ? 'Edit User' : 'Add New User'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {editingId ? 'Update user details. Leave password blank to keep current.' : 'Fill in details to create a new workspace user.'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setFormOpen(false)}>✕</button>
            </div>
            {formError && (
              <div style={{ padding: '8px 12px', background: 'color-mix(in srgb, var(--red) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 28%, transparent)', borderRadius: 6, fontSize: 12, color: 'var(--red)' }}>{formError}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                <span>Full name *</span>
                <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Ahmed Al-Rashid" />
              </label>
              {!editingId && (
                <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                  <span>Email address *</span>
                  <input className="field" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@company.sa" />
                </label>
              )}
              <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                <span>{editingId ? 'New password (blank = keep current)' : 'Password *'}</span>
                <input className="field" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editingId ? 'Leave blank to keep' : 'Min 6 characters'} />
              </label>
              <label className="settings-row">
                <span>Role *</span>
                <select className="field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </label>
              <label className="settings-row">
                <span>Region</span>
                <input className="field" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="e.g. Riyadh" />
              </label>
              {form.role === 'sales_rep' && (
                <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                  <span>Rep name (must match a rep in Sales Team)</span>
                  <input className="field" value={form.repName} onChange={(e) => setForm((f) => ({ ...f, repName: e.target.value }))} placeholder="Exact name as in Sales Team" />
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
