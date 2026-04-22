import { useState } from 'react'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<string | null>
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const nextError = await onLogin(email, password)
    setError(nextError ?? '')
    setSubmitting(false)
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
            <input
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Enter your email"
              autoComplete="username"
            />
          </label>
          <label className="settings-row">
            <span>Password</span>
            <input
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
          <div className="auth-caption">Use your assigned workspace login. Demo credentials are hidden from the interface.</div>
        </form>
      </div>
    </div>
  )
}
