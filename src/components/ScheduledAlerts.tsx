import { useEffect, useMemo, useState } from 'react'
import { Bell, Calendar, CheckCircle, Clock, Mail, Trash2, XCircle } from 'lucide-react'
import { useApp } from '../App'

export interface ScheduledAlert {
  id: string
  type: 'call' | 'deadline' | 'follow_up' | 'contract_expiry' | 'collection'
  title: string
  detail: string
  dueDate: string
  dealId?: string
  repName?: string
  notifyEmail: boolean
  dismissed: boolean
  createdAt: string
}

const ALERTS_KEY = 'gc-ksa-scheduled-alerts-v1'
const DISMISSED_AUTO_KEY = 'gc-ksa-dismissed-auto-alerts-v1'

function loadAlerts(): ScheduledAlert[] {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) ?? '[]') } catch { return [] }
}

function saveAlerts(alerts: ScheduledAlert[]) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
}

function loadDismissedAuto(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_AUTO_KEY) ?? '[]')) } catch { return new Set() }
}

function saveDismissedAuto(ids: Set<string>) {
  localStorage.setItem(DISMISSED_AUTO_KEY, JSON.stringify([...ids]))
}

const TYPE_ICONS: Record<ScheduledAlert['type'], string> = {
  call: '📞',
  deadline: '⏰',
  follow_up: '🔁',
  contract_expiry: '📝',
  collection: '💰',
}

const TYPE_LABELS: Record<ScheduledAlert['type'], string> = {
  call: 'Scheduled Call',
  deadline: 'Deadline',
  follow_up: 'Follow-up',
  contract_expiry: 'Contract Expiry',
  collection: 'Collection Due',
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date()
}

function isDueSoon(dueDate: string, days = 3) {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= days
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function ScheduledAlerts() {
  const { deals, reps } = useApp()
  const [alerts, setAlerts] = useState<ScheduledAlert[]>(loadAlerts)
  const [dismissedAuto, setDismissedAuto] = useState<Set<string>>(loadDismissedAuto)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    type: 'call' as ScheduledAlert['type'],
    title: '',
    detail: '',
    dueDate: todayStr(),
    repName: '',
    notifyEmail: false,
  })
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all')
  const [notifBanner, setNotifBanner] = useState<ScheduledAlert | null>(null)

  useEffect(() => { saveAlerts(alerts) }, [alerts])
  useEffect(() => { saveDismissedAuto(dismissedAuto) }, [dismissedAuto])

  const autoAlerts = useMemo<ScheduledAlert[]>(() => {
    const result: ScheduledAlert[] = []
    const now = new Date()
    deals.forEach((deal) => {
      if (deal.contract_expiry) {
        const exp = new Date(deal.contract_expiry)
        const daysLeft = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysLeft <= 30 && daysLeft >= -7) {
          result.push({
            id: `auto-exp-${deal.id}`,
            type: 'contract_expiry',
            title: `Contract expiring: ${deal.company_name}`,
            detail: `Expires ${deal.contract_expiry} · ${deal.sales_exec_name}`,
            dueDate: deal.contract_expiry,
            dealId: deal.id,
            repName: deal.sales_exec_name,
            notifyEmail: false,
            dismissed: false,
            createdAt: now.toISOString(),
          })
        }
      }
      if (deal.collection_status === 'Overdue') {
        result.push({
          id: `auto-col-${deal.id}`,
          type: 'collection',
          title: `Overdue collection: ${deal.company_name}`,
          detail: `SAR ${deal.quotation_value.toLocaleString()} · owner ${deal.sales_exec_name}`,
          dueDate: deal.contract_expiry ?? todayStr(),
          dealId: deal.id,
          repName: deal.sales_exec_name,
          notifyEmail: false,
          dismissed: false,
          createdAt: now.toISOString(),
        })
      }
    })
    return result
  }, [deals])

  const allAlerts = useMemo(() => {
    const manualIds = new Set(alerts.map((a) => a.id))
    const merged = [
      ...alerts.filter((a) => !a.dismissed),
      ...autoAlerts.filter((a) => !manualIds.has(a.id) && !dismissedAuto.has(a.id)),
    ]
    if (filter === 'upcoming') return merged.filter((a) => isDueSoon(a.dueDate, 7) || new Date(a.dueDate) > new Date())
    if (filter === 'overdue') return merged.filter((a) => isOverdue(a.dueDate))
    return merged
  }, [alerts, autoAlerts, dismissedAuto, filter])

  useEffect(() => {
    if (notifBanner) return
    const urgent = allAlerts.find((a) => isOverdue(a.dueDate) || isDueSoon(a.dueDate, 1))
    if (urgent) setNotifBanner(urgent)
  }, [allAlerts, notifBanner])

  const openForm = () => {
    setForm({ type: 'call', title: '', detail: '', dueDate: todayStr(), repName: '', notifyEmail: false })
    setFormOpen(true)
  }

  const addAlert = () => {
    if (!form.title.trim()) return
    const newAlert: ScheduledAlert = {
      ...form,
      id: `alert-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      dismissed: false,
    }
    setAlerts((prev) => [newAlert, ...prev])
    setFormOpen(false)
  }

  const dismiss = (id: string) => {
    if (id.startsWith('auto-')) {
      setDismissedAuto((prev) => new Set([...prev, id]))
    } else {
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, dismissed: true } : a))
    }
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const sendEmailNotification = (alert: ScheduledAlert) => {
    const subject = encodeURIComponent(`[GC KSA] ${TYPE_LABELS[alert.type]}: ${alert.title}`)
    const body = encodeURIComponent(
      `Hello,\n\nThis is a reminder from GC KSA Sales Command Center.\n\nAlert: ${alert.title}\nDetails: ${alert.detail}\nDue: ${alert.dueDate}\n\nPlease take action as needed.\n\n— GC KSA Dashboard`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const overdueCount = allAlerts.filter((a) => isOverdue(a.dueDate)).length
  const upcomingCount = allAlerts.filter((a) => isDueSoon(a.dueDate, 7) && !isOverdue(a.dueDate)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notifBanner && (
        <div style={{ padding: '10px 14px', background: 'color-mix(in srgb, var(--amber) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--amber) 28%, transparent)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
          <Bell size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text1)' }}>{notifBanner.title}</strong>
            <span style={{ color: 'var(--text2)', marginLeft: 8 }}>{notifBanner.detail}</span>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => setNotifBanner(null)}>Dismiss</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {overdueCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--red)', background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 22%, transparent)', borderRadius: 99, padding: '3px 10px', fontWeight: 700 }}>
              <XCircle size={12} /> {overdueCount} overdue
            </span>
          )}
          {upcomingCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--amber)', background: 'color-mix(in srgb, var(--amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--amber) 22%, transparent)', borderRadius: 99, padding: '3px 10px', fontWeight: 700 }}>
              <Clock size={12} /> {upcomingCount} due soon
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="field" style={{ fontSize: 12 }} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All active</option>
            <option value="upcoming">Due in 7 days</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="btn btn-primary" onClick={openForm}>+ Schedule Alert</button>
        </div>
      </div>

      {allAlerts.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: 8 }}>
          <CheckCircle size={28} style={{ marginBottom: 10, opacity: .5 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>No active alerts</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Schedule calls, deadlines, and follow-ups using the button above.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allAlerts.map((alert) => {
            const overdue = isOverdue(alert.dueDate)
            const soon = isDueSoon(alert.dueDate, 3)
            const isAuto = alert.id.startsWith('auto-')
            return (
              <div key={alert.id} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                padding: '12px 14px', borderRadius: 8, border: `1px solid ${overdue ? 'color-mix(in srgb, var(--red) 22%, transparent)' : soon ? 'color-mix(in srgb, var(--amber) 22%, transparent)' : 'var(--border)'}`,
                background: overdue ? 'color-mix(in srgb, var(--red) 5%, transparent)' : soon ? 'color-mix(in srgb, var(--amber) 5%, transparent)' : 'var(--card)',
              }}>
                <div style={{ fontSize: 20 }}>{TYPE_ICONS[alert.type]}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: 'var(--text1)', fontSize: 13 }}>{alert.title}</strong>
                    <span style={{ fontSize: 10, color: overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      {overdue ? 'OVERDUE' : soon ? 'DUE SOON' : TYPE_LABELS[alert.type]}
                    </span>
                    {isAuto && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 999, padding: '1px 6px' }}>AUTO</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{alert.dueDate}</span>
                    {alert.repName && <span>👤 {alert.repName}</span>}
                    {alert.detail && <span style={{ color: 'var(--text3)' }}>{alert.detail}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-xs" title="Send email notification" onClick={() => sendEmailNotification(alert)}>
                    <Mail size={12} />
                  </button>
                  <button className="btn btn-ghost btn-xs" title="Dismiss" onClick={() => dismiss(alert.id)}>
                    <CheckCircle size={12} />
                  </button>
                  {!isAuto && (
                    <button className="btn btn-danger btn-xs" title="Delete" onClick={() => deleteAlert(alert.id)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--bg) 60%, transparent)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)' }} onClick={() => setFormOpen(false)}>
          <div className="card" style={{ width: 'min(480px, 100%)', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Schedule Alert</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setFormOpen(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="settings-row">
                <span>Type</span>
                <select className="field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ScheduledAlert['type'] }))}>
                  {(Object.keys(TYPE_LABELS) as ScheduledAlert['type'][]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </label>
              <label className="settings-row">
                <span>Due Date *</span>
                <input className="field" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </label>
              <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                <span>Title *</span>
                <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Follow-up call with Spark Digital" />
              </label>
              <label className="settings-row" style={{ gridColumn: '1 / -1' }}>
                <span>Details</span>
                <input className="field" value={form.detail} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))} placeholder="Optional context or notes" />
              </label>
              <label className="settings-row">
                <span>Assign to Rep</span>
                <select className="field" value={form.repName} onChange={(e) => setForm((f) => ({ ...f, repName: e.target.value }))}>
                  <option value="">— Unassigned —</option>
                  {reps.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addAlert} disabled={!form.title.trim()}>Create Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
