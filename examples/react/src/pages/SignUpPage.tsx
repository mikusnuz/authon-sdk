import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SignUp, SocialButtons, useAuthon } from '@authon/react'

type View = 'builtin' | 'custom'

export default function SignUpPage() {
  const [view, setView] = useState<View>('builtin')

  return (
    <div className="page-centered">
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Sign Up Demo
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Two approaches — toggle to compare
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div className="toggle-bar">
            <button
              className={`toggle-btn${view === 'builtin' ? ' active' : ''}`}
              onClick={() => setView('builtin')}
            >
              Built-in Component
            </button>
            <button
              className={`toggle-btn${view === 'custom' ? ' active' : ''}`}
              onClick={() => setView('custom')}
            >
              Custom Form
            </button>
          </div>
        </div>

        {view === 'builtin' ? <BuiltinSignUp /> : <CustomSignUp />}
      </div>
    </div>
  )
}

function BuiltinSignUp() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 5 }}>
            Built-in
          </span>
          <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {'<SignUp onSignUp={() => navigate("/")} />'}
          </code>
        </div>
      </div>
      <SignUp
        onSignUp={() => navigate('/')}
        onNavigateSignIn={() => navigate('/sign-in')}
      />
    </div>
  )
}

function CustomSignUp() {
  const navigate = useNavigate()
  const { client } = useAuthon()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')
    try {
      await client.signUpWithEmail(email, password, { displayName: displayName || undefined })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-2)', background: 'rgba(79, 70, 229, 0.12)', padding: '2px 8px', borderRadius: 5 }}>
            Custom
          </span>
          <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            client.signUpWithEmail(email, password, meta)
          </code>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="displayName">Display Name <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span></label>
          <input
            id="displayName"
            className="form-input"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            className="form-input"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <span className="loading-spinner" /> : 'Create account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div className="divider" style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>or sign up with</span>
        <div className="divider" style={{ flex: 1 }} />
      </div>

      <div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
          <code style={{ color: 'var(--accent)' }}>{'<SocialButtons />'}</code>
          {' — full-width buttons'}
        </div>
        <SocialButtons
          onSuccess={() => navigate('/')}
          onError={e => setError(e.message)}
        />
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/sign-in" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </div>
  )
}
