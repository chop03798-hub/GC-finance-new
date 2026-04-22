import { useState } from 'react'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => string | null
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextError = onLogin(email, password)
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
          <button className="btn btn-primary auth-submit" type="submit">Sign In</button>
        </form>
      </div>
    </div>
  )
}
