import { useState } from 'react'
import { useApp } from '../App'

export default function TargetsManager() {
  const { reps, updateRep, monthlyTargets } = useApp()
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [localTargets, setLocalTargets] = useState<Record<string, number>>(() =>
    Object.fromEntries(reps.map((r) => [r.id, r.monthly_target]))
  )

  const handleChange = (id: string, value: number) => {
    setLocalTargets((prev) => ({ ...prev, [id]: value }))
    setSaved((prev) => ({ ...prev, [id]: false }))
  }

  const handleSave = (id: string) => {
    updateRep(id, { monthly_target: localTargets[id] })
    setSaved((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000)
  }

  const totalTarget = reps.reduce((sum, r) => sum + r.monthly_target, 0)
  const totalSecured = reps.reduce((sum, r) => sum + r.secured, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary KPIs */}
      <div className="kpi-grid kpi-grid-3">
        <div className="kpi-box" style={{ '--kpi-color': 'var(--accent)' } as React.CSSProperties}>
          <div className="kpi-label">Total Monthly Target</div>
          <div className="kpi-value">{(totalTarget / 1e6).toFixed(2)}M SAR</div>
          <div className="kpi-sub">{reps.length} reps</div>
        </div>
        <div className="kpi-box" style={{ '--kpi-color': 'var(--green)' } as React.CSSProperties}>
          <div className="kpi-label">Total Secured</div>
          <div className="kpi-value">{(totalSecured / 1e6).toFixed(2)}M SAR</div>
          <div className="kpi-sub">{totalTarget > 0 ? `${Math.round((totalSecured / totalTarget) * 100)}% of target` : '—'}</div>
        </div>
        <div className="kpi-box" style={{ '--kpi-color': 'var(--amber)' } as React.CSSProperties}>
          <div className="kpi-label">Monthly Periods Tracked</div>
          <div className="kpi-value">{monthlyTargets.length}</div>
          <div className="kpi-sub">in monthly targets table</div>
        </div>
      </div>

      {/* Rep targets table */}
      <div className="data-grid-shell">
        <table className="tbl" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>Rep Name</th>
              <th>Role</th>
              <th>Region</th>
              <th style={{ textAlign: 'right' }}>Monthly Target (SAR)</th>
              <th style={{ textAlign: 'right' }}>Secured (SAR)</th>
              <th style={{ textAlign: 'right' }}>Attainment</th>
              <th style={{ width: 80 }}>Save</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((rep) => {
              const attainment = rep.monthly_target > 0 ? Math.round((rep.secured / rep.monthly_target) * 100) : 0
              const isDirty = localTargets[rep.id] !== rep.monthly_target
              return (
                <tr key={rep.id}>
                  <td><strong style={{ color: 'var(--text1)' }}>{rep.name}</strong></td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{rep.role}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{rep.region}</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      className="field"
                      type="number"
                      style={{ textAlign: 'right', maxWidth: 160, fontFamily: 'var(--mono)', fontSize: 12 }}
                      value={localTargets[rep.id] ?? rep.monthly_target}
                      min={0}
                      step={1000}
                      onChange={(e) => handleChange(rep.id, Number(e.target.value))}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {rep.secured.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                      color: attainment >= 100 ? 'var(--green)' : attainment >= 70 ? 'var(--amber)' : 'var(--red)',
                    }}>
                      {attainment}%
                    </span>
                  </td>
                  <td>
                    {saved[rep.id] ? (
                      <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700 }}>✓ Saved</span>
                    ) : (
                      <button
                        className={`btn btn-sm ${isDirty ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleSave(rep.id)}
                        disabled={!isDirty}
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text3)' }}>
        Changes are applied immediately to the live workspace. Targets affect commission tier calculations, attainment bars, and the Sales Team leaderboard.
      </p>
    </div>
  )
}
