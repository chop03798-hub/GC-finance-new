import { useState } from 'react'
import type { AppUser } from '../lib/auth'
import { ROLE_LABELS, getSeededUsers } from '../lib/auth'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => string | null
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState('admin@trygc.local')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const users = getSeededUsers()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextError = onLogin(email, password)
    setError(nextError ?? '')
  }

  const loginAs = (user: AppUser) => {
    setEmail(user.email)
    const passwordMap: Record<string, string> = {
      'admin@trygc.local': 'admin123',
      'manager@trygc.local': 'manager123',
      'finance@trygc.local': 'finance123',
      'joud@trygc.local': 'sales123',
    }
    const presetPassword = passwordMap[user.email] ?? ''
    setPassword(presetPassword)
    const nextError = onLogin(user.email, presetPassword)
    setError(nextError ?? '')
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-mark">GC</div>
          <div>
            <h1>GC Workspace Access</h1>
            <p>Sign in to the editable Airtable-style operating workspace.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="settings-row">
            <span>Email</span>
            <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label className="settings-row">
            <span>Password</span>
            <input className="field" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-primary auth-submit" type="submit">Sign In</button>
        </form>

        <div className="auth-presets">
          <div className="section-title">Quick demo roles</div>
          <div className="auth-preset-grid">
            {users.map((user) => (
              <button key={user.id} className="auth-preset" type="button" onClick={() => loginAs(user)}>
                <strong>{user.name}</strong>
                <span>{ROLE_LABELS[user.role]}</span>
                <span>{user.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
